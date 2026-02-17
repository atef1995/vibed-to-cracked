import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCart, validateCartStock } from "@/lib/services/cartService";
import { createOrder } from "@/lib/services/storeService";
import { StripeHelpers } from "@/lib/stripeHelpers";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const supportedShippingCountries = ["SE", "DK", "FI", "NO"] as const;
    const headerCountry =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code");
    const normalizedHeaderCountry = headerCountry?.trim().toUpperCase();
    const selectedShippingCountry = supportedShippingCountries.includes(
      normalizedHeaderCountry as (typeof supportedShippingCountries)[number]
    )
      ? (normalizedHeaderCountry as "SE" | "DK" | "FI" | "NO")
      : "SE";

    const discountRate = 0.1;

    // Support both authenticated and guest checkout
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    const userName = session?.user?.name;

    if (userId && !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Email is required" },
        },
        { status: 400 }
      );
    }

    // Get anonymous session ID for cart lookup before login
    const anonymousSessionId = request.cookies.get(
      "anonymous_session_id"
    )?.value;

    // Get user's cart
    const cart = await getCart(userId, anonymousSessionId);

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Cart is empty" },
        },
        { status: 400 }
      );
    }

    const totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const isFreeShipping = totalQuantity > 5;
    const shippingAmount = isFreeShipping
      ? 0
      : selectedShippingCountry === "SE"
        ? 5999
        : 15000;

    // Validate stock availability
    const stockValidation = await validateCartStock(cart.id);
    if (!stockValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Some items are unavailable or out of stock",
            details: stockValidation.errors,
          },
        },
        { status: 400 }
      );
    }

    // Create order in database
    const orderItems = cart.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const orderResult = await createOrder({
      userId: userId || undefined,
      guestEmail: undefined,
      items: orderItems,
      metadata: { cartId: cart.id },
    });

    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(
        {
          success: false,
          error: { message: orderResult.error || "Failed to create order" },
        },
        { status: 500 }
      );
    }

    const order = orderResult.order;
    // Get or create Stripe customer for authenticated users
    let customerId: string | undefined;

    if (userId) {
      const authenticatedEmail = userEmail as string;

      // For logged-in users, use existing helper
      customerId = await StripeHelpers.validateAndGetCustomer(
        userId,
        authenticatedEmail,
        userName || undefined
      );
    }

    if (userId && !customerId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Failed to create customer" },
        },
        { status: 500 }
      );
    }

    // Create line items for Stripe
    const lineItems = cart.items.map((item) => {
      const description = item.product.description?.trim();

      return {
        price_data: {
          currency: item.product.currency,
          product_data: {
            name: item.product.name,
            ...(description ? { description } : {}),
            images: item.product.images.slice(0, 8), // Stripe max 8 images
            metadata: {
              productId: item.product.id,
              type: item.product.type,
            },
          },
          unit_amount: Math.round(
            item.product.price * (1 - discountRate) * 100
          ), // Apply 10% sale and convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      ...(customerId
        ? { customer: customerId }
        : { customer_creation: "always" }),
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/store/cart`,
      metadata: {
        orderId: order.id,
        userId: userId || "",
        guestEmail: userId ? "" : "collected_in_checkout",
        shippingCountry: selectedShippingCountry,
        discountPercent: "10",
        freeShipping: isFreeShipping ? "true" : "false",
        type: "store_order",
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingAmount,
              currency: "sek",
            },
            display_name: isFreeShipping
              ? "Free Shipping"
              : selectedShippingCountry === "SE"
                ? "Shipping (Sweden)"
                : "Shipping (DK/FI/NO)",
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: [
          selectedShippingCountry as "SE" | "DK" | "FI" | "NO",
        ],
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: checkoutSession.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to create checkout session" },
      },
      { status: 500 }
    );
  }
}
