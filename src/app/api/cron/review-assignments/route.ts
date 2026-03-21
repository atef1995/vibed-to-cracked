import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/projectService";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check for expired assignments and reassign
    await ProjectService.handleExpiredAssignments();
    
    return NextResponse.json({
      success: true,
      message: "Review assignment maintenance completed",
    });
  } catch (error) {
    console.error("Error in review assignment maintenance:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete review assignment maintenance",
      },
      { status: 500 }
    );
  }
}