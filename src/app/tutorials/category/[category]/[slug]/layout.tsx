import type { Metadata } from "next";

const baseUrl = process.env.NEXTAUTH_URL || "https://vibed-to-cracked.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;

  try {
    // Fetch the specific tutorial
    const response = await fetch(`${baseUrl}/api/tutorials?slug=${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Tutorial not found");
    }

    const data = await response.json();

    const tutorial = data.data;

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
    const res = await fetch(`${baseUrl}/api/tutorials?slug=${slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const tutorial = data.data;
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
    }
  } catch {
    // non-critical — page still renders fine without structured data
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
