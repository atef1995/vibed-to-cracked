import { NextRequest, NextResponse } from "next/server";
import { TutorialService } from "@/lib/tutorialService";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    // Get the exercise with its tutorialCategoryId and prerequisites
    const exercise = await prisma.exercise.findUnique({
      where: { slug },
      select: {
        tutorialCategoryId: true,
        prerequisiteTutorialIds: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    const tutorials =
      await TutorialService.getRecommendedTutorialsFromChallenge(
        exercise.tutorialCategoryId,
        limit + (exercise.prerequisiteTutorialIds?.length || 0)
      );

    // Exclude tutorials that are already shown as prerequisites
    const prereqIds = new Set(exercise.prerequisiteTutorialIds || []);
    const filtered = tutorials
      .filter((t) => !prereqIds.has(t.id))
      .slice(0, limit);

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching tutorials for exercise:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutorials" },
      { status: 500 }
    );
  }
}
