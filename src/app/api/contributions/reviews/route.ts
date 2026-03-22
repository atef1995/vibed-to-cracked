/**
 * API Route: GET /api/contributions/reviews
 *
 * Get all review assignments for the authenticated user
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ReviewAssignment = {
  id: string;
  status: string;
  submittedAt: Date | null;
  createdAt: Date;
  overallScore: number | null;
  submissionId: string;
  type: string;
  submission: {
    prTitle: string | null;
    featureTitle: string | null;
    githubPrUrl: string | null;
    ciPassed: boolean | null;
    testsPassed: boolean | null;
    lintPassed: boolean | null;
    project: { title: string };
    user: { username: string | null; image: string | null };
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Fetch all review assignments for this user
    const assignments = await prisma.contributionReview.findMany({
      where: {
        reviewerId: session.user.id,
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { createdAt: "desc" },
      ],
      include: {
        submission: {
          select: {
            id: true,
            prTitle: true,
            featureTitle: true,
            githubPrUrl: true,
            ciPassed: true,
            testsPassed: true,
            lintPassed: true,
            project: {
              select: {
                title: true,
              },
            },
            user: {
              select: {
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Calculate statistics
    const pending = (assignments as ReviewAssignment[]).filter(
      (a: ReviewAssignment) => a.status === "PENDING"
    ).length;
    const totalCompleted = (assignments as ReviewAssignment[]).filter(
      (a: ReviewAssignment) => a.status !== "PENDING" && a.submittedAt !== null
    ).length;

    // Completed this week (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const completedThisWeek = (assignments as ReviewAssignment[]).filter(
      (a: ReviewAssignment) =>
        a.status !== "PENDING" &&
        a.submittedAt !== null &&
        new Date(a.submittedAt) >= oneWeekAgo
    ).length;

    // Calculate average score from completed reviews
    const completedWithScores = (assignments as ReviewAssignment[]).filter(
      (a: ReviewAssignment) => a.overallScore !== null && a.submittedAt !== null
    );
    const averageScore =
      completedWithScores.length > 0
        ? completedWithScores.reduce(
            (sum: number, a: ReviewAssignment) => sum + (a.overallScore || 0),
            0
          ) / completedWithScores.length
        : 0;

    // Format assignments for frontend
    const formattedAssignments = (assignments as ReviewAssignment[]).map(
      (a: ReviewAssignment) => ({
        id: a.id,
        submissionId: a.submissionId,
        status: a.status,
        type: a.type,
        createdAt: a.createdAt.toISOString(),
        submittedAt: a.submittedAt?.toISOString() || null,
        overallScore: a.overallScore,
        submission: {
          prTitle: a.submission.prTitle,
          featureTitle: a.submission.featureTitle,
          githubPrUrl: a.submission.githubPrUrl,
          ciPassed: a.submission.ciPassed,
          testsPassed: a.submission.testsPassed,
          lintPassed: a.submission.lintPassed,
          project: {
            title: a.submission.project.title,
          },
          user: {
            username: a.submission.user.username,
            image: a.submission.user.image,
          },
        },
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        assignments: formattedAssignments,
        stats: {
          pending,
          completedThisWeek,
          totalCompleted,
          averageScore,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching review queue:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch review queue",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      submissionId,
      type = "PEER",
      codeQualityScore,
      functionalityScore,
      documentationScore,
      bestPracticesScore,
      strengths,
      improvements,
      suggestions,
      filesReviewed = 0,
      commentsAdded = 0,
      githubReviewUrl,
    } = body;

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "submissionId is required" },
        { status: 400 }
      );
    }

    const submission = await prisma.contributionSubmission.findUnique({
      where: { id: submissionId },
      include: { project: true },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot review your own submission" },
        { status: 403 }
      );
    }

    if (type === "MENTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only mentors can submit mentor reviews" },
        { status: 403 }
      );
    }

    // Validate scores are in 0-100 range
    const scoreFields = {
      codeQualityScore,
      functionalityScore,
      documentationScore,
      bestPracticesScore,
    };
    for (const [field, value] of Object.entries(scoreFields)) {
      if (
        value != null &&
        (typeof value !== "number" || value < 0 || value > 100)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} must be a number between 0 and 100`,
          },
          { status: 400 }
        );
      }
    }

    const weights = {
      functionality: 0.4,
      codeQuality: 0.3,
      bestPractices: 0.2,
      documentation: 0.1,
    };

    const overallScore =
      functionalityScore != null &&
      codeQualityScore != null &&
      documentationScore != null &&
      bestPracticesScore != null
        ? functionalityScore * weights.functionality +
          codeQualityScore * weights.codeQuality +
          bestPracticesScore * weights.bestPractices +
          documentationScore * weights.documentation
        : null;

    let status = "COMPLETED";
    if (overallScore && overallScore < 60) {
      status = "CHANGES_REQUESTED";
    } else if (overallScore && overallScore >= 80) {
      status = "APPROVED";
    }

    // Create review and update submission counter atomically
    let review;
    let updatedSubmission;
    try {
      [review, updatedSubmission] = await prisma.$transaction([
        prisma.contributionReview.create({
          data: {
            submissionId,
            reviewerId: session.user.id,
            type,
            status,
            codeQualityScore,
            functionalityScore,
            documentationScore,
            bestPracticesScore,
            overallScore,
            strengths,
            improvements,
            suggestions,
            filesReviewed,
            commentsAdded,
            githubReviewUrl,
            submittedAt: new Date(),
          },
        }),
        prisma.contributionSubmission.update({
          where: { id: submissionId },
          data: {
            peerReviewsReceived: { increment: type === "PEER" ? 1 : 0 },
            mentorReviewStatus:
              type === "MENTOR"
                ? status === "APPROVED"
                  ? "APPROVED"
                  : "CHANGES_REQUESTED"
                : undefined,
          },
          include: { reviews: true },
        }),
      ]);
    } catch (e: unknown) {
      if ((e as { code?: string }).code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            error: "You have already reviewed this submission",
          },
          { status: 409 }
        );
      }
      throw e;
    }

    const peerReviewsComplete =
      updatedSubmission.peerReviewsReceived >=
      updatedSubmission.peerReviewsNeeded;
    const mentorApproved = updatedSubmission.mentorReviewStatus === "APPROVED";

    const { awardReviewXP } = await import("@/lib/services/xpService");
    await awardReviewXP(session.user.id, review.id, type as "PEER" | "MENTOR");

    const { checkReviewAchievements, checkPerfectScoreAchievement } =
      await import("@/lib/services/achievementService");
    await checkReviewAchievements(session.user.id);

    if (overallScore === 100) {
      await checkPerfectScoreAchievement(submission.userId, overallScore);
    }

    await prisma.notification.create({
      data: {
        userId: submission.userId,
        type: "CONTRIBUTION_REVIEW",
        title: `${type === "PEER" ? "Peer" : "Mentor"} Review Received`,
        message: `Your PR for "${submission.featureTitle}" received a review with an overall score of ${overallScore?.toFixed(0)}%`,
        data: {
          reviewId: review.id,
          submissionId: submission.id,
          overallScore,
          status,
        },
      },
    });

    return NextResponse.json({
      success: true,
      review,
      submissionStatus: {
        peerReviewsComplete,
        mentorApproved,
        readyForMerge: peerReviewsComplete && mentorApproved,
      },
      message:
        "Review submitted successfully. Thank you for contributing to the community!",
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
