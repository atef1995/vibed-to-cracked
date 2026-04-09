import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${label} Articles — Blog`,
    description: `Read blog posts about ${label}. Tutorials, guides, and insights on ${label} for JavaScript developers.`,
    alternates: { canonical: `/blog/tag/${tag}` },
    openGraph: {
      title: `${label} Articles`,
      description: `Blog posts tagged with ${label}.`,
      url: `/blog/tag/${tag}`,
      type: "website",
    },
  };
}

export default async function BlogTagPage({ params }: Props) {
  const { tag } = await params;
  const label = tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      tags: { has: tag },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      tags: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  if (posts.length === 0) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-sm text-gray-500 dark:text-gray-400"
      >
        <ol className="flex items-center gap-1">
          <li>
            <Link
              href="/"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/blog"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Blog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 dark:text-gray-100 font-medium">
            {label}
          </li>
        </ol>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {label}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {posts.length} article{posts.length === 1 ? "" : "s"} tagged with{" "}
          <span className="font-medium">{label}</span>
        </p>
      </header>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()}>
                  {post.publishedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
              {post.category && (
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                  {post.category.name}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
