import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import { BlogService } from "@/lib/blogService";
import BlogPostClient from "./BlogPostClient";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const post = await BlogService.getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    const relatedPosts = await BlogService.getRelatedPosts(slug, 3);

    const postData = JSON.parse(
      JSON.stringify({
        ...post,
        relatedPosts,
      })
    );

    // Serialize MDX content server-side
    let mdxSource = null;
    if (post.content) {
      try {
        mdxSource = await serialize(post.content, {
          parseFrontmatter: false,
        });
      } catch {
        // MDX serialization failed, client will handle it
      }
    }

    // Increment view count asynchronously (fire and forget)
    BlogService.incrementViewCount(slug).catch(() => {});

    return (
      <>
        <BlogPostClient initialPost={postData} initialMdxSource={mdxSource} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://vibed-to-cracked.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: "https://vibed-to-cracked.com/blog",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.title,
                  item: `https://vibed-to-cracked.com/blog/${slug}`,
                },
              ],
            }),
          }}
        />
      </>
    );
  } catch {
    return <BlogPostClient initialPost={null} initialMdxSource={null} />;
  }
}
