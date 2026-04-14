import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const session = authResult;

    const { walkthroughId, confidence } = await request.json();
    if (!walkthroughId || !confidence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = await InterviewPrepService.updateStudyProgress(
      session.user.id,
      walkthroughId,
      confidence
    );
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update study progress";
    console.error("Error updating study progress:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const session = authResult;

    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("companySlug") || undefined;

    const data = await InterviewPrepService.getUserStudyStats(
      session.user.id,
      companySlug
    );
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching study stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch study stats" },
      { status: 500 }
    );
  }
}
