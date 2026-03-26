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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const category = searchParams.get("category") || "";
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "9", 10);
    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
    const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? 9 : rawLimit));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { published: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.exercise.count({ where }),
    ]);

    // Fetch distinct categories for the filter dropdown
    const allCategories = await prisma.exercise.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    let completedTutorialIds: Set<string> | null = null;
    if (userId) {
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
      categories: allCategories.map((c) => c.category),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}
