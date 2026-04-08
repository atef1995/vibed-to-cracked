import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const exercise = await prisma.exercise.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        difficulty: true,
        category: true,
        estimatedTime: true,
      },
    });

    if (!exercise) {
      return {
        title: "Exercise Not Found - Vibed to Cracked",
        description: "The requested exercise could not be found.",
      };
    }

    const difficultyLabel =
      exercise.difficulty.charAt(0).toUpperCase() +
      exercise.difficulty.slice(1);

    return {
      title: `${exercise.title} - ${difficultyLabel} Coding Exercise | Vibed to Cracked`,
      description: `${
        exercise.description
      } Solve this ${difficultyLabel.toLowerCase()} hands-on coding exercise in about ${
        exercise.estimatedTime
      } minutes.`,
      keywords: `${exercise.title.toLowerCase()} exercise, coding challenge, ${
        exercise.category
      }, web development`,
      openGraph: {
        title: `${exercise.title} - Coding Exercise`,
        description: `${exercise.description} Learn by solving this interactive exercise.`,
        type: "website",
        url: `/exercises/${slug}`,
        siteName: "Vibed to Cracked",
      },
      alternates: {
        canonical: `/exercises/${slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${exercise.title} - Coding Exercise`,
        description: `${difficultyLabel} exercise - ~${exercise.estimatedTime} min to complete`,
      },
    };
  } catch (error) {
    console.error("Error generating exercise metadata:", error);

    // Fallback metadata
    return {
      title: "Interactive Coding Exercise - Vibed to Cracked",
      description:
        "Solve hands-on coding exercises to build real programming skills. Learn HTML, CSS, JavaScript, and more.",
      keywords: "coding exercise, programming challenge, interactive coding",
      openGraph: {
        title: "Interactive Coding Exercise",
        description: "Practice coding with hands-on exercises.",
        type: "website",
        url: `/exercises/${slug}`,
        siteName: "Vibed to Cracked",
      },
      alternates: {
        canonical: `/exercises/${slug}`,
      },
    };
  }
}

export default async function ExerciseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let exerciseTitle = slug.replace(/-/g, " ");
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { slug },
      select: { title: true },
    });
    if (exercise) exerciseTitle = exercise.title;
  } catch {}

  const breadcrumbLd = {
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
        name: "Exercises",
        item: "https://vibed-to-cracked.com/exercises",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: exerciseTitle,
        item: `https://vibed-to-cracked.com/exercises/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\u003c"),
        }}
      />
      {children}
    </>
  );
}
