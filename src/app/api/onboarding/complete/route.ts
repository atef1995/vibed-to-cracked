import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  completeOnboarding,
  validateOnboardingInput,
} from "@/lib/settingsService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mood, experienceLevel, learningGoals, dailyGoalMinutes } = body;

    if (!mood || !experienceLevel || !learningGoals || !dailyGoalMinutes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validationError = validateOnboardingInput({
      mood,
      experienceLevel,
      learningGoals,
      dailyGoalMinutes,
    });

    if (validationError) {
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }

    await completeOnboarding(session.user.id, {
      mood,
      experienceLevel,
      learningGoals,
      dailyGoalMinutes,
    });

    return NextResponse.json({ completed: true });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
