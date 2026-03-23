import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TutorService } from "@/lib/tutorService";
import { PLAN_CONFIGS, Plan } from "@/lib/subscriptionConstants";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlan = (session.user.subscription || "FREE") as Plan;
    const planConfig = PLAN_CONFIGS[userPlan] || PLAN_CONFIGS[Plan.FREE];
    const limit = planConfig.aiTutorMessagesPerDay;
    const used = await TutorService.getUserDailyMessageCount(session.user.id);

    return NextResponse.json({
      used,
      limit,
      remaining: limit === null ? null : Math.max(0, limit - used),
    });
  } catch (error) {
    console.error("Error fetching tutor usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
