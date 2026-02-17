import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
    });

    console.log(
      `[Verify] Session ${sessionId} - payment_status: ${session.payment_status}`
    );

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const paymentStatus = session.payment_status as string;

    // Accept both "paid" and "processing" to handle timing delays in test mode
    if (paymentStatus !== "paid" && paymentStatus !== "processing") {
      console.log(
        `[Verify] Session ${sessionId} - rejected: payment_status is ${paymentStatus}`
      );
      return NextResponse.json(
        { error: "Payment not completed", payment_status: paymentStatus },
        { status: 400 }
      );
    }

    // If still processing, return a different status to allow retry
    if (paymentStatus === "processing") {
      console.log(`[Verify] Session ${sessionId} - still processing`);
      return NextResponse.json(
        { error: "Payment is still processing", payment_status: "processing" },
        { status: 202 }
      );
    }

    // Find the order using the Stripe session ID
    const order = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency check: if order already PAID, return success without updating
    if (order.status === OrderStatus.PAID) {
      console.log(`[Verify] Order ${order.id} already PAID - skipping update`);
      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          status: order.status,
          total: order.total,
          items: order.items.map((item) => ({
            id: item.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.priceAtPurchase,
          })),
          createdAt: order.createdAt,
        },
      });
    }

    const metadata =
      order.metadata && typeof order.metadata === "object"
        ? (order.metadata as Record<string, unknown>)
        : null;
    const cartId =
      metadata && typeof metadata.cartId === "string" ? metadata.cartId : null;
    const collectedGuestEmail = session.customer_details?.email || null;

    console.log(`[Verify] Updating order ${order.id} to PAID status`);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          ...(order.guestEmail
            ? {}
            : collectedGuestEmail
              ? { guestEmail: collectedGuestEmail }
              : {}),
        },
      });

      if (cartId) {
        await tx.cartItem.deleteMany({
          where: { cartId },
        });
        console.log(`[Verify] Cleared cart ${cartId}`);
      }
    });

    console.log(`[Verify] Order ${order.id} successfully updated to PAID`);

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        total: updatedOrder.total,
        items: updatedOrder.items.map((item) => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.priceAtPurchase,
        })),
        createdAt: updatedOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("Error verifying checkout session:", error);
    return NextResponse.json(
      { error: "Failed to verify checkout session" },
      { status: 500 }
    );
  }
}
