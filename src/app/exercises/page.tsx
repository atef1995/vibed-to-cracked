import { prisma } from "@/lib/prisma";
import ExercisesPageClient from "./ExercisesPageClient";

export default async function ExercisesPage() {
  let exercises: Array<{
    slug: string;
    title: string;
    description: string | null;
    difficulty: string;
    category: string;
  }> = [];

  try {
    const data = await prisma.exercise.findMany({
      where: { published: true },
      select: {
        slug: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
      },
      orderBy: { order: "asc" },
      take: 30,
    });
    exercises = JSON.parse(JSON.stringify(data));
  } catch {
    // Client handles loading/error
  }

  return (
    <>
      {exercises.length > 0 && (
        <div data-nosnippet className="sr-only">
          <h1>Coding Exercises</h1>
          <p>
            Practice JavaScript, algorithms, and web development with hands-on
            coding exercises.
          </p>
          <nav aria-label="Available exercises">
            <ul>
              {exercises.map((ex) => (
                <li key={ex.slug}>
                  <a href={`/exercises/${ex.slug}`}>
                    {ex.title} ({ex.difficulty}) — {ex.category}
                    {ex.description && ` — ${ex.description}`}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <ExercisesPageClient />
    </>
  );
}
