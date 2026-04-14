import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Code,
  BrainCircuit,
  Lock,
  Clock,
  Building2,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@/lib/subscriptionConstants";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

interface Props {
  params: Promise<{ companySlug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const companies = await prisma.interviewCompany.findMany({
      where: { published: true, prepGuide: { isNot: null } },
      select: { slug: true },
    });
    return companies.map((c) => ({ companySlug: c.slug }));
  } catch {
    return [];
  }
}

const TYPE_META: Record<
  string,
  { label: string; icon: typeof Code; color: string }
> = {
  BEHAVIORAL: {
    label: "Behavioral",
    icon: Users,
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  TECHNICAL: {
    label: "Technical",
    icon: Code,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  SYSTEM_DESIGN: {
    label: "System Design",
    icon: BrainCircuit,
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  MEDIUM:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default async function CompanyPrepPage({ params }: Props) {
  const { companySlug } = await params;

  let data;
  try {
    data = await InterviewPrepService.getCompanyPrepGuide(companySlug);
  } catch {
    notFound();
  }

  const { company, guide, totalQuestions, questionBreakdown } = data;

  const session = await getServerSession(authOptions);
  const userPlan =
    (session?.user as { subscription?: string })?.subscription ?? Plan.FREE;

  type WalkthroughItem = {
    id: string;
    questionId: string;
    question: string;
    type: string;
    difficulty: string;
    category: string | null;
    timeGuidance: string | null;
    requiredPlan: string;
    locked: boolean;
    order: number;
  };

  let walkthroughs: WalkthroughItem[];
  try {
    walkthroughs = await InterviewPrepService.getQuestionWalkthroughs(
      companySlug,
      undefined,
      userPlan
    );
  } catch {
    walkthroughs = [];
  }

  const byType: Record<string, WalkthroughItem[]> = {};
  for (const w of walkthroughs) {
    if (!byType[w.type]) byType[w.type] = [];
    byType[w.type].push(w);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${company.name} Interview Preparation`,
    description: `Comprehensive interview preparation for ${company.name} covering behavioral, technical, and system design questions.`,
    url: `https://vibed-to-cracked.com/interview-prep/${companySlug}`,
    provider: {
      "@type": "Organization",
      name: "Vibed to Cracked",
      url: "https://vibed-to-cracked.com",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://vibed-to-cracked.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Interview Prep",
        item: "https://vibed-to-cracked.com/interview-prep",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: company.name,
        item: `https://vibed-to-cracked.com/interview-prep/${companySlug}`,
      },
    ],
  };

  const typeOrder = ["BEHAVIORAL", "TECHNICAL", "SYSTEM_DESIGN"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Header */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link
            href="/interview-prep"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Companies
          </Link>

          <div className="flex items-start gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="h-14 w-14 rounded-xl object-contain bg-gray-100 dark:bg-gray-800 p-2 shrink-0"
                width={56}
                height={56}
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <Building2 className="h-7 w-7 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {company.name} Interview Prep
              </h1>
              {company.interviewStyle && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {company.interviewStyle}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-6">
            {questionBreakdown.map((b) => {
              const meta = TYPE_META[b.type] ?? TYPE_META.TECHNICAL;
              return (
                <span
                  key={`${b.type}-${b.difficulty}`}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${meta.color}`}
                >
                  <meta.icon className="h-3.5 w-3.5" />
                  {b._count} {meta.label}
                  {b.difficulty !== "MEDIUM" &&
                    ` (${b.difficulty.charAt(0)}${b.difficulty.slice(1).toLowerCase()})`}
                </span>
              );
            })}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {totalQuestions} total
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
        {/* Company Overview */}
        {guide.overview && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Interview Overview
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {guide.overview}
              </p>
            </div>
          </section>
        )}

        {/* Culture Breakdown */}
        {guide.cultureBreakdown && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Culture & Values
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {guide.cultureBreakdown}
              </p>
            </div>
          </section>
        )}

        {/* Interviewer Tips */}
        {guide.interviewerTips && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Interviewer Tips
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {guide.interviewerTips}
              </p>
            </div>
          </section>
        )}

        {/* Question Walkthroughs */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Question Walkthroughs
          </h2>

          {walkthroughs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Question walkthroughs are coming soon.
            </p>
          ) : (
            <div className="space-y-8">
              {typeOrder.map((type) => {
                const questions = byType[type];
                if (!questions?.length) return null;
                const meta = TYPE_META[type] ?? TYPE_META.TECHNICAL;
                const Icon = meta.icon;

                return (
                  <div key={type}>
                    <h3 className="flex items-center gap-2 text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                      <Icon className="h-5 w-5" />
                      {meta.label} Questions
                    </h3>

                    <div className="space-y-3">
                      {questions.map((q) => (
                        <Link
                          key={q.questionId}
                          href={
                            q.locked
                              ? "/pricing"
                              : `/interview-prep/${companySlug}/${q.questionId}`
                          }
                          className={`group flex items-start gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all ${
                            q.locked
                              ? "opacity-75"
                              : "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                              {q.question}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  DIFFICULTY_COLORS[q.difficulty] ??
                                  DIFFICULTY_COLORS.MEDIUM
                                }`}
                              >
                                {q.difficulty.charAt(0) +
                                  q.difficulty.slice(1).toLowerCase()}
                              </span>
                              {q.timeGuidance && (
                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {q.timeGuidance}
                                </span>
                              )}
                            </div>
                          </div>

                          {q.locked ? (
                            <Lock className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
                          ) : (
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
