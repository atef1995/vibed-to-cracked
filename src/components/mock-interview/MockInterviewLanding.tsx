"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Video, Users, Star, ArrowRight } from "lucide-react";
import Card, { CardAction } from "@/components/ui/Card";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";

interface Company {
  id: string;
  slug: string;
  name: string;
  description: string;
  interviewStyle: string;
  color: string;
  _count: { questions: number };
}

interface CompaniesResponse {
  companies: Company[];
}

const COMPANY_COLORS: Record<string, string> = {
  "#FF9900": "from-orange-400 to-orange-600",
  "#4285F4": "from-blue-400 to-blue-600",
  "#0668E1": "from-blue-500 to-blue-700",
  "#A2AAAD": "from-gray-400 to-gray-600",
  "#E50914": "from-red-500 to-red-700",
  "#00A4EF": "from-cyan-400 to-cyan-600",
  "#635BFF": "from-violet-400 to-violet-600",
  "#000000": "from-gray-700 to-gray-900",
  "#FF5A5F": "from-rose-400 to-rose-600",
  "#1DB954": "from-green-400 to-green-600",
  "#0A66C2": "from-blue-600 to-blue-800",
  "#00A1E0": "from-sky-400 to-sky-600",
  "#FF0000": "from-red-400 to-red-600",
  "#96BF48": "from-lime-400 to-lime-600",
  "#0052FF": "from-blue-500 to-indigo-600",
  "#254BDD": "from-indigo-500 to-indigo-700",
  "#CC0000": "from-red-600 to-red-800",
  "#76B900": "from-green-500 to-green-700",
};

function getGradient(color: string): string {
  return COMPANY_COLORS[color] || "from-violet-400 to-violet-600";
}

export default function MockInterviewLanding() {
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery<CompaniesResponse>({
    queryKey: ["interview-companies"],
    queryFn: async () => {
      const res = await fetch("/api/mock-interview/companies");
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });

  const companies = data?.companies ?? [];

  return (
    <PageLayout
      title="AI Mock Interviews"
      subtitle="Practice with AI interviewers from top tech companies. Get real questions, honest feedback, and a hiring likelihood score."
      className="flex flex-col items-center"
    >
      <div className="max-w-7xl w-full">
        {/* Hero Stats */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Video className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Companies
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {companies.length || "18"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real Questions
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {companies.reduce((sum, c) => sum + c._count.questions, 0) || "65+"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Star className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Scoring
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                0-10 Scale
              </p>
            </div>
          </div>
        </div>

        {/* Not signed in notice */}
        {!session?.user && (
          <div className="mb-8 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg">
            <p className="text-sm text-violet-900 dark:text-violet-100">
              Sign in to start mock interviews and track your progress. Every company offers a free 30-second preview.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <ContentGrid columns="3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </ContentGrid>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            Failed to load companies. Please try again later.
          </div>
        )}

        {/* Companies Grid */}
        {!isLoading && companies.length > 0 && (
          <ContentGrid columns="3">
            {companies.map((company) => (
              <Link
                key={company.slug}
                href={`/mock-interview/${company.slug}`}
              >
                <Card onClick={() => {}}>
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(company.color)} flex items-center justify-center text-white font-bold text-lg shrink-0`}
                    >
                      {company.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {company.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {company._count.questions} questions
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {company.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {company.interviewStyle}
                    </span>
                    <span className="text-sm text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1">
                      Practice <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </ContentGrid>
        )}

        {/* How It Works */}
        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Pick a Company",
                desc: "Choose from 18 top tech companies, each with their own interview style and question bank.",
              },
              {
                step: "2",
                title: "Interview with AI",
                desc: "Answer behavioral and technical questions. Get follow-up questions just like a real interview.",
              },
              {
                step: "3",
                title: "Get Your Score",
                desc: "Receive a 0-10 hiring likelihood score with detailed feedback on every answer.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
