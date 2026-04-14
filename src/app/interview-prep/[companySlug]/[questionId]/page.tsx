import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Lock,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plan } from "@/lib/subscriptionConstants";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

interface Props {
  params: Promise<{ companySlug: string; questionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug, questionId } = await params;

  try {
    const walkthrough = await InterviewPrepService.getWalkthrough(
      questionId,
      "CRACKED"
    );
    const q = walkthrough.question;
    const companyName = q.company.name;
    const typeLabel =
      q.type === "SYSTEM_DESIGN"
        ? "System Design"
        : q.type.charAt(0) + q.type.slice(1).toLowerCase();

    const title = `${q.question.slice(0, 60)} | ${companyName} Interview`;
    const description = `${typeLabel} interview question from ${companyName}: "${q.question.slice(0, 120)}". Includes model answer, scoring rubric, common mistakes, and follow-up questions.`;

    return {
      title,
      description,
      keywords: `${companyName} interview question, ${typeLabel.toLowerCase()} interview, ${companyName.toLowerCase()} ${typeLabel.toLowerCase()}, interview walkthrough`,
      openGraph: {
        title,
        description,
        type: "article",
        url: `/interview-prep/${companySlug}/${questionId}`,
        siteName: "Vibed to Cracked",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: {
        canonical: `/interview-prep/${companySlug}/${questionId}`,
      },
    };
  } catch {
    return {
      title: "Question Walkthrough | Vibed to Cracked",
      description:
        "Detailed question walkthrough with model answer, scoring rubric, and common mistakes.",
    };
  }
}

interface Approach {
  name: string;
  explanation: string;
  code?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

interface RubricTier {
  range: string;
  criteria: string;
}

export default async function QuestionWalkthroughPage({ params }: Props) {
  const { companySlug, questionId } = await params;

  const session = await getServerSession(authOptions);
  const userPlan =
    (session?.user as { subscription?: string })?.subscription ?? Plan.FREE;

  let walkthrough;
  let locked = false;

  try {
    walkthrough = await InterviewPrepService.getWalkthrough(
      questionId,
      userPlan
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Upgrade required") {
      locked = true;
      // Fetch with full access to get metadata-only fields for the locked preview
      try {
        walkthrough = await InterviewPrepService.getWalkthrough(
          questionId,
          "CRACKED"
        );
      } catch {
        notFound();
      }
    } else {
      notFound();
    }
  }

  const q = walkthrough.question;
  const companyName = q.company.name;
  const typeLabel =
    q.type === "SYSTEM_DESIGN"
      ? "System Design"
      : q.type.charAt(0) + q.type.slice(1).toLowerCase();

  const rubric = (walkthrough.scoringRubric ?? []) as unknown as RubricTier[];
  const commonMistakes = (walkthrough.commonMistakes ?? []) as unknown as string[];
  const followUpQuestions = (walkthrough.followUpQuestions ?? []) as unknown as string[];
  const approaches = (walkthrough.approaches ?? []) as unknown as Approach[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: q.question,
    description: `${typeLabel} interview question walkthrough from ${companyName}`,
    url: `https://vibed-to-cracked.com/interview-prep/${companySlug}/${questionId}`,
    educationalLevel: q.difficulty,
    learningResourceType: "Practice Problem",
    provider: {
      "@type": "Organization",
      name: "Vibed to Cracked",
      url: "https://vibed-to-cracked.com",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: locked
            ? `This is a ${typeLabel.toLowerCase()} question asked at ${companyName}. Upgrade to access the full model answer.`
            : (walkthrough.modelAnswer?.slice(0, 300) ?? ""),
        },
      },
      ...followUpQuestions.map((fq) => ({
        "@type": "Question",
        name: fq,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Follow-up question related to the ${companyName} ${typeLabel.toLowerCase()} interview.`,
        },
      })),
    ],
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
        name: companyName,
        item: `https://vibed-to-cracked.com/interview-prep/${companySlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: q.question.slice(0, 50),
        item: `https://vibed-to-cracked.com/interview-prep/${companySlug}/${questionId}`,
      },
    ],
  };

  const DIFFICULTY_COLORS: Record<string, string> = {
    EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    MEDIUM:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

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
          __html: JSON.stringify(faqLd).replace(/</g, "\\u003c"),
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
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link
            href={`/interview-prep/${companySlug}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {companyName} Questions
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {q.question}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                DIFFICULTY_COLORS[q.difficulty] ?? DIFFICULTY_COLORS.MEDIUM
              }`}
            >
              {q.difficulty.charAt(0) + q.difficulty.slice(1).toLowerCase()}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {typeLabel}
            </span>
            {q.category && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {q.category}
              </span>
            )}
            {walkthrough.timeGuidance && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                {walkthrough.timeGuidance}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {locked ? (
          /* Locked state */
          <div className="text-center py-16">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Premium Walkthrough
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              This question walkthrough requires a VIBED or CRACKED
              subscription. Upgrade to access model answers, scoring rubrics,
              and approach strategies.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Plans
            </Link>
          </div>
        ) : (
          <>
            {/* Model Answer */}
            {walkthrough.modelAnswer && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Model Answer
                </h2>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {walkthrough.modelAnswer}
                  </div>
                </div>
              </section>
            )}

            {/* Approaches (for technical questions) */}
            {approaches.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Approaches
                </h2>
                <div className="space-y-4">
                  {approaches.map((approach, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {approach.name}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {approach.explanation}
                      </p>
                      {approach.code && (
                        <pre className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 rounded-lg p-4 overflow-x-auto mb-3">
                          <code>{approach.code}</code>
                        </pre>
                      )}
                      {(approach.timeComplexity ||
                        approach.spaceComplexity) && (
                        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {approach.timeComplexity && (
                            <span>Time: {approach.timeComplexity}</span>
                          )}
                          {approach.spaceComplexity && (
                            <span>Space: {approach.spaceComplexity}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Scoring Rubric */}
            {rubric.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Scoring Rubric
                </h2>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {rubric.map((tier, i) => (
                    <div key={i} className="p-4 flex gap-4">
                      <span className="text-sm font-mono font-medium text-gray-500 dark:text-gray-400 shrink-0 w-14">
                        {tier.range}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {tier.criteria}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Common Mistakes */}
            {commonMistakes.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Common Mistakes
                </h2>
                <ul className="space-y-3">
                  {commonMistakes.map((mistake, i) => (
                    <li
                      key={i}
                      className="flex gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <span className="text-amber-500 font-medium shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {mistake}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Follow-up Questions */}
            {followUpQuestions.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Follow-up Questions
                </h2>
                <ul className="space-y-3">
                  {followUpQuestions.map((fq, i) => (
                    <li
                      key={i}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {fq}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
