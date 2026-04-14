import type { Metadata } from "next";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

interface Props {
  params: Promise<{ companySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug } = await params;

  try {
    const { company, totalQuestions } =
      await InterviewPrepService.getCompanyPrepGuide(companySlug);

    const title = `${company.name} Interview Prep - ${totalQuestions} Questions | Vibed to Cracked`;
    const description = `Prepare for your ${company.name} software engineering interview. ${totalQuestions} question walkthroughs with model answers, scoring rubrics, and common mistakes. Covers behavioral, technical, and system design.`;

    return {
      title,
      description,
      keywords: `${company.name} interview prep, ${company.name} interview questions, ${company.name.toLowerCase()} software engineer interview, ${company.name.toLowerCase()} coding interview, ${company.name.toLowerCase()} behavioral interview, ${company.name.toLowerCase()} system design`,
      openGraph: {
        title: `${company.name} Interview Prep - ${totalQuestions} Questions`,
        description,
        type: "website",
        url: `/interview-prep/${companySlug}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title: `${company.name} Interview Prep - ${totalQuestions} Questions`,
        description,
      },
      alternates: {
        canonical: `/interview-prep/${companySlug}`,
      },
    };
  } catch {
    return {
      title: "Interview Prep | Vibed to Cracked",
      description:
        "Prepare for software engineering interviews at top tech companies.",
      alternates: {
        canonical: `/interview-prep/${companySlug}`,
      },
    };
  }
}

export default function CompanyPrepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
