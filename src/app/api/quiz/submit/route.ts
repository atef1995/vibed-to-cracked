import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressService } from "@/lib/progressService";
import { StudyPlanService } from "@/lib/services/studyPlanService";
import { QuizService } from "@/lib/quizService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized - please sign up to submit quizzes",
          code: "AUTHENTICATION_REQUIRED",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tutorialId, answers, timeSpent, quizId } = body;

    if (!tutorialId || !answers || !quizId) {
      return NextResponse.json(
        { error: "Missing required fields: tutorialId, answers, quizId" },
        { status: 400 }
      );
    }

    // SECURITY FIX: Fetch quiz from database instead of trusting client data
    // This prevents users from modifying quiz data before submission
    const quiz = await QuizService.getQuizById(quizId);

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Validate that the quiz belongs to the correct tutorial
    if (quiz.tutorialId !== tutorialId) {
      return NextResponse.json(
        { error: "Quiz does not belong to this tutorial" },
        { status: 400 }
      );
    }

    // Validate answer count matches quiz questions
    if (answers.length > quiz.questions.length) {
      return NextResponse.json(
        { error: "Invalid answer count" },
        { status: 400 }
      );
    }

    // Convert quiz to quizData format for ProgressService
    const quizData = {
      questions: quiz.questions,
      passingScore: 70, // Default passing score
    };

    const result = await ProgressService.submitQuizAttempt(
      session.user.id,
      {
        quizId,
        tutorialId,
        answers,
        timeSpent: timeSpent || 0,
        ChallengeMoodAdaptation: session.user.mood || "CHILL",
      },
      quizData
    );

    // Update study plan progress if quiz was passed
    if (result.passed && quizId) {
      try {
        await StudyPlanService.updateStudyPlanProgressOnCompletion(
          session.user.id,
          "quiz",
          quizId
        );
      } catch (error) {
        console.warn("Failed to update study plan progress:", error);
        // Don't fail the whole request if study plan update fails
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
