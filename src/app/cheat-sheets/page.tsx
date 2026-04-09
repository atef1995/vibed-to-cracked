import { prisma } from "@/lib/prisma";
import CheatSheetsPageClient from "./CheatSheetsPageClient";

export default async function CheatSheetsPage() {
  let cheatSheets: Array<{
    slug: string;
    title: string;
    description: string | null;
    category: string;
    difficulty: string;
  }> = [];

  try {
    const data = await prisma.cheatSheet.findMany({
      where: { published: true },
      select: {
        slug: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
      },
      orderBy: [{ isPremium: "desc" }, { order: "asc" }],
      take: 30,
    });
    cheatSheets = JSON.parse(JSON.stringify(data));
  } catch {
    // Client handles loading/error
  }

  return (
    <>
      {cheatSheets.length > 0 && (
        <div data-nosnippet className="sr-only">
          <h1>Coding Cheat Sheets</h1>
          <p>
            Quick reference guides for JavaScript, React, CSS, Git, and more
            programming topics.
          </p>
          <nav aria-label="Available cheat sheets">
            <ul>
              {cheatSheets.map((cs) => (
                <li key={cs.slug}>
                  <a href={`/cheat-sheets/${cs.slug}`}>
                    {cs.title} ({cs.difficulty}) — {cs.category}
                    {cs.description && ` — ${cs.description}`}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <CheatSheetsPageClient />
    </>
  );
}
