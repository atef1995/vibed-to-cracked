import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        difficulty: true,
      },
    });

    if (!project) {
      return {
        title: "Project Not Found | Vibed to Cracked",
        description: "The requested project could not be found.",
      };
    }

    const difficultyLabels: Record<number, string> = {
      1: "Beginner",
      2: "Intermediate",
      3: "Advanced",
    };
    const difficultyLabel = difficultyLabels[project.difficulty] ?? "Intermediate";

    return {
      title: `${project.title} - ${difficultyLabel} Project | Vibed to Cracked`,
      description:
        project.description ??
        `Build this ${difficultyLabel.toLowerCase()} guided project and add it to your portfolio.`,
      openGraph: {
        title: `${project.title} - Guided Project`,
        description:
          project.description ??
          "Build real-world applications with guided projects.",
        type: "website",
        url: `/projects/${slug}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `${project.title} - Guided Project`,
        description: `${difficultyLabel} guided project - build it now.`,
      },
      alternates: {
        canonical: `/projects/${slug}`,
      },
    };
  } catch {
    return {
      title: "Guided Project | Vibed to Cracked",
      description:
        "Build real-world applications with guided coding projects.",
      alternates: {
        canonical: `/projects/${slug}`,
      },
    };
  }
}

export default function ProjectSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
