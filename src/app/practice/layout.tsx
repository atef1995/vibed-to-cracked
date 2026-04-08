import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const challengeCount = await prisma.challenge.count({
      where: { published: true },
    });

    return {
      title: `Coding Challenges - ${challengeCount}+ Practice Problems | Vibed to Cracked`,
      description: `Sharpen your skills with ${challengeCount}+ coding challenges. Algorithm problems, data structure exercises, and real-world scenarios across all difficulty levels.`,
      keywords:
        "coding challenges, programming practice, algorithm problems, data structures, coding interview prep",
      openGraph: {
        title: "Coding Challenges - Practice Makes Perfect",
        description: `${challengeCount}+ coding challenges from beginner to advanced. Build problem-solving skills.`,
        type: "website",
        url: "/practice",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Coding Challenges - Practice Makes Perfect",
        description: `${challengeCount}+ coding challenges across all difficulty levels.`,
      },
      alternates: {
        canonical: "/practice",
      },
    };
  } catch {
    return {
      title: "Coding Challenges | Vibed to Cracked",
      description:
        "Practice coding with interactive challenges. Algorithm problems, data structures, and real-world scenarios.",
      alternates: {
        canonical: "/practice",
      },
    };
  }
}

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
