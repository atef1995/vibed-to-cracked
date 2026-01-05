import { prisma } from "@/lib/prisma";
import { BlogPost, BlogCategory, Prisma } from "../generated/client";

export type BlogPostWithAuthor = BlogPost & {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  category: BlogCategory | null;
};

export class BlogService {
  /**
   * Get all published blog posts with pagination
   */
  static async getAllPosts(
    limit?: number,
    offset?: number
  ): Promise<BlogPostWithAuthor[]> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          published: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      return posts as BlogPostWithAuthor[];
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      throw new Error("Failed to fetch blog posts");
    }
  }

  /**
   * Get a single blog post by slug
   */
  static async getPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
    try {
      const post = await prisma.blogPost.findUnique({
        where: {
          slug,
          published: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
      });

      return post as BlogPostWithAuthor | null;
    } catch (error) {
      console.error("Error in getPostBySlug:", error);
      return null;
    }
  }

  /**
   * Get blog posts by category
   */
  static async getPostsByCategory(
    categorySlug: string,
    limit?: number,
    offset?: number
  ): Promise<BlogPostWithAuthor[]> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          published: true,
          category: {
            slug: categorySlug,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      return posts as BlogPostWithAuthor[];
    } catch (error) {
      console.error("Error in getPostsByCategory:", error);
      throw new Error("Failed to fetch posts by category");
    }
  }

  /**
   * Get featured blog posts
   */
  static async getFeaturedPosts(
    limit: number = 3
  ): Promise<BlogPostWithAuthor[]> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          published: true,
          featured: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: limit,
      });

      return posts as BlogPostWithAuthor[];
    } catch (error) {
      console.error("Error in getFeaturedPosts:", error);
      return [];
    }
  }

  /**
   * Get all blog categories
   */
  static async getCategories(): Promise<BlogCategory[]> {
    try {
      return await prisma.blogCategory.findMany({
        orderBy: {
          order: "asc",
        },
      });
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  /**
   * Get categories with post counts
   */
  static async getCategoriesWithCounts(): Promise<
    (BlogCategory & { _count: { posts: number } })[]
  > {
    try {
      return await prisma.blogCategory.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  published: true,
                },
              },
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });
    } catch (error) {
      console.error("Error in getCategoriesWithCounts:", error);
      throw new Error("Failed to fetch categories with counts");
    }
  }

  /**
   * Search blog posts
   */
  static async searchPosts(
    query: string,
    limit?: number,
    offset?: number
  ): Promise<BlogPostWithAuthor[]> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              excerpt: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      return posts as BlogPostWithAuthor[];
    } catch (error) {
      console.error("Error in searchPosts:", error);
      throw new Error("Failed to search posts");
    }
  }

  /**
   * Get total count of blog posts
   */
  static async getPostsCount(filters?: {
    category?: string;
    search?: string;
    tag?: string;
  }): Promise<number> {
    try {
      const where: Prisma.BlogPostWhereInput = {
        published: true,
      };

      if (filters?.category) {
        where.category = {
          slug: filters.category,
        };
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { excerpt: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters?.tag) {
        where.tags = {
          has: filters.tag,
        };
      }

      return await prisma.blogPost.count({ where });
    } catch (error) {
      console.error("Error in getPostsCount:", error);
      throw new Error("Failed to count posts");
    }
  }

  /**
   * Increment view count for a post
   */
  static async incrementViewCount(slug: string): Promise<void> {
    try {
      await prisma.blogPost.update({
        where: { slug },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  }

  /**
   * Get related posts based on category and tags
   */
  static async getRelatedPosts(
    currentSlug: string,
    limit: number = 3
  ): Promise<BlogPostWithAuthor[]> {
    try {
      const currentPost = await this.getPostBySlug(currentSlug);
      if (!currentPost) return [];

      const posts = await prisma.blogPost.findMany({
        where: {
          published: true,
          slug: { not: currentSlug },
          OR: [
            { categoryId: currentPost.categoryId },
            { tags: { hasSome: currentPost.tags } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: limit,
      });

      return posts as BlogPostWithAuthor[];
    } catch (error) {
      console.error("Error in getRelatedPosts:", error);
      return [];
    }
  }

  // Admin methods

  /**
   * Create a new blog post (admin only)
   */
  static async createPost(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    authorId: string;
    categoryId?: string;
    tags?: string[];
    published?: boolean;
    featured?: boolean;
    readingTime?: number;
  }): Promise<BlogPost> {
    try {
      return await prisma.blogPost.create({
        data: {
          ...data,
          publishedAt: data.published ? new Date() : null,
        },
      });
    } catch (error) {
      console.error("Error creating blog post:", error);
      throw new Error("Failed to create blog post");
    }
  }

  /**
   * Update a blog post (admin only)
   */
  static async updatePost(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      coverImage: string;
      categoryId: string;
      tags: string[];
      published: boolean;
      featured: boolean;
      readingTime: number;
    }>
  ): Promise<BlogPost> {
    try {
      const updateData: Prisma.BlogPostUpdateInput = { ...data };

      // Set publishedAt when publishing for the first time
      if (data.published) {
        const existingPost = await prisma.blogPost.findUnique({
          where: { id },
          select: { publishedAt: true },
        });
        if (!existingPost?.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      return await prisma.blogPost.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      console.error("Error updating blog post:", error);
      throw new Error("Failed to update blog post");
    }
  }

  /**
   * Delete a blog post (admin only)
   */
  static async deletePost(id: string): Promise<void> {
    try {
      await prisma.blogPost.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw new Error("Failed to delete blog post");
    }
  }

  /**
   * Get all posts including unpublished (admin only)
   */
  static async getAllPostsAdmin(
    limit?: number,
    offset?: number
  ): Promise<BlogPostWithAuthor[]> {
    try {
      const posts = await prisma.blogPost.findMany({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      return posts as BlogPostWithAuthor[];
    } catch (error) {
      console.error("Error in getAllPostsAdmin:", error);
      throw new Error("Failed to fetch blog posts");
    }
  }
}
