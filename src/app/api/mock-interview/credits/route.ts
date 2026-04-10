import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InterviewCreditService } from "@/lib/interviewCreditService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const [credits, packs, history] = await Promise.all([
      InterviewCreditService.getUserCredits(session.user.id),
      InterviewCreditService.getCreditPacks(),
      InterviewCreditService.getTransactionHistory(session.user.id, page),
    ]);

    return NextResponse.json({ credits, packs, history });
  } catch (error) {
    console.error("Error fetching credit info:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
