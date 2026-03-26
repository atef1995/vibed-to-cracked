import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const exercises = await prisma.exercise.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        estimatedTime: true,
        topics: true,
        order: true,
        prerequisiteTutorialIds: true,
      },
      orderBy: { order: "asc" },
    });

    let completedTutorialIds: Set<string> | null = null;
    if (userId) {
      // Collect all prerequisite tutorial IDs across exercises
      const allPrereqIds = [
        ...new Set(exercises.flatMap((e) => e.prerequisiteTutorialIds)),
      ];
      if (allPrereqIds.length > 0) {
        const completedProgress = await prisma.tutorialProgress.findMany({
          where: {
            userId,
            tutorialId: { in: allPrereqIds },
            quizPassed: true,
          },
          select: { tutorialId: true },
        });
        completedTutorialIds = new Set(
          completedProgress.map((p) => p.tutorialId)
        );
      }
    }

    const data = exercises.map((exercise) => {
      const prereqCount = exercise.prerequisiteTutorialIds.length;
      let prerequisitesCompleted = 0;
      if (completedTutorialIds && prereqCount > 0) {
        prerequisitesCompleted = exercise.prerequisiteTutorialIds.filter((id) =>
          completedTutorialIds!.has(id)
        ).length;
      }

      return {
        id: exercise.id,
        slug: exercise.slug,
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        category: exercise.category,
        estimatedTime: exercise.estimatedTime,
        topics: exercise.topics,
        order: exercise.order,
        prerequisiteTutorialCount: prereqCount,
        prerequisitesCompleted: userId ? prerequisitesCompleted : null,
      };
    });

    return NextResponse.json({
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}
