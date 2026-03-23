import type { Metadata } from "next";
import { BlogService } from "@/lib/blogService";

interface BlogPostLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await BlogService.getPostBySlug(slug);

    if (!post) {
      return {
        title: "Post Not Found | Vibed to Cracked Blog",
        description: "The requested blog post could not be found.",
      };
    }

    return {
      title: `${post.title} | Vibed to Cracked Blog`,
      description:
        post.excerpt || `Read ${post.title} on Vibed to Cracked blog.`,
      keywords: post.tags.join(", "),
      authors: post.author.name ? [{ name: post.author.name }] : undefined,
      openGraph: {
        title: post.title,
        description:
          post.excerpt || `Read ${post.title} on Vibed to Cracked blog.`,
        type: "article",
        url: `/blog/${slug}`,
        siteName: "Vibed to Cracked",
        images: post.coverImage ? [{ url: post.coverImage }] : undefined,
        publishedTime: post.publishedAt?.toISOString(),
        authors: post.author.name ? [post.author.name] : undefined,
      },
      twitter: {
        card: post.coverImage ? "summary_large_image" : "summary",
        title: post.title,
        description: post.excerpt || undefined,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
      alternates: {
        canonical: `/blog/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating blog post metadata:", error);

    return {
      title: "Blog Post | Vibed to Cracked",
      description: "Read this article on Vibed to Cracked blog.",
    };
  }
}

export default function BlogPostLayout({ children }: BlogPostLayoutProps) {
  return children;
}
