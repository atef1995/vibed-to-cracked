import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ companySlug: string; questionId: string }> }
) {
  try {
    const { companySlug, questionId } = await params;
    const session = await getServerSession(authOptions);
    const userPlan = (session?.user?.subscription as string) || "FREE";

    // For list requests (no specific question), return walkthroughs list
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;

    if (questionId === "list") {
      const data = await InterviewPrepService.getQuestionWalkthroughs(
        companySlug,
        type,
        userPlan
      );
      return NextResponse.json({ data });
    }

    const data = await InterviewPrepService.getWalkthrough(
      questionId,
      userPlan
    );
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch walkthrough";
    if (message === "Upgrade required") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    const status = message.includes("not found") ? 404 : 500;
    if (status === 500) console.error("Error fetching walkthrough:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
