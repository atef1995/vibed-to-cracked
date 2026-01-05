import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/lib/blogService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured");

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    // Get featured posts
    if (featured === "true") {
      const featuredPosts = await BlogService.getFeaturedPosts(limit);
      return NextResponse.json({
        success: true,
        data: featuredPosts,
      });
    }

    // Search posts
    if (search) {
      const posts = await BlogService.searchPosts(search, limit, offset);
      const totalCount = await BlogService.getPostsCount({ search });
      return NextResponse.json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: offset + limit < totalCount,
        },
      });
    }

    // Get posts by category
    if (category) {
      const posts = await BlogService.getPostsByCategory(
        category,
        limit,
        offset
      );
      const totalCount = await BlogService.getPostsCount({ category });
      return NextResponse.json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: offset + limit < totalCount,
        },
      });
    }

    // Get posts by tag
    if (tag) {
      const totalCount = await BlogService.getPostsCount({ tag });
      const posts = await BlogService.getAllPosts(limit, offset);
      // Filter by tag (since we don't have a dedicated method)
      const filteredPosts = posts.filter((p) => p.tags.includes(tag));
      return NextResponse.json({
        success: true,
        data: filteredPosts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: offset + limit < totalCount,
        },
      });
    }

    // Get all posts with pagination
    const posts = await BlogService.getAllPosts(limit, offset);
    const totalCount = await BlogService.getPostsCount();
    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch blog posts",
        },
      },
      { status: 500 }
    );
  }
}
