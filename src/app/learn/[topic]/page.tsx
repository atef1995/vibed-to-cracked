import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ topic: string }>;
}

const topicMeta: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  fundamentals: {
    title: "Learn JavaScript Fundamentals",
    description:
      "Master JavaScript basics: variables, functions, arrays, objects, loops, and more. Tutorials, exercises, quizzes, and cheat sheets in one place.",
    keywords: [
      "learn javascript",
      "javascript basics",
      "javascript fundamentals",
      "javascript for beginners",
    ],
  },
  html: {
    title: "Learn HTML",
    description:
      "Learn HTML from scratch: elements, forms, semantic markup, accessibility. Tutorials, exercises, and quick-reference cheat sheets.",
    keywords: [
      "learn html",
      "html tutorial",
      "html basics",
      "html for beginners",
    ],
  },
  css: {
    title: "Learn CSS",
    description:
      "Master CSS: selectors, flexbox, grid, responsive design, animations. Tutorials, exercises, quizzes, and cheat sheets.",
    keywords: ["learn css", "css tutorial", "css basics", "css for beginners"],
  },
  dom: {
    title: "Learn DOM Manipulation",
    description:
      "Learn how to manipulate the DOM with JavaScript: selecting elements, events, dynamic content. Interactive tutorials and exercises.",
    keywords: [
      "dom manipulation",
      "javascript dom",
      "dom tutorial",
      "dom events",
    ],
  },
  oop: {
    title: "Learn Object-Oriented JavaScript",
    description:
      "Master OOP in JavaScript: classes, prototypes, inheritance, encapsulation. Tutorials, quizzes, and hands-on exercises.",
    keywords: [
      "javascript oop",
      "object oriented javascript",
      "javascript classes",
      "prototypes",
    ],
  },
  async: {
    title: "Learn Asynchronous JavaScript",
    description:
      "Understand async JavaScript: promises, async/await, fetch API, event loop. Tutorials, exercises, and reference cheat sheets.",
    keywords: [
      "async javascript",
      "javascript promises",
      "async await",
      "javascript fetch",
    ],
  },
  "data-structures": {
    title: "Learn Data Structures & Algorithms in JavaScript",
    description:
      "Study DSA with JavaScript: arrays, linked lists, trees, graphs, sorting, Big O. Tutorials, exercises, and cheat sheets.",
    keywords: [
      "data structures javascript",
      "algorithms javascript",
      "dsa tutorial",
      "big o notation",
    ],
  },
  advanced: {
    title: "Advanced JavaScript Concepts",
    description:
      "Deep dive into advanced JS: closures, generators, proxies, modules, metaprogramming. Tutorials and exercises for experienced developers.",
    keywords: [
      "advanced javascript",
      "javascript closures",
      "javascript modules",
      "javascript generators",
    ],
  },
};

const validTopics = Object.keys(topicMeta);

export async function generateStaticParams() {
  return validTopics.map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const meta = topicMeta[topic];
  if (!meta) return {};

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `/learn/${topic}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/learn/${topic}`,
      type: "website",
    },
  };
}

export default async function TopicHubPage({ params }: Props) {
  const { topic } = await params;
  if (!validTopics.includes(topic)) notFound();

  const meta = topicMeta[topic];

  // Get category ID
  const category = await prisma.category.findUnique({
    where: { slug: topic },
    select: { id: true, title: true, slug: true, description: true },
  });

  if (!category) notFound();

  // Fetch all content in parallel
  const [tutorials, exercises, quizzes, cheatSheets] = await Promise.all([
    prisma.tutorial.findMany({
      where: { categoryId: category.id, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
      },
      orderBy: { order: "asc" },
    }),
    prisma.exercise.findMany({
      where: { tutorialCategoryId: category.id, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
      },
      orderBy: { order: "asc" },
    }),
    prisma.quiz.findMany({
      where: { tutorial: { categoryId: category.id } },
      select: {
        id: true,
        title: true,
        slug: true,
        tutorial: { select: { title: true } },
      },
    }),
    prisma.cheatSheet.findMany({
      where: { category: topic, published: true },
      select: { id: true, title: true, slug: true, description: true },
      orderBy: { order: "asc" },
    }),
  ]);

  const totalContent =
    tutorials.length + exercises.length + quizzes.length + cheatSheets.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
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
              href="/learn"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Learn
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 dark:text-gray-100 font-medium">
            {category.title}
          </li>
        </ol>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {meta.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          {meta.description}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          {totalContent} resources available
        </p>
      </header>

      {/* Tutorials */}
      {tutorials.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Tutorials
          </h2>
          <div className="grid gap-3">
            {tutorials.map((t) => (
              <Link
                key={t.id}
                href={`/tutorials/category/${topic}/${t.slug}`}
                className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t.title}
                    </h3>
                    {t.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                  </div>
                  {t.difficulty && (
                    <span className="shrink-0 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ml-3">
                      {t.difficulty}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Exercises */}
      {exercises.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Exercises
          </h2>
          <div className="grid gap-3">
            {exercises.map((e) => (
              <Link
                key={e.id}
                href={`/exercises/${e.slug}`}
                className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {e.title}
                    </h3>
                    {e.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {e.description}
                      </p>
                    )}
                  </div>
                  {e.difficulty && (
                    <span className="shrink-0 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ml-3">
                      {e.difficulty}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Quizzes
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                href={`/quiz/${q.slug}`}
                className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {q.title}
                </h3>
                {q.tutorial && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {q.tutorial.title}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Cheat Sheets */}
      {cheatSheets.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Cheat Sheets
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cheatSheets.map((cs) => (
              <Link
                key={cs.id}
                href={`/cheat-sheets/${cs.slug}`}
                className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {cs.title}
                </h3>
                {cs.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {cs.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: meta.title,
            description: meta.description,
            url: `https://vibed-to-cracked.com/learn/${topic}`,
            hasPart: tutorials.map((t) => ({
              "@type": "Course",
              name: t.title,
              description: t.description,
              url: `https://vibed-to-cracked.com/tutorials/category/${topic}/${t.slug}`,
            })),
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
                name: "Learn",
                item: "https://vibed-to-cracked.com/learn",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: category.title,
                item: `https://vibed-to-cracked.com/learn/${topic}`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
