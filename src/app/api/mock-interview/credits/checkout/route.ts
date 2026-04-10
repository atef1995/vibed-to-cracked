import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InterviewCreditService } from "@/lib/interviewCreditService";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packSlug } = await request.json();
    if (!packSlug) {
      return NextResponse.json({ error: "Missing packSlug" }, { status: 400 });
    }

    const pack = await InterviewCreditService.getCreditPackBySlug(packSlug);
    if (!pack) {
      return NextResponse.json(
        { error: "Credit pack not found" },
        { status: 404 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_creation: "always",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: pack.currency,
            product_data: {
              name: pack.name,
              description: `${pack.credits} AI Mock Interview Credits`,
            },
            unit_amount: Math.round(pack.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/mock-interview/credits?purchased=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/mock-interview/credits`,
      metadata: {
        type: "interview_credits",
        packSlug: pack.slug,
        userId: session.user.id,
        credits: String(pack.credits),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating credit checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
