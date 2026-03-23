import type { Metadata } from "next";
import { BlogService } from "@/lib/blogService";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const postCount = await BlogService.getPostsCount();

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
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Blog - Programming & Tech Articles | Vibed to Cracked",
        description: `${postCount}+ articles on programming, web development, and tech insights.`,
      },
      alternates: {
        canonical: "/blog",
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
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Blog - Programming & Tech Articles | Vibed to Cracked",
        description:
          "Articles on programming, web development, and tech insights.",
      },
      alternates: {
        canonical: "/blog",
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
