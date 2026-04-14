import { NextResponse } from "next/server";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

export async function GET() {
  try {
    const data = await InterviewPrepService.getAllCompaniesWithGuides();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching interview prep companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
