import type { Metadata } from "next";
import Link from "next/link";
import { comparisons } from "@/lib/comparisons";

export const metadata: Metadata = {
  title: "JavaScript Comparisons — Side-by-Side Feature Breakdowns",
  description:
    "Compare JavaScript concepts side by side: var vs let vs const, == vs ===, map vs forEach, Flexbox vs Grid, and more. Clear tables, code examples, and verdicts.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "JavaScript Comparisons — Side-by-Side Feature Breakdowns",
    description:
      "Compare JavaScript concepts side by side with clear tables, code examples, and verdicts.",
    url: "/compare",
    type: "website",
  },
};

export default function ComparePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          JavaScript Comparisons
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Side-by-side breakdowns of commonly confused JavaScript, CSS, and web
          development concepts. Each comparison includes a feature table, code
          example, and clear verdict.
        </p>
      </header>

      <div className="grid gap-4">
        {comparisons.map((c) => (
          <Link
            key={c.slug}
            href={`/compare/${c.slug}`}
            className="group p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
              {c.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {c.description}
            </p>
            <div className="flex gap-2 mt-3">
              {c.items.map((item) => (
                <span
                  key={item.name}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "JavaScript Comparisons",
            description:
              "Side-by-side comparisons of JavaScript and web development concepts.",
            url: "https://vibed-to-cracked.com/compare",
          }),
        }}
      />
    </div>
  );
}
