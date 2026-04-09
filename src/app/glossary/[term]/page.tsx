import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const categoryLabels: Record<string, string> = {
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
  react: "React",
  dsa: "Data Structures",
  web: "Web",
  typescript: "TypeScript",
  tooling: "Tooling",
};

interface Props {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  const terms = await prisma.glossaryTerm.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return terms.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: slug } = await params;
  const term = await prisma.glossaryTerm.findUnique({ where: { slug } });
  if (!term) return {};

  const title = `What is ${term.term} in JavaScript? — Definition & Example`;
  const description = term.definition
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    .slice(0, 160);

  return {
    title,
    description,
    keywords: [
      term.term.toLowerCase(),
      `${term.term.toLowerCase()} javascript`,
      `what is ${term.term.toLowerCase()}`,
      `${term.term.toLowerCase()} definition`,
      `${term.term.toLowerCase()} example`,
    ],
    alternates: {
      canonical: `/glossary/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/glossary/${slug}`,
      type: "article",
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term: slug } = await params;
  const term = await prisma.glossaryTerm.findUnique({ where: { slug } });
  if (!term || !term.published) notFound();

  const relatedTerms = term.seeAlso.length > 0
    ? await prisma.glossaryTerm.findMany({
        where: { slug: { in: term.seeAlso }, published: true },
      })
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/glossary" className="hover:text-blue-600 dark:hover:text-blue-400">
              Glossary
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 dark:text-gray-100 font-medium">
            {term.term}
          </li>
        </ol>
      </nav>

      <article>
        <header className="mb-8">
          <span className="text-sm px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-4 inline-block">
            {categoryLabels[term.category] || term.category}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-3">
            {term.term}
          </h1>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Definition
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {term.definition}
          </p>
        </section>

        {term.example && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Code Example
            </h2>
            <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-xl p-6 overflow-x-auto text-sm leading-relaxed">
              <code>{term.example}</code>
            </pre>
          </section>
        )}

        {term.relatedTutorials.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Learn More
            </h2>
            <div className="flex flex-wrap gap-2">
              {term.relatedTutorials.map((cat) => (
                <Link
                  key={cat}
                  href={`/tutorials/category/${cat}`}
                  className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                >
                  {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
                  tutorials
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedTerms.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Related Terms
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {relatedTerms.map((related) => (
                <Link
                  key={related.slug}
                  href={`/glossary/${related.slug}`}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {related.term}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {related.definition.replace(/`[^`]+`/g, (m) =>
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
            "@type": "DefinedTerm",
            name: term.term,
            description: term.definition.replace(/`[^`]+`/g, (m) =>
              m.slice(1, -1)
            ),
            url: `https://vibed-to-cracked.com/glossary/${term.slug}`,
            inDefinedTermSet: {
              "@type": "DefinedTermSet",
              name: "Programming Glossary",
              url: "https://vibed-to-cracked.com/glossary",
            },
          }),
        }}
      />

      {/* BreadcrumbList JSON-LD */}
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
                name: "Glossary",
                item: "https://vibed-to-cracked.com/glossary",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: term.term,
                item: `https://vibed-to-cracked.com/glossary/${term.slug}`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
