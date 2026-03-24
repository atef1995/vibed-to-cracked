import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/export-data - Export all user data as JSON
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const [
      user,
      tutorialProgress,
      quizAttempts,
      challengeProgress,
      challengeAttempts,
      achievements,
      progress,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          mood: true,
          xp: true,
          level: true,
          role: true,
          createdAt: true,
          userSettings: {
            select: {
              emailNotifications: true,
              reminderNotifications: true,
              achievementNotifications: true,
              weeklyProgressReports: true,
              showPublicProfile: true,
              shareProgress: true,
              allowAnalytics: true,
              dailyGoalMinutes: true,
              reminderTime: true,
              timezone: true,
              difficulty: true,
              autoSubmit: true,
            },
          },
        },
      }),
      prisma.tutorialProgress.findMany({
        where: { userId },
        select: {
          tutorialId: true,
          status: true,
          quizPassed: true,
          bestScore: true,
          completedAt: true,
          tutorial: { select: { title: true, slug: true } },
        },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        select: {
          quizId: true,
          score: true,
          passed: true,
          mood: true,
          createdAt: true,
          quiz: { select: { title: true } },
        },
      }),
      prisma.challengeProgress.findMany({
        where: { userId },
        select: {
          challengeId: true,
          status: true,
          passed: true,
          attempts: true,
          firstPassedAt: true,
        },
      }),
      prisma.challengeAttempt.findMany({
        where: { userId },
        select: {
          challengeId: true,
          passed: true,
          mood: true,
          createdAt: true,
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: {
          unlockedAt: true,
          achievement: { select: { title: true, key: true, category: true } },
        },
      }),
      prisma.progress.findMany({
        where: { userId },
        select: {
          tutorialId: true,
          completed: true,
          score: true,
          completedAt: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: user,
      tutorialProgress,
      quizAttempts,
      challengeProgress,
      challengeAttempts,
      achievements,
      progress,
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="vibed-to-cracked-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
