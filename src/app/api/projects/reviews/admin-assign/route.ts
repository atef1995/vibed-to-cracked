import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ProjectService } from "@/lib/projectService";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const { submissionId, adminUserId } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission ID is required",
        },
        { status: 400 }
      );
    }

    await ProjectService.assignAdminReviewer(submissionId, adminUserId || session.user.id);

    return NextResponse.json({
      success: true,
      message: "Admin reviewer assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning admin reviewer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to assign admin reviewer",
      },
      { status: 500 }
    );
  }
}