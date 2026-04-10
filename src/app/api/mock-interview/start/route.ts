import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MockInterviewService } from "@/lib/mockInterviewService";
import { InterviewCreditService } from "@/lib/interviewCreditService";
import { InterviewAIService } from "@/lib/interviewAIService";
import { InterviewType } from "@/lib/interviewConstants";

const VALID_TYPES = Object.values(InterviewType);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companySlug, interviewType, isPreview } = await request.json();

    if (!companySlug) {
      return NextResponse.json(
        { error: "Missing companySlug" },
        { status: 400 }
      );
    }

    const company = await MockInterviewService.getCompanyBySlug(companySlug);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (isPreview) {
      const { interview } = await MockInterviewService.startPreview(
        session.user.id,
        company.id
      );
      return NextResponse.json({ interview });
    }

    if (!interviewType || !VALID_TYPES.includes(interviewType)) {
      return NextResponse.json(
        { error: "Invalid interview type" },
        { status: 400 }
      );
    }

    const hasCredits = await InterviewCreditService.hasCredits(session.user.id);
    if (!hasCredits) {
      return NextResponse.json(
        { error: "No interview credits remaining" },
        { status: 402 }
      );
    }

    const { interview, questions } = await MockInterviewService.startInterview(
      session.user.id,
      company.id,
      interviewType
    );

    // Generate intro speech
    const mood =
      ((session as Record<string, unknown>).mood as string) || "CHILL";
    let introSpeech = "";
    try {
      introSpeech = await InterviewAIService.generateIntro(
        companySlug,
        company.name,
        company.interviewStyle || "",
        mood,
        session.user.name || "there",
        interviewType,
        questions?.length || 5
      );
    } catch (err) {
      console.error("Failed to generate intro speech:", err);
    }

    return NextResponse.json({ interview, introSpeech });
  } catch (error) {
    console.error("Error starting interview:", error);
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 500 }
    );
  }
}
