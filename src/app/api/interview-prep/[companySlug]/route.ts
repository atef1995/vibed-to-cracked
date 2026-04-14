import { NextResponse } from "next/server";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  try {
    const { companySlug } = await params;
    const data = await InterviewPrepService.getCompanyPrepGuide(companySlug);
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch prep guide";
    const status = message.includes("not found") ? 404 : 500;
    if (status === 500) console.error("Error fetching prep guide:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
