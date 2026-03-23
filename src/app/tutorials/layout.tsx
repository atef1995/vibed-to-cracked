import type { Metadata } from "next";
import { TutorialService } from "@/lib/tutorialService";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const tutorialCount = await TutorialService.getTutorialsCount();

    return {
      title: `Learn Coding - ${tutorialCount}+ Free Tutorials | JavaScript, HTML, CSS, OOP, DSA | Vibed to Cracked`,
      description: `Master programming with ${tutorialCount}+ comprehensive tutorials covering JavaScript, HTML, CSS, GitHub, OOP, DSA and more. Learn at your own pace with mood-driven content.`,
      keywords:
        "coding tutorials, javascript tutorial, html css tutorial, learn programming, dsa tutorial, oop tutorial, github tutorial, web development",
      openGraph: {
        title: "Learn Coding - Comprehensive Tutorials for All Levels",
        description: `${tutorialCount}+ interactive tutorials to help you master JavaScript, HTML, CSS, DSA, OOP and more.`,
        type: "website",
        url: "/tutorials",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Learn Coding - Comprehensive Tutorials for All Levels",
        description: `${tutorialCount}+ interactive tutorials to help you master JavaScript, HTML, CSS, DSA, OOP and more.`,
      },
      alternates: {
        canonical: "/tutorials",
      },
    };
  } catch (error) {
    console.error("Error generating tutorials metadata:", error);

    return {
      title: "Learn Coding - Free Programming Tutorials | Vibed to Cracked",
      description:
        "Master programming with comprehensive tutorials covering JavaScript, HTML, CSS, GitHub, OOP, DSA and more. Learn at your own pace with personalized difficulty levels.",
      keywords:
        "coding tutorials, javascript tutorial, html css tutorial, learn programming, dsa tutorial, oop tutorial, github tutorial, web development",
      openGraph: {
        title: "Learn Coding - Comprehensive Tutorials for All Levels",
        description:
          "Interactive tutorials for JavaScript, HTML, CSS, DSA, OOP, GitHub and more.",
        type: "website",
        url: "/tutorials",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Learn Coding - Comprehensive Tutorials for All Levels",
        description:
          "Interactive tutorials for JavaScript, HTML, CSS, DSA, OOP, GitHub and more.",
      },
      alternates: {
        canonical: "/tutorials",
      },
    };
  }
}

export default function TutorialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
