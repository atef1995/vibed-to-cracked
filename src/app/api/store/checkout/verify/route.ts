import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Ownership check: authenticated users can only view their own orders
    if (order.userId) {
      const authSession = await getServerSession(authOptions);
      if (!authSession?.user?.id || order.userId !== authSession.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      // Guest orders: verify the email matches what Stripe collected
      const collectedEmail = session.customer_details?.email;
      if (!collectedEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (order.guestEmail && order.guestEmail !== collectedEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Read-only: return current order state. The webhook handles fulfillment.
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
  } catch (error) {
    console.error("Error verifying checkout session:", error);
    return NextResponse.json(
      { error: "Failed to verify checkout session" },
      { status: 500 }
    );
  }
}
