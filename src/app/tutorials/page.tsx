import { TutorialService } from "@/lib/tutorialService";
import TutorialsPageClient from "./TutorialsPageClient";

export default async function TutorialsPage() {
  let categories: Array<{
    slug: string;
    title: string;
    description: string | null;
    difficulty: string;
    _count: { tutorials: number };
  }> = [];

  try {
    const data = await TutorialService.getCategoriesWithStats();
    categories = JSON.parse(JSON.stringify(data));
  } catch {
    // Client component handles loading/error states
  }

  return (
    <>
      {/* SSR content for search engines — hidden once JS hydrates */}
      {categories.length > 0 && (
        <div data-nosnippet className="sr-only">
          <h1>Coding Tutorials</h1>
          <p>
            Interactive lessons covering JavaScript, HTML, CSS, React, Data
            Structures, OOP, and more.
          </p>
          <nav aria-label="Tutorial categories">
            <ul>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <a href={`/tutorials/category/${cat.slug}`}>
                    {cat.title} — {cat._count.tutorials} tutorials
                    {cat.description && ` — ${cat.description}`}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <TutorialsPageClient />
    </>
  );
}
