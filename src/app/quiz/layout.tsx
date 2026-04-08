import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const quizCount = await prisma.quiz.count();

    return {
      title: `Coding Quizzes - ${quizCount}+ Interactive Quizzes | Vibed to Cracked`,
      description: `Test your skills with ${quizCount}+ interactive coding quizzes covering JavaScript, HTML, CSS, DSA, OOP, GitHub and more. Free to attempt, sign up to save your progress.`,
      keywords:
        "coding quizzes, javascript quiz, html css quiz, dsa quiz, oop quiz, programming test",
      openGraph: {
        title: "Coding Quizzes - Test Your Programming Knowledge",
        description: `${quizCount}+ interactive quizzes for JavaScript, HTML, CSS, DSA, OOP, GitHub and more.`,
        type: "website",
        url: "/quiz",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Coding Quizzes - Test Your Programming Knowledge",
        description: `${quizCount}+ interactive quizzes across multiple programming topics.`,
      },
      alternates: {
        canonical: "/quiz",
      },
    };
  } catch {
    return {
      title: "Coding Quizzes | Vibed to Cracked",
      description:
        "Test your coding knowledge with interactive quizzes. JavaScript, HTML, CSS, DSA, OOP, GitHub and more.",
      alternates: {
        canonical: "/quiz",
      },
    };
  }
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
