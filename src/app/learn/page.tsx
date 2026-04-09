import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Learn JavaScript — Tutorials, Exercises, Quizzes & Cheat Sheets",
  description:
    "Pick a topic and start learning JavaScript with interactive tutorials, hands-on exercises, quizzes, and quick-reference cheat sheets.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Learn JavaScript — Tutorials, Exercises, Quizzes & Cheat Sheets",
    description: "Pick a topic and start learning JavaScript interactively.",
    url: "/learn",
    type: "website",
  },
};

export default async function LearnPage() {
  const categories = await prisma.category.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
      _count: { select: { tutorials: true } },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Learn JavaScript
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Pick a topic below. Each learning path includes tutorials, exercises,
          quizzes, and cheat sheets to help you master the subject.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/learn/${cat.slug}`}
            className="group p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
              {cat.title}
            </h2>
            {cat.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {cat.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{cat._count.tutorials} tutorials</span>
              {cat.difficulty && (
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                  {cat.difficulty}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Supplementary resources */}
      <section className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          More Resources
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/glossary"
            className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Glossary
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Look up programming terms with definitions and code examples.
            </p>
          </Link>
          <Link
            href="/compare"
            className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Comparisons
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Side-by-side breakdowns of commonly confused concepts.
            </p>
          </Link>
          <Link
            href="/cheat-sheets"
            className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Cheat Sheets
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Quick-reference guides for syntax and patterns.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
