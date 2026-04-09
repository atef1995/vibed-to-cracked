import { TutorialService } from "@/lib/tutorialService";
import CategoryPageClient from "./CategoryPageClient";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  let tutorials: Array<{
    slug: string;
    title: string;
    description: string | null;
    difficulty: string;
  }> = [];
  let categoryTitle = category;

  try {
    const [tutorialData, categoryData] = await Promise.all([
      TutorialService.getTutorialsByCategory(category, 20, 0),
      TutorialService.getCategoryBySlug(category),
    ]);
    tutorials = JSON.parse(JSON.stringify(tutorialData));
    if (categoryData?.title) {
      categoryTitle = categoryData.title;
    }
  } catch {
    // Client handles loading/error
  }

  return (
    <>
      {tutorials.length > 0 && (
        <div data-nosnippet className="sr-only">
          <h1>{categoryTitle} Tutorials</h1>
          <nav aria-label={`${categoryTitle} tutorials`}>
            <ul>
              {tutorials.map((t) => (
                <li key={t.slug}>
                  <a href={`/tutorials/category/${category}/${t.slug}`}>
                    {t.title}
                    {t.description && ` — ${t.description}`}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <CategoryPageClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://vibed-to-cracked.com" },
              { "@type": "ListItem", position: 2, name: "Tutorials", item: "https://vibed-to-cracked.com/tutorials" },
              { "@type": "ListItem", position: 3, name: categoryTitle, item: `https://vibed-to-cracked.com/tutorials/category/${category}` },
            ],
          }),
        }}
      />
    </>
  );
}
