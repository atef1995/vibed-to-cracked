import type { Metadata } from "next";
import { TutorialService } from "@/lib/tutorialService";

const baseUrl = process.env.NEXTAUTH_URL || "https://vibed-to-cracked.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;

  try {
    const tutorial = await TutorialService.getTutorialBySlug(slug);

    if (!tutorial) {
      return {
        title: "Tutorial Not Found - Vibed to Cracked",
        description: "The requested tutorial could not be found.",
      };
    }

    const tutorialTitle = tutorial.title || slug;
    const description =
      tutorial.description ||
      `Learn ${tutorialTitle.toLowerCase()}. Comprehensive tutorial covering all concepts from basics to advanced.`;
    const estimatedTime = tutorial.estimatedTime || 30;
    const ogTitle = `${tutorialTitle} - Learn With Interactive Examples`;
    const ogDescription = `Master ${tutorialTitle.toLowerCase()} with our comprehensive tutorial. Takes about ${Math.round(estimatedTime)} minutes.`;

    return {
      title: `${tutorialTitle} Tutorial - Learn in ${Math.round(
        estimatedTime
      )} Minutes | Vibed to Cracked`,
      description: `${description} Start learning now - free access for all users.`,
      keywords: `${tutorialTitle.toLowerCase()} tutorial, learn ${tutorialTitle.toLowerCase()}, ${tutorialTitle.toLowerCase()} guide, ${tutorialTitle.toLowerCase()} course`,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: "article",
        url: `/tutorials/category/${category}/${slug}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: ogTitle,
        description: ogDescription,
      },
      alternates: {
        canonical: `/tutorials/category/${category}/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating tutorial metadata:", error);

    const formattedTitle =
      slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

    return {
      title: `${formattedTitle} Tutorial - Learn ${formattedTitle} | Vibed to Cracked`,
      description: `Comprehensive tutorial to master ${formattedTitle}. Learn at your own pace with interactive examples and challenges.`,
      keywords: `${formattedTitle.toLowerCase()} tutorial, learn ${formattedTitle.toLowerCase()}`,
      openGraph: {
        title: `${formattedTitle} Tutorial`,
        description: `Master ${formattedTitle} with our interactive tutorial.`,
        type: "article",
        url: `/tutorials/category/${category}/${slug}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `${formattedTitle} Tutorial`,
        description: `Master ${formattedTitle} with our interactive tutorial.`,
      },
      alternates: {
        canonical: `/tutorials/category/${category}/${slug}`,
      },
    };
  }
}

interface TutorialLayoutProps {
  children: React.ReactNode;
  params: Promise<{ category: string; slug: string }>;
}

export default async function TutorialLayout({
  children,
  params,
}: TutorialLayoutProps) {
  const { category, slug } = await params;

  let jsonLd: Record<string, unknown> | null = null;

  try {
    const tutorial = await TutorialService.getTutorialBySlug(slug);
    if (tutorial) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Course",
        name: tutorial.title,
        description: tutorial.description ?? `Learn ${tutorial.title}`,
        url: `${baseUrl}/tutorials/category/${category}/${slug}`,
        provider: {
          "@type": "Organization",
          name: "Vibed to Cracked",
          url: baseUrl,
        },
        ...(tutorial.updatedAt && { dateModified: tutorial.updatedAt }),
      };
    }
  } catch {
    // non-critical — page still renders fine without structured data
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tutorials",
        item: `${baseUrl}/tutorials`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category
          .charAt(0)
          .toUpperCase()
          .concat(category.slice(1).replace(/-/g, " ")),
        item: `${baseUrl}/tutorials/category/${category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: slug
          .charAt(0)
          .toUpperCase()
          .concat(slug.slice(1).replace(/-/g, " ")),
        item: `${baseUrl}/tutorials/category/${category}/${slug}`,
      },
    ],
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {children}
    </>
  );
}
