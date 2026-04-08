import type { Metadata } from "next";
import { QuizService } from "@/lib/quizService";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const quiz = await QuizService.getQuizBySlug(slug);

    if (!quiz) {
      return {
        title: "Quiz Not Found - Vibed to Cracked",
        description: "The requested quiz could not be found.",
      };
    }

    // Extract category from tutorial or use generic "coding"
    const category = quiz.tutorialId
      ? quiz.tutorialId.split("-")[0] || "coding"
      : "coding";

    return {
      title: `${quiz.title} Quiz - Test Your ${category} Skills | Vibed to Cracked`,
      description: `Master ${quiz.title.toLowerCase()} with interactive quizzes. Free to attempt, sign up to save your score and track progress.`,
      keywords: `${quiz.title.toLowerCase()} quiz, ${quiz.title.toLowerCase()} test, coding practice, programming test`,
      openGraph: {
        title: `${quiz.title} Quiz - Challenge Yourself`,
        description: `Test your ${quiz.title.toLowerCase()} knowledge with interactive questions. Multiple difficulty levels available.`,
        type: "website",
        url: `/quiz/${slug}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `${quiz.title} Quiz - Challenge Yourself`,
        description: `Test your ${quiz.title.toLowerCase()} knowledge with interactive questions.`,
      },
      alternates: {
        canonical: `/quiz/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating quiz metadata:", error);

    // Fallback metadata
    return {
      title: "Interactive Coding Quiz - Vibed to Cracked",
      description:
        "Test your coding knowledge with interactive quizzes. Available for JavaScript, HTML, CSS, DSA, OOP, GitHub and more. Free to attempt, sign up to save your score.",
      keywords:
        "coding quiz, programming test, javascript test, html css quiz, dsa quiz, oop quiz",
      openGraph: {
        title: "Interactive Coding Quiz",
        description: "Challenge yourself with our interactive coding quizzes.",
        type: "website",
        url: `/quiz/${slug}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Interactive Coding Quiz",
        description: "Challenge yourself with our interactive coding quizzes.",
      },
      alternates: {
        canonical: `/quiz/${slug}`,
      },
    };
  }
}

export default async function QuizLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let jsonLd = null;
  try {
    const quiz = await QuizService.getQuizBySlug(slug);
    if (quiz) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Quiz",
        name: quiz.title,
        description: `Test your ${quiz.title.toLowerCase()} knowledge with interactive questions.`,
        url: `https://vibed-to-cracked.com/quiz/${slug}`,
        educationalLevel: "beginner to advanced",
        provider: {
          "@type": "Organization",
          name: "Vibed to Cracked",
          url: "https://vibed-to-cracked.com",
        },
      };
    }
  } catch {}

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
