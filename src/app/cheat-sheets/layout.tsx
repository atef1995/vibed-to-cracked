import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://vibed-to-cracked.com";
    const response = await fetch(`${baseUrl}/api/cheat-sheets`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error("Failed to fetch cheat sheets");

    const data = await response.json();
    const total = data.pagination?.total || 0;
    const countLabel =
      total > 0 ? `${total}+ Guides` : "Quick Reference Guides";

    return {
      title: `Cheat Sheets - ${countLabel} | Vibed to Cracked`,
      description:
        "Download quick reference cheat sheets for DSA, algorithms, data structures, JavaScript, and more. Free and premium guides for all skill levels.",
      keywords:
        "cheat sheets, quick reference, DSA cheat sheet, data structures, algorithms, javascript cheat sheet, programming cheat sheet, big o notation",
      openGraph: {
        title: "Quick Reference Cheat Sheets for Programmers",
        description:
          "Downloadable cheat sheets for DSA, algorithms, JavaScript, and more. Free and premium tiers.",
        type: "website",
        url: "/cheat-sheets",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Quick Reference Cheat Sheets for Programmers",
        description:
          "Downloadable cheat sheets for DSA, algorithms, JavaScript, and more.",
      },
      alternates: {
        canonical: "/cheat-sheets",
      },
    };
  } catch {
    return {
      title: "Cheat Sheets - Quick Reference Guides | Vibed to Cracked",
      description:
        "Download quick reference cheat sheets for DSA, algorithms, data structures, JavaScript, and more.",
      keywords:
        "cheat sheets, quick reference, DSA cheat sheet, data structures, algorithms, programming",
      openGraph: {
        title: "Quick Reference Cheat Sheets for Programmers",
        description:
          "Downloadable cheat sheets for DSA, algorithms, JavaScript, and more.",
        type: "website",
        url: "/cheat-sheets",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Quick Reference Cheat Sheets for Programmers",
        description:
          "Downloadable cheat sheets for DSA, algorithms, JavaScript, and more.",
      },
      alternates: {
        canonical: "/cheat-sheets",
      },
    };
  }
}

export default function CheatSheetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
