import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SubscriptionService,
  Plan,
  SubscriptionStatus,
} from "@/lib/subscriptionService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, plan } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!plan || !["VIBED", "CRACKED"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    console.log(
      `[AUDIT] Admin ${session.user.id} manually updating user ${userId} subscription to ${plan}`
    );

    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

    await SubscriptionService.updateUserSubscription(
      userId,
      plan as Plan,
      SubscriptionStatus.ACTIVE,
      subscriptionEndsAt
    );

    return NextResponse.json({
      success: true,
      message: `Successfully updated subscription to ${plan}`,
      endsAt: subscriptionEndsAt,
    });
  } catch (error) {
    console.error("Manual update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
