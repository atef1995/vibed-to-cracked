import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MockInterviewService } from "@/lib/mockInterviewService";
import { InterviewAIService } from "@/lib/interviewAIService";
import { InterviewStatus, ResponseType } from "@/lib/interviewConstants";

const VALID_RESPONSE_TYPES = Object.values(ResponseType);

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
    const { responseText, responseCode, responseType, roundId } =
      await request.json();

    if (!responseType || !VALID_RESPONSE_TYPES.includes(responseType)) {
      return NextResponse.json(
        { error: "Invalid response type" },
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

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      return NextResponse.json(
        { error: "Interview is not in progress" },
        { status: 400 }
      );
    }

    // Find the current round to update
    const currentRound = roundId
      ? interview.rounds.find((r: { id: string }) => r.id === roundId)
      : interview.rounds.find((r: { responseText: string | null }) => !r.responseText);

    if (!currentRound) {
      return NextResponse.json(
        { error: "No pending round found" },
        { status: 400 }
      );
    }

    // Save response
    await MockInterviewService.updateRound(currentRound.id, {
      responseText: responseText || null,
      responseCode: responseCode || null,
      responseType,
    });

    // Evaluate the response
    const question = currentRound.question || currentRound;
    let evaluation = null;
    try {
      evaluation = await InterviewAIService.evaluateResponse(
        currentRound.questionText,
        responseText || responseCode || "",
        question.evaluationCriteria || {},
        question.type || "BEHAVIORAL",
        responseCode
      );

      // Save evaluation score/feedback to round
      await MockInterviewService.updateRound(currentRound.id, {
        score: evaluation.score,
        feedback: evaluation as unknown as Record<string, unknown>,
      });
    } catch (err) {
      console.error("Failed to evaluate response:", err);
    }

    // Check if there's a next round
    const nextRound = interview.rounds.find(
      (r: { id: string; responseText: string | null }) =>
        r.id !== currentRound.id && !r.responseText
    );

    let transitionSpeech = "";
    const mood = (session as Record<string, unknown>).mood as string || "CHILL";
    const company = interview.company;

    if (nextRound) {
      // Generate transition to next question
      try {
        transitionSpeech = await InterviewAIService.generateTransition(
          company.slug,
          company.name,
          company.interviewStyle || "",
          mood,
          currentRound.questionText,
          nextRound.questionText
        );
      } catch (err) {
        console.error("Failed to generate transition:", err);
      }
    }

    return NextResponse.json({
      evaluation,
      nextRound: nextRound
        ? {
            id: nextRound.id,
            questionText: nextRound.questionText,
            order: nextRound.order,
            question: nextRound.question,
          }
        : null,
      transitionSpeech,
      isComplete: !nextRound,
    });
  } catch (error) {
    console.error("Error submitting interview response:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
