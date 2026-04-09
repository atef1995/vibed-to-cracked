import { prisma } from "@/lib/prisma";
import QuizzesPageClient from "./QuizzesPageClient";

export default async function QuizzesPage() {
  let quizzes: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    tutorial: { title: string; slug: string } | null;
  }> = [];

  try {
    const data = await prisma.quiz.findMany({
      include: { tutorial: { select: { title: true, slug: true } } },
      orderBy: { title: "asc" },
      take: 20,
    });
    quizzes = JSON.parse(JSON.stringify(data));
  } catch {
    // Client handles loading/error
  }

  return (
    <>
      {quizzes.length > 0 && (
        <div data-nosnippet className="sr-only">
          <h1>JavaScript Quizzes</h1>
          <p>
            Test your coding knowledge with interactive quizzes on JavaScript,
            React, Data Structures, and more.
          </p>
          <nav aria-label="Available quizzes">
            <ul>
              {quizzes.map((q) => (
                <li key={q.id}>
                  <a href={`/quiz/${q.slug}`}>
                    {q.title}
                    {q.tutorial && ` — ${q.tutorial.title}`}
                    {q.description && ` — ${q.description}`}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <QuizzesPageClient />
    </>
  );
}
