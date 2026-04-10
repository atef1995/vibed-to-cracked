"use client";

import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Play,
  Eye,
  Briefcase,
  Code,
  Shuffle,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

interface CompanyDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  interviewStyle: string;
  color: string;
  _count: { questions: number };
}

const INTERVIEW_TYPES = [
  {
    value: "BEHAVIORAL",
    label: "Behavioral",
    icon: Briefcase,
    desc: "Leadership, teamwork, conflict resolution",
  },
  {
    value: "TECHNICAL",
    label: "Technical",
    icon: Code,
    desc: "Coding, system design, algorithms",
  },
  {
    value: "MIXED",
    label: "Mixed",
    icon: Shuffle,
    desc: "Combination of behavioral and technical",
  },
];

export default function CompanySetupPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("MIXED");
  const [starting, setStarting] = useState(false);
  const [startingPreview, setStartingPreview] = useState(false);

  const { data: companiesData } = useQuery({
    queryKey: ["interview-companies"],
    queryFn: async () => {
      const res = await fetch("/api/mock-interview/companies");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const company: CompanyDetail | undefined = companiesData?.companies?.find(
    (c: CompanyDetail) => c.slug === companySlug
  );

  const startInterview = async (isPreview: boolean) => {
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    if (isPreview) {
      setStartingPreview(true);
    } else {
      setStarting(true);
    }

    try {
      const res = await fetch("/api/mock-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug,
          interviewType: isPreview ? undefined : selectedType,
          isPreview,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 402) {
          router.push("/mock-interview/credits");
          return;
        }
        throw new Error(err.error || "Failed to start interview");
      }

      const data = await res.json();
      router.push(`/mock-interview/session/${data.interview.id}`);
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setStarting(false);
      setStartingPreview(false);
    }
  };

  if (!company) {
    return (
      <PageLayout title="Loading..." className="flex flex-col items-center">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="" className="flex flex-col items-center">
      <div className="max-w-3xl w-full">
        {/* Back Link */}
        <Link
          href="/mock-interview"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All Companies
        </Link>

        {/* Company Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: company.color }}
            >
              {company.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {company.name} Interview
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {company._count.questions} questions available
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {company.description}
          </p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            Style: {company.interviewStyle}
          </div>
        </div>

        {/* Interview Type Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose Interview Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INTERVIEW_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mb-2 ${
                      isSelected
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`font-medium ${
                      isSelected
                        ? "text-violet-700 dark:text-violet-300"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {type.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => startInterview(false)}
            disabled={starting || !session?.user}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starting ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            Start Full Interview
          </button>
          <button
            onClick={() => startInterview(true)}
            disabled={startingPreview}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
          >
            {startingPreview ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
            30s Preview
          </button>
        </div>

        {!session?.user && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            <Link
              href="/auth/signin"
              className="text-violet-600 dark:text-violet-400 hover:underline"
            >
              Sign in
            </Link>{" "}
            to start a full interview. Previews are available for all users.
          </p>
        )}
      </div>
    </PageLayout>
  );
}
