"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  ArrowRight,
  Star,
  TrendingUp,
  TrendingDown,
  Loader,
} from "lucide-react";
import { getScoreLabel } from "@/lib/interviewConstants";

interface RoundData {
  id: string;
  questionText: string;
  responseText?: string | null;
  responseCode?: string | null;
  score?: number | null;
  order: number;
  feedback?: {
    strengths?: string[];
    weaknesses?: string[];
    suggestion?: string;
  } | null;
}

interface InterviewResult {
  id: string;
  overallScore: number;
  status: string;
  interviewType: string;
  isPreview: boolean;
  company: {
    slug: string;
    name: string;
    color: string;
  };
  rounds: RoundData[];
  feedback?: {
    overallScore?: number;
    hiringRecommendation?: string;
    categoryScores?: Record<string, number>;
    topStrengths?: string[];
    areasToImprove?: string[];
    detailedFeedback?: string;
  } | null;
}

function ScoreRing({ score }: { score: number }) {
  const normalizedScore = Math.min(10, Math.max(0, score));
  const percent = normalizedScore * 10;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percent / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 8) return "text-green-500";
    if (s >= 6) return "text-blue-500";
    if (s >= 4) return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = (s: number) => {
    if (s >= 8) return "stroke-green-500";
    if (s >= 6) return "stroke-blue-500";
    if (s >= 4) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          className={getStrokeColor(normalizedScore)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getColor(normalizedScore)}`}>
          {normalizedScore.toFixed(1)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">/10</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  const normalizedScore = Math.min(10, Math.max(0, score));
  const width = normalizedScore * 10;

  const getBarColor = (s: number) => {
    if (s >= 8) return "bg-green-500";
    if (s >= 6) return "bg-blue-500";
    if (s >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
          {label.replace(/([A-Z])/g, " $1").trim()}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {normalizedScore.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${getBarColor(normalizedScore)} transition-all duration-700`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function InterviewResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/mock-interview/${id}/results`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setInterview(data.interview);
      } catch {
        router.replace("/mock-interview");
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id, router]);

  if (loading || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const feedback = interview.feedback;
  const overallScore = feedback?.overallScore ?? interview.overallScore ?? 0;
  const scoreLabel = getScoreLabel(overallScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/mock-interview"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Companies
        </Link>

        {/* Score Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreRing score={overallScore} />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {interview.company.name} Interview
              </h1>
              <p className="text-lg font-medium text-violet-600 dark:text-violet-400 mb-2">
                {scoreLabel}
              </p>
              {feedback?.hiringRecommendation && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hiring Signal:{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {feedback.hiringRecommendation}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {feedback?.categoryScores &&
          Object.keys(feedback.categoryScores).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                Category Breakdown
              </h2>
              <div className="space-y-4">
                {Object.entries(feedback.categoryScores).map(([cat, score]) => (
                  <CategoryBar key={cat} label={cat} score={score as number} />
                ))}
              </div>
            </div>
          )}

        {/* Strengths & Areas to Improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {feedback?.topStrengths && feedback.topStrengths.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.topStrengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <Star className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback?.areasToImprove && feedback.areasToImprove.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {feedback.areasToImprove.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <ArrowRight className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Detailed Feedback */}
        {feedback?.detailedFeedback && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Detailed Feedback
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {feedback.detailedFeedback}
            </p>
          </div>
        )}

        {/* Per-Question Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Question Breakdown
          </h2>
          <div className="space-y-6">
            {interview.rounds.map((round) => (
              <div
                key={round.id}
                className="border-b border-gray-100 dark:border-gray-700 pb-5 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Q{round.order}: {round.questionText}
                  </p>
                  {round.score !== null && round.score !== undefined && (
                    <span
                      className={`text-sm font-bold shrink-0 ml-4 ${
                        round.score >= 7
                          ? "text-green-600 dark:text-green-400"
                          : round.score >= 4
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {round.score}/10
                    </span>
                  )}
                </div>
                {round.responseText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                    Your answer: {round.responseText}
                  </p>
                )}
                {round.feedback?.suggestion && (
                  <p className="text-xs text-violet-600 dark:text-violet-400">
                    Tip: {round.feedback.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/mock-interview/${interview.company.slug}`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Practice Again
          </Link>
          <Link
            href="/mock-interview"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Try Another Company
          </Link>
        </div>
      </div>
    </div>
  );
}
