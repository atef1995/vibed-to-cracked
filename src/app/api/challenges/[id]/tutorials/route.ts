import { NextRequest, NextResponse } from "next/server";
import { TutorialService } from "@/lib/tutorialService";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    // Get the challenge with its categoryId (id can be slug or cuid)
    const challenge = await prisma.challenge.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { categoryId: true },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const tutorials =
      await TutorialService.getRecommendedTutorialsFromChallenge(
        challenge.categoryId,
        limit
      );

    return NextResponse.json(tutorials);
  } catch (error) {
    console.error("Error fetching tutorials for challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutorials" },
      { status: 500 }
    );
  }
}
