import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        difficulty: true,
      },
    });

    if (!challenge) {
      return {
        title: "Challenge Not Found | Vibed to Cracked",
        description: "The requested coding challenge could not be found.",
      };
    }

    const difficultyLabel =
      challenge.difficulty.charAt(0).toUpperCase() +
      challenge.difficulty.slice(1);

    return {
      title: `${challenge.title} - ${difficultyLabel} Coding Challenge | Vibed to Cracked`,
      description:
        challenge.description ??
        `Solve this ${difficultyLabel.toLowerCase()} coding challenge. Practice algorithms and problem-solving skills.`,
      openGraph: {
        title: `${challenge.title} - Coding Challenge`,
        description:
          challenge.description ?? "Practice your coding skills with this challenge.",
        type: "website",
        url: `/practice/${slug}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `${challenge.title} - Coding Challenge`,
        description: `${difficultyLabel} challenge - solve it now.`,
      },
      alternates: {
        canonical: `/practice/${slug}`,
      },
    };
  } catch {
    return {
      title: "Coding Challenge | Vibed to Cracked",
      description:
        "Solve coding challenges to build real programming skills.",
      alternates: {
        canonical: `/practice/${slug}`,
      },
    };
  }
}

export default function PracticeSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
