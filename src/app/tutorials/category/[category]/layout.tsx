import type { Metadata } from "next";
import { TutorialService } from "@/lib/tutorialService";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;

  try {
    // Fetch category metadata and tutorial count directly from service layer
    const [categoryMeta, tutorialCount] = await Promise.all([
      TutorialService.getCategoryBySlug(category),
      TutorialService.getTutorialsCount({ category }),
    ]);

    if (!categoryMeta) {
      return {
        title: "Tutorials - Vibed to Cracked",
        description: "Learn programming with our comprehensive tutorials.",
      };
    }

    const categoryName: string = categoryMeta.title || category;

    return {
      title: `${categoryName} Tutorials - ${tutorialCount}+ Lessons | Learn ${categoryName} | Vibed to Cracked`,
      description: `Master ${categoryName} with ${tutorialCount}+ comprehensive tutorials. From fundamentals to advanced concepts, learn at your own pace with personalized difficulty levels.`,
      keywords: `${categoryName} tutorial, learn ${categoryName}, ${categoryName} guide, ${categoryName} course, ${categoryName} lessons`,
      openGraph: {
        title: `${categoryName} Tutorials - Master Your Skills`,
        description: `${tutorialCount}+ tutorials to help you master ${categoryName}.`,
        type: "website",
        url: `/tutorials/category/${category}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `${categoryName} Tutorials - Master Your Skills`,
        description: `${tutorialCount}+ tutorials to help you master ${categoryName}.`,
      },
      alternates: {
        canonical: `/tutorials/category/${category}`,
      },
    };
  } catch (error) {
    console.error("Error generating category metadata:", error);

    const formattedCategory =
      category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");

    return {
      title: `${formattedCategory} Tutorials | Learn ${formattedCategory} | Vibed to Cracked`,
      description: `Comprehensive tutorials to master ${formattedCategory}. Learn from fundamentals to advanced concepts at your own pace.`,
      keywords: `${formattedCategory} tutorial, learn ${formattedCategory}, ${formattedCategory} guide`,
      openGraph: {
        title: `${formattedCategory} Tutorials`,
        description: `Master ${formattedCategory} with our interactive tutorials.`,
        type: "website",
        url: `/tutorials/category/${category}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `${formattedCategory} Tutorials`,
        description: `Master ${formattedCategory} with our interactive tutorials.`,
      },
      alternates: {
        canonical: `/tutorials/category/${category}`,
      },
    };
  }
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
