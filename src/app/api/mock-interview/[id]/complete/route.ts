import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prisma } from "@/generated/client";
import { authOptions } from "@/lib/auth";
import { MockInterviewService } from "@/lib/mockInterviewService";
import { InterviewAIService } from "@/lib/interviewAIService";
import { InterviewStatus, INTERVIEW_XP } from "@/lib/interviewConstants";
import { prisma } from "@/lib/prisma";

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

    // Generate overall assessment
    const rounds = interview.rounds.map(
      (r: {
        questionText: string;
        responseText?: string | null;
        responseCode?: string | null;
        score?: number | null;
        feedback?: unknown;
      }) => ({
        questionText: r.questionText,
        responseText: r.responseText,
        responseCode: r.responseCode,
        score: r.score,
        feedback: r.feedback as Record<string, unknown> | null,
      })
    );

    // Check how many rounds actually have responses
    const answeredRounds = rounds.filter(
      (r: { responseText?: string | null; responseCode?: string | null }) =>
        r.responseText || r.responseCode
    );

    let assessment;

    if (answeredRounds.length === 0) {
      // No questions answered — skip AI, score is 0
      assessment = {
        overallScore: 0,
        hiringRecommendation: "No Hire" as const,
        categoryScores: {
          communication: 0,
          technicalDepth: 0,
          problemSolving: 0,
          codeQuality: 0,
          culturalFit: 0,
        },
        topStrengths: [],
        areasToImprove: ["Answer at least one question to receive feedback"],
        detailedFeedback:
          "The interview was ended before any questions were answered. No assessment can be provided.",
      };
    } else {
      try {
        assessment = await InterviewAIService.generateOverallAssessment(
          interview.company.slug,
          interview.company.name,
          rounds
        );
      } catch (err) {
        console.error("Failed to generate assessment:", err);
        const scores = rounds
          .map((r: { score?: number | null }) => r.score)
          .filter((s: number | null | undefined): s is number => s != null);
        const avg =
          scores.length > 0
            ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
            : 0;
        assessment = {
          overallScore: Math.round(avg * 10) / 10,
          hiringRecommendation: avg >= 7 ? "Lean Hire" : "Lean No Hire",
          categoryScores: {},
          topStrengths: [],
          areasToImprove: [],
          detailedFeedback:
            "Assessment could not be generated. Score based on round averages.",
        };
      }
    }

    // Complete the interview
    await MockInterviewService.completeInterview(
      id,
      assessment.overallScore,
      assessment as unknown as Prisma.InputJsonValue
    );

    // Award XP
    try {
      const xpAmount =
        assessment.overallScore >= 7
          ? INTERVIEW_XP.COMPLETED + INTERVIEW_XP.HIGH_SCORE_BONUS
          : INTERVIEW_XP.COMPLETED;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { xp: { increment: xpAmount } },
      });
    } catch (xpError) {
      console.error("Failed to award interview XP:", xpError);
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error completing interview:", error);
    return NextResponse.json(
      { error: "Failed to complete interview" },
      { status: 500 }
    );
  }
}
