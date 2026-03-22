/**
 * API Route: GET /api/contributions/dashboard
 *
 * Get dashboard data for authenticated user
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Submission {
  id: string;
  prStatus: string | null;
  project: { xpReward: number; slug: string; title: string };
  prTitle: string | null;
  featureTitle: string | null;
  githubPrUrl: string | null;
  submittedAt: Date;
  peerReviewsReceived: number;
  peerReviewsNeeded: number;
  ciPassed: boolean | null;
}

interface ReviewAssignment {
  id: string;
  submissionId: string;
  submittedAt: Date | null;
  createdAt: Date;
  status: string;
  submission: {
    prTitle: string | null;
    featureTitle: string | null;
    project: { title: string };
  };
}

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

    // Fetch user's submissions
    const submissions = await prisma.contributionSubmission.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        submittedAt: "desc",
      },
      include: {
        project: {
          select: {
            slug: true,
            title: true,
            xpReward: true,
          },
        },
      },
    });

    // Fetch review assignments (reviews assigned to this user)
    const reviewAssignments = await prisma.contributionReview.findMany({
      where: {
        reviewerId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        submission: {
          select: {
            id: true,
            prTitle: true,
            featureTitle: true,
            project: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Calculate stats
    const totalSubmissions = submissions.length;
    const mergedPRs = (submissions as Submission[]).filter(
      (s) => s.prStatus === "MERGED"
    ).length;
    const reviewsGiven = (reviewAssignments as ReviewAssignment[]).filter(
      (r) => r.submittedAt !== null
    ).length;

    // Calculate XP earned from merged PRs
    const xpEarned = (submissions as Submission[])
      .filter((s) => s.prStatus === "MERGED")
      .reduce((sum: number, s: Submission) => sum + s.project.xpReward, 0);

    // Calculate streak: consecutive calendar days with any activity (submission or review)
    const activityDates = new Set<string>();
    for (const s of submissions) {
      activityDates.add(s.submittedAt.toISOString().slice(0, 10));
    }
    for (const r of reviewAssignments as ReviewAssignment[]) {
      if (r.submittedAt) {
        activityDates.add(r.submittedAt.toISOString().slice(0, 10));
      }
    }

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (activityDates.has(key)) {
        currentStreak++;
      } else {
        // Allow a one-day gap only for today (streak might not have happened yet today)
        if (i === 0) continue;
        break;
      }
    }

    // Check streak achievements (fire-and-forget — don't block the response)
    if (currentStreak >= 7) {
      const { checkStreakAchievements } =
        await import("@/lib/services/achievementService");
      checkStreakAchievements(session.user.id, currentStreak).catch((err) =>
        console.error("[Dashboard] streak achievement check failed:", err)
      );
    }

    // Format submissions for frontend
    const submissionSummaries = (submissions as Submission[]).map((s) => ({
      id: s.id,
      prTitle: s.prTitle,
      prStatus: s.prStatus,
      featureTitle: s.featureTitle,
      projectTitle: s.project.title,
      githubPrUrl: s.githubPrUrl,
      submittedAt: s.submittedAt.toISOString(),
      peerReviewsReceived: s.peerReviewsReceived,
      peerReviewsNeeded: s.peerReviewsNeeded,
      ciPassed: s.ciPassed,
    }));

    // Format review assignments for frontend
    const reviewAssignmentSummaries = (
      reviewAssignments as ReviewAssignment[]
    ).map((r) => ({
      id: r.id,
      submissionId: r.submissionId,
      prTitle: r.submission.prTitle,
      featureTitle: r.submission.featureTitle,
      projectTitle: r.submission.project.title,
      status: r.status,
      assignedAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        submissions: submissionSummaries,
        reviewAssignments: reviewAssignmentSummaries,
        stats: {
          totalSubmissions,
          mergedPRs,
          reviewsGiven,
          xpEarned,
          currentStreak,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
