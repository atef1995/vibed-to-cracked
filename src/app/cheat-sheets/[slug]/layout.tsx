import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const sheet = await prisma.cheatSheet.findUnique({
      where: { slug, published: true },
      select: {
        title: true,
        description: true,
        tags: true,
        category: true,
        topic: true,
      },
    });

    if (!sheet) {
      return {
        title: "Cheat Sheet Not Found | Vibed to Cracked",
        description: "The requested cheat sheet could not be found.",
      };
    }

    return {
      title: `${sheet.title} - Quick Reference | Vibed to Cracked`,
      description: sheet.description,
      keywords: [
        sheet.category,
        sheet.topic,
        ...sheet.tags,
        "cheat sheet",
        "quick reference",
      ].join(", "),
      openGraph: {
        title: `${sheet.title} - Quick Reference`,
        description: sheet.description,
        type: "article",
        url: `/cheat-sheets/${slug}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `${sheet.title} - Quick Reference`,
        description: sheet.description,
      },
      alternates: {
        canonical: `/cheat-sheets/${slug}`,
      },
    };
  } catch {
    const formattedTitle = slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      title: `${formattedTitle} Cheat Sheet | Vibed to Cracked`,
      description: "Quick reference cheat sheet for programmers.",
      alternates: {
        canonical: `/cheat-sheets/${slug}`,
      },
    };
  }
}

export default function CheatSheetSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
