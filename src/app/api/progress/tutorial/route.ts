import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressService } from "@/lib/progressService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tutorialId = searchParams.get("tutorialId") ?? undefined;
    const userId = session.user.id;

    if (tutorialId) {
      // Get specific tutorial progress
      const progress = await ProgressService.getTutorialProgress(
        userId,
        tutorialId
      );
      return NextResponse.json({ success: true, data: progress });
    }

    // Get all tutorial progress for user
    const allProgress = await ProgressService.getTutorialProgress(userId);
    return NextResponse.json({ success: true, data: allProgress });
  } catch (error) {
    console.error("Error fetching tutorial progress:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch tutorial progress",
        },
      },
      { status: 500 }
    );
  }
}
