import type { Metadata } from "next";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const companies = await InterviewPrepService.getAllCompaniesWithGuides();
    const companyNames = companies.map((c) => c.name).join(", ");
    const count = companies.length;

    return {
      title: `Interview Prep - ${count} Top Tech Companies | Vibed to Cracked`,
      description: `Prepare for software engineering interviews at ${companyNames} and more. Company-specific guides, question walkthroughs with model answers, scoring rubrics, and common mistakes.`,
      keywords:
        "interview prep, software engineer interview, coding interview preparation, technical interview, behavioral interview, system design interview, Amazon interview, Google interview, Meta interview, Apple interview, Microsoft interview",
      openGraph: {
        title: `Tech Interview Prep - ${count} Company Guides`,
        description: `Detailed interview guides for ${companyNames}. Question walkthroughs, model answers, scoring rubrics, and follow-up questions.`,
        type: "website",
        url: "/interview-prep",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `Tech Interview Prep - ${count} Company Guides`,
        description: `Detailed interview guides for ${companyNames}. Question walkthroughs, model answers, and scoring rubrics.`,
      },
      alternates: {
        canonical: "/interview-prep",
      },
    };
  } catch (error) {
    console.error("Error generating interview-prep metadata:", error);

    return {
      title: "Interview Prep - Tech Company Guides | Vibed to Cracked",
      description:
        "Prepare for software engineering interviews at top tech companies. Company-specific guides, question walkthroughs, model answers, and scoring rubrics.",
      keywords:
        "interview prep, software engineer interview, coding interview preparation, technical interview, behavioral interview, system design interview",
      openGraph: {
        title: "Tech Interview Prep - Company Guides",
        description:
          "Detailed interview guides for top tech companies. Question walkthroughs, model answers, and scoring rubrics.",
        type: "website",
        url: "/interview-prep",
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: "Tech Interview Prep - Company Guides",
        description:
          "Detailed interview guides for top tech companies. Question walkthroughs, model answers, and scoring rubrics.",
      },
      alternates: {
        canonical: "/interview-prep",
      },
    };
  }
}

export default function InterviewPrepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
