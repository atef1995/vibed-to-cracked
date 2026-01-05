import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://vibed-to-cracked.com";
    const response = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch blog posts");
    }

    const data = await response.json();
    const postCount = data.pagination?.totalCount || 0;

    return {
      title: `Blog - ${postCount}+ Articles on Programming & Tech | Vibed to Cracked`,
      description: `Read ${postCount}+ articles on programming, web development, coding tips, and tech insights. Stay updated with the latest in software development.`,
      keywords:
        "programming blog, coding articles, web development blog, tech insights, software development, javascript tips, coding tutorials",
      openGraph: {
        title: "Blog - Programming & Tech Articles | Vibed to Cracked",
        description: `${postCount}+ articles on programming, web development, and tech insights.`,
        type: "website",
        url: "/blog",
      },
    };
  } catch (error) {
    console.error("Error generating blog metadata:", error);

    return {
      title: "Blog - Programming & Tech Articles | Vibed to Cracked",
      description:
        "Read articles on programming, web development, coding tips, and tech insights. Stay updated with the latest in software development.",
      keywords:
        "programming blog, coding articles, web development blog, tech insights, software development",
      openGraph: {
        title: "Blog - Programming & Tech Articles | Vibed to Cracked",
        description:
          "Articles on programming, web development, and tech insights.",
        type: "website",
        url: "/blog",
      },
    };
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
