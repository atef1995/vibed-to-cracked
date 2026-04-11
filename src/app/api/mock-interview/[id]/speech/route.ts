import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MockInterviewService } from "@/lib/mockInterviewService";
import { InterviewAIService } from "@/lib/interviewAIService";

type SpeechType = "intro" | "question" | "closing";
const VALID_TYPES: SpeechType[] = ["intro", "question", "closing"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, questionText, questionType, starterCode } = body;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid speech type" },
        { status: 400 }
      );
    }

    const interview = await MockInterviewService.getInterview(
      id,
      session.user.id
    );
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const { company } = interview;
    const mood =
      ((session as unknown as Record<string, unknown>).mood as string) || "CHILL";

    let speech = "";

    if (type === "intro") {
      const questionCount = interview.rounds.length;
      speech = await InterviewAIService.generateIntro(
        company.slug,
        company.name,
        company.interviewStyle || "",
        mood,
        session.user.name || "there",
        interview.interviewType,
        questionCount
      );
    } else if (type === "question") {
      if (!questionText) {
        return NextResponse.json(
          { error: "questionText is required for question speech" },
          { status: 400 }
        );
      }
      speech = await InterviewAIService.generateQuestionDelivery(
        company.slug,
        company.name,
        company.interviewStyle || "",
        mood,
        questionText,
        questionType || "BEHAVIORAL",
        starterCode
      );
    } else if (type === "closing") {
      speech = await InterviewAIService.generateClosing(
        company.slug,
        company.name,
        company.interviewStyle || "",
        mood
      );
    }

    return NextResponse.json({ data: { speech } });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
