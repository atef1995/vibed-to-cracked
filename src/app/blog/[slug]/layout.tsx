import type { Metadata } from "next";
import { BlogService } from "@/lib/blogService";

export const revalidate = 3600;

interface BlogPostLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
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
      alternates: {
        canonical: `/blog/${slug}`,
      },
    };
  }
}

export default async function BlogPostLayout({
  children,
  params,
}: BlogPostLayoutProps) {
  const { slug } = await params;

  let jsonLd = null;
  let breadcrumbLd = null;
  try {
    const post = await BlogService.getPostBySlug(slug);
    if (post) {
      const siteUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://vibed-to-cracked.com";
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description:
          post.excerpt || `Read ${post.title} on Vibed to Cracked blog.`,
        url: `${siteUrl}/blog/${slug}`,
        ...(post.coverImage && { image: post.coverImage }),
        ...(post.publishedAt && {
          datePublished: post.publishedAt.toISOString(),
        }),
        ...(post.updatedAt && {
          dateModified: post.updatedAt.toISOString(),
        }),
        author: {
          "@type": "Person",
          name: post.author.name || "Vibed to Cracked",
        },
        publisher: {
          "@type": "Organization",
          name: "Vibed to Cracked",
        },
      };
      breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteUrl}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${siteUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `${siteUrl}/blog/${slug}`,
          },
        ],
      };
    }
  } catch {
    // JSON-LD is non-critical — page still renders
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\u003c"),
          }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbLd).replace(/</g, "\u003c"),
          }}
        />
      )}
      {children}
    </>
  );
}
