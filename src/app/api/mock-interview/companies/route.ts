import { NextResponse } from "next/server";
import { MockInterviewService } from "@/lib/mockInterviewService";

export async function GET() {
  try {
    const companies = await MockInterviewService.getCompanies();
    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching interview companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
