import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TutorialService } from "@/lib/tutorialService";
import { getUserSettings } from "@/lib/settingsService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getUserSettings(session.user.id);
    const experienceLevel = settings?.experienceLevel ?? "complete-beginner";
    const learningGoals = (settings?.learningGoals as string[]) ?? [];

    const tutorial = await TutorialService.getRecommendedForUser(
      experienceLevel,
      learningGoals
    );

    if (!tutorial) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        title: tutorial.title,
        description: tutorial.description,
        slug: tutorial.slug,
        categorySlug: tutorial.category.slug,
      },
    });
  } catch (error) {
    console.error("Error fetching tutorial recommendation:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendation" },
      { status: 500 }
    );
  }
}
