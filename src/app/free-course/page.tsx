import type { Metadata } from "next";
import FreeCourseContent from "@/components/free-course/FreeCourseContent";

export const metadata: Metadata = {
  title: "Free JavaScript Course - Learn JS in 5 Days | Vibed to Cracked",
  description:
    "Get a free 5-day email course that teaches you JavaScript fundamentals. Variables, functions, arrays, DOM manipulation, and a hands-on project — straight to your inbox.",
  keywords:
    "free javascript course, learn javascript, javascript email course, javascript for beginners, javascript fundamentals",
  openGraph: {
    title: "Free JavaScript Course - Learn JS in 5 Days | Vibed to Cracked",
    description:
      "A free 5-day email course covering JavaScript fundamentals: variables, functions, arrays, DOM manipulation, and a hands-on project.",
    url: "/free-course",
    type: "website",
    siteName: "Vibed to Cracked",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free JavaScript Course - Learn JS in 5 Days | Vibed to Cracked",
    description:
      "A free 5-day email course covering JavaScript fundamentals: variables, functions, arrays, DOM manipulation, and a hands-on project.",
  },
  alternates: {
    canonical: "/free-course",
  },
};

export default function FreeCoursePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <FreeCourseContent />
    </div>
  );
}
