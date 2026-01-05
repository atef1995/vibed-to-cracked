import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/lib/blogService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await BlogService.getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Blog post not found" },
        },
        { status: 404 }
      );
    }

    // Increment view count asynchronously
    BlogService.incrementViewCount(slug);

    // Get related posts
    const relatedPosts = await BlogService.getRelatedPosts(slug, 3);

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        relatedPosts,
      },
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch blog post",
        },
      },
      { status: 500 }
    );
  }
}
