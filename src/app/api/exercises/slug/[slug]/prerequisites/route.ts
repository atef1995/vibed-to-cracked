import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TutorialService } from "@/lib/tutorialService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const prerequisites =
      await TutorialService.getPrerequisiteTutorialsWithProgress(slug, userId);

    return NextResponse.json(prerequisites);
  } catch (error) {
    console.error("Error fetching prerequisites for exercise:", error);
    return NextResponse.json(
      { error: "Failed to fetch prerequisites" },
      { status: 500 }
    );
  }
}
