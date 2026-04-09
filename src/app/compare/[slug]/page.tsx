import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageLayout } from "@/components/ui/PageLayout";
import InteractiveCodeBlock from "@/components/InteractiveCodeBlock";

export const dynamic = "force-dynamic";

interface ComparisonItem {
  name: string;
  features: Record<string, string>;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const comparisons = await prisma.comparison.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return comparisons.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparison = await prisma.comparison.findUnique({ where: { slug } });
  if (!comparison) return {};

  const title = `${comparison.title} — Differences Explained with Examples`;

  const items = comparison.items as unknown as ComparisonItem[];

  return {
    title,
    description: comparison.description.slice(0, 160),
    keywords: [
      comparison.title.toLowerCase(),
      ...items.map((i) => i.name.toLowerCase()),
      "javascript comparison",
      "difference",
    ],
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title,
      description: comparison.description,
      url: `/compare/${slug}`,
      type: "article",
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const comparison = await prisma.comparison.findUnique({ where: { slug } });
  if (!comparison || !comparison.published) notFound();
  console.log(comparison);

  const items = comparison.items as unknown as ComparisonItem[];
  const featureKeys = Object.keys(items[0].features);

  const relatedTerms =
    comparison.relatedGlossary.length > 0
      ? await prisma.glossaryTerm.findMany({
          where: { slug: { in: comparison.relatedGlossary }, published: true },
        })
      : [];

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
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
                href="/compare"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Compare
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">
              {comparison.title}
            </li>
          </ol>
        </nav>

        <article>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {comparison.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
            {comparison.description}
          </p>

          {/* Comparison table */}
          <div className="overflow-x-auto mb-10">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300">
                    Feature
                  </th>
                  {items.map((item) => (
                    <th
                      key={item.name}
                      className="text-left p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureKeys.map((feature) => (
                  <tr key={feature}>
                    <td className="p-3 border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30">
                      {feature}
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.name}
                        className="p-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                      >
                        {item.features[feature]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verdict */}
          <section className="mb-10 p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Verdict
            </h2>
            <p className="text-blue-800 dark:text-blue-300">
              {comparison.verdict}
            </p>
          </section>

          {/* Code example */}
          {comparison.codeExample && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Code Example
              </h2>
              <InteractiveCodeBlock>
                {comparison.codeExample}
              </InteractiveCodeBlock>
            </section>
          )}

          {/* Related tutorials */}
          {comparison.relatedTutorials.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Related Tutorials
              </h2>
              <div className="flex flex-wrap gap-2">
                {comparison.relatedTutorials.map((cat) => (
                  <Link
                    key={cat}
                    href={`/tutorials/category/${cat}`}
                    className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    {cat
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
                    tutorials
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related glossary terms */}
          {relatedTerms.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Related Glossary Terms
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {relatedTerms.map((term) => (
                  <Link
                    key={term.slug}
                    href={`/glossary/${term.slug}`}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {term.term}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {term.definition.replace(/`[^`]+`/g, (m) =>
                        m.slice(1, -1)
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: comparison.title,
              description: comparison.description,
              url: `https://vibed-to-cracked.com/compare/${slug}`,
            }),
          }}
        />

        {/* BreadcrumbList */}
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
                  name: "Compare",
                  item: "https://vibed-to-cracked.com/compare",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: comparison.title,
                  item: `https://vibed-to-cracked.com/compare/${slug}`,
                },
              ],
            }),
          }}
        />
      </div>
    </PageLayout>
  );
}
