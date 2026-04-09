import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export const metadata: Metadata = {
  title: "JavaScript Glossary — Programming Terms Explained",
  description:
    "A comprehensive glossary of JavaScript, HTML, CSS, React, TypeScript, and web development terms with code examples. Perfect for beginners learning to code.",
  keywords: [
    "javascript glossary",
    "programming terms",
    "coding definitions",
    "web development glossary",
    "react glossary",
    "typescript glossary",
  ],
  alternates: {
    canonical: "/glossary",
  },
  openGraph: {
    title: "JavaScript Glossary — Programming Terms Explained",
    description:
      "Look up any JavaScript, React, CSS, or web development term with clear definitions and code examples.",
    url: "/glossary",
    type: "website",
  },
};

export default async function GlossaryPage() {
  const terms = await prisma.glossaryTerm.findMany({
    where: { published: true },
    orderBy: { term: "asc" },
  });

  // Group terms by first letter
  const grouped: Record<string, typeof terms> = {};
  for (const t of terms) {
    const letter = t.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(t);
  }
  const letters = Object.keys(grouped).sort();

  // Category counts
  const categories = Object.entries(
    terms.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Programming Glossary
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          {terms.length} terms covering JavaScript, React, CSS, HTML,
          TypeScript, data structures, and web development. Each term includes a
          clear definition and code example.
        </p>
      </header>

      {/* Category summary */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(([cat, count]) => (
          <span
            key={cat}
            className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {categoryLabels[cat] || cat} ({count})
          </span>
        ))}
      </div>

      {/* Letter nav */}
      <nav
        aria-label="Jump to letter"
        className="flex flex-wrap gap-1 mb-10 sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur py-3 z-10 border-b border-gray-200 dark:border-gray-800"
      >
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
          >
            {letter}
          </a>
        ))}
      </nav>

      {/* Terms by letter */}
      <div className="space-y-12">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
              {letter}
            </h2>
            <div className="grid gap-3">
              {grouped[letter].map((term) => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="group flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {term.term}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {term.definition.replace(/`[^`]+`/g, (m) =>
                        m.slice(1, -1)
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {categoryLabels[term.category] || term.category}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Cross-links */}
      <section className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          See how these concepts compare side by side in our{" "}
          <Link
            href="/compare"
            className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            JavaScript Comparisons
          </Link>{" "}
          or start learning with{" "}
          <Link
            href="/tutorials"
            className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            interactive tutorials
          </Link>
          .
        </p>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "Programming Glossary",
            description:
              "JavaScript, React, CSS, and web development terms explained with code examples.",
            url: "https://vibed-to-cracked.com/glossary",
            hasDefinedTerm: terms.slice(0, 30).map((t) => ({
              "@type": "DefinedTerm",
              name: t.term,
              description: t.definition.replace(/`[^`]+`/g, (m) =>
                m.slice(1, -1)
              ),
              url: `https://vibed-to-cracked.com/glossary/${t.slug}`,
            })),
          }),
        }}
      />
    </div>
  );
}
