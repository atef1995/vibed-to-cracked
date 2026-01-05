import { NextResponse } from "next/server";
import { BlogService } from "@/lib/blogService";

export async function GET() {
  try {
    const categories = await BlogService.getCategoriesWithCounts();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch blog categories",
        },
      },
      { status: 500 }
    );
  }
}
