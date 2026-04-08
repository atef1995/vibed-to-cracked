import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const projectCount = await prisma.project.count({
      where: { published: true },
    });

    return {
      title: `Coding Projects - ${projectCount}+ Guided Projects | Vibed to Cracked`,
      description: `Build real-world projects with ${projectCount}+ guided coding projects. Full-stack, frontend, and backend projects for all skill levels.`,
      keywords:
        "coding projects, guided projects, full-stack projects, portfolio projects, web development projects",
      openGraph: {
        title: "Coding Projects - Build Real-World Applications",
        description: `${projectCount}+ guided projects to build your portfolio and sharpen your skills.`,
        type: "website",
        url: "/projects",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Coding Projects - Build Real-World Applications",
        description: `${projectCount}+ guided coding projects across all skill levels.`,
      },
      alternates: {
        canonical: "/projects",
      },
    };
  } catch {
    return {
      title: "Coding Projects | Vibed to Cracked",
      description:
        "Build real-world applications with guided coding projects. Full-stack, frontend, and backend projects.",
      alternates: {
        canonical: "/projects",
      },
    };
  }
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
