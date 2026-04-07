"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MoodSelector } from "@/components/MoodSelector";
import { useProgressStats } from "@/hooks/useProgress";
import { ProgressStats } from "@/components/ProgressComponents";
import { AnonymousDashboard } from "@/components/AnonymousDashboard";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { RecommendedStart } from "@/components/dashboard/RecommendedStart";
import { CompactMoodSelector } from "@/components/dashboard/CompactMoodSelector";
import { RecentAchievements } from "@/components/dashboard/RecentAchievements";
import { TourProvider } from "@/components/onboarding/TourProvider";
import { useTourState } from "@/hooks/useTourState";
import {
  dashboardTourSteps,
  DASHBOARD_TOUR_ID,
} from "@/lib/tours/dashboardTour";
import {
  BookOpen,
  Code,
  Brain,
  Building,
  GitPullRequest,
  FileText,
  Zap,
  Gamepad,
  Newspaper,
  Star,
  Map,
  ArrowRight,
  MessageSquare,
  Wrench,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

interface ProgressStatsShape {
  tutorials: {
    completed: number;
    inProgress: number;
    notStarted: number;
    total: number;
  };
  challenges: {
    completed: number;
    inProgress: number;
    failed: number;
    notStarted: number;
    total: number;
  };
}

function StatusBadge({
  inProgress,
  completed,
  total,
}: {
  inProgress: number;
  completed: number;
  total: number;
}) {
  if (inProgress > 0) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
        In Progress
      </span>
    );
  }
  if (completed > 0 && completed < total) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
        {completed}/{total}
      </span>
    );
  }
  if (completed === 0) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        New
      </span>
    );
  }
  return null;
}

const exploreLinks = [
  {
    href: "/blog",
    icon: Newspaper,
    label: "Blog",
    color: "text-teal-600 dark:text-teal-400",
    hoverBorder: "hover:border-teal-200 dark:hover:border-teal-500",
  },
  {
    href: "/cheat-sheets",
    icon: FileText,
    label: "Cheat Sheets",
    color: "text-yellow-600 dark:text-yellow-400",
    hoverBorder: "hover:border-yellow-200 dark:hover:border-yellow-500",
  },
  {
    href: "/contributions",
    icon: GitPullRequest,
    label: "Contributions",
    color: "text-cyan-600 dark:text-cyan-400",
    hoverBorder: "hover:border-cyan-200 dark:hover:border-cyan-500",
  },
  {
    href: "/quiz-challenge",
    icon: Gamepad,
    label: "Quiz Challenge",
    color: "text-green-600 dark:text-green-400",
    hoverBorder: "hover:border-green-200 dark:hover:border-green-500",
  },
  {
    href: "/tools/complexity-visualizer",
    icon: Wrench,
    label: "Visualizer",
    color: "text-red-600 dark:text-red-400",
    hoverBorder: "hover:border-red-200 dark:hover:border-red-500",
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isRunning: tourRunning,
    startTour,
    completeTour,
  } = useTourState(DASHBOARD_TOUR_ID);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user &&
      session.user.onboardingCompleted === false
    ) {
      router.push("/onboarding");
    }
  }, [status, session, router]);

  // Start tour after onboarding redirect
  useEffect(() => {
    if (
      status === "authenticated" &&
      searchParams.get("onboarded") === "true"
    ) {
      const timer = setTimeout(() => startTour(), 500);
      return () => clearTimeout(timer);
    }
  }, [status, searchParams, startTour]);

  const {
    data: progressStats,
    isLoading: loadingProgress,
    error: progressError,
    isError: hasProgressError,
  } = useProgressStats(session?.user?.id);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return <AnonymousDashboard />;
  }

  const isNewUser =
    !loadingProgress &&
    progressStats &&
    progressStats.tutorials.completed === 0 &&
    progressStats.challenges.completed === 0 &&
    progressStats.projects.completed === 0;

  const userLevel = (session.user as Record<string, unknown>).level as
    | number
    | undefined;
  const userXp = (session.user as Record<string, unknown>).xp as
    | number
    | undefined;

  // Build subtitle with stats for returning users
  const statParts: string[] = [];
  if (userLevel && userLevel > 1) statParts.push(`Level ${userLevel}`);
  if (userXp) statParts.push(`${userXp.toLocaleString()} XP`);
  const subtitle = statParts.length
    ? statParts.join(" \u00B7 ")
    : "Ready to continue your web development journey?";

  return (
    <PageLayout
      subtitle={subtitle}
      title={`Welcome back, ${session?.user.name?.split(" ")[0]}`}
    >
      {/* 1. Continue where you left off (returning users) */}
      <ContinueLearning userId={session.user.id} />

      {/* 2. Recommended start — shown for new users */}
      {isNewUser && <RecommendedStart />}

      {/* 3. Mood selector — compact for returning users, full for new */}
      {isNewUser ? (
        <div className="mb-10" data-tour="mood-selector">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            How are you feeling today?
          </h2>
          <MoodSelector showDescription={true} />
        </div>
      ) : (
        <div data-tour="mood-selector">
          <CompactMoodSelector />
        </div>
      )}

      {/* Study Plan — clear shortcut */}
      <Link
        href="/study-plan"
        data-tour="study-plan"
        className="mb-10 flex items-center gap-4 bg-linear-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800/40 hover:border-indigo-200 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-800/40 flex items-center justify-center">
          <Map className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Your Study Plan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            See the full roadmap, track phases, and pick your next step
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
      </Link>

      {/* 4. Core Learning — the main learning loop */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Core Learning
        </h2>
        <div className="grid md:grid-cols-3 gap-6 auto-rows-fr">
          <Link
            href="/tutorials"
            data-tour="tutorials-section"
            className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500"
          >
            <div className="grow">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                {progressStats && (
                  <StatusBadge
                    inProgress={progressStats.tutorials.inProgress}
                    completed={progressStats.tutorials.completed}
                    total={progressStats.tutorials.total}
                  />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Tutorials
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                Interactive lessons with code examples
              </p>
            </div>

            <div className="mt-auto">
              {progressStats && progressStats.tutorials.total > 0 && (
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (progressStats.tutorials.completed /
                          progressStats.tutorials.total) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              )}
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Start Learning &rarr;
              </div>
            </div>
          </Link>

          <Link
            href="/exercises"
            data-tour="exercises-section"
            className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500"
          >
            <div className="grow">
              <div className="flex items-center justify-between mb-4">
                <Zap className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Exercises
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                Real-world coding with test validation
              </p>
            </div>

            <div className="mt-auto">
              <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium pt-3 border-t border-transparent">
                Start Exercising &rarr;
              </div>
            </div>
          </Link>

          <Link
            href="/practice"
            className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-500"
          >
            <div className="grow">
              <div className="flex items-center justify-between mb-4">
                <Code className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                {progressStats && (
                  <StatusBadge
                    inProgress={progressStats.challenges.inProgress}
                    completed={progressStats.challenges.completed}
                    total={progressStats.challenges.total}
                  />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Problem Solving
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                Algorithm challenges to sharpen your skills
              </p>
            </div>

            <div className="mt-auto">
              {progressStats && progressStats.challenges.total > 0 && (
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (progressStats.challenges.completed /
                          progressStats.challenges.total) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              )}
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Start Coding &rarr;
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Test Yourself */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Test Yourself
        </h2>
        <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
          <Link
            href="/quizzes"
            data-tour="quizzes-section"
            className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-500"
          >
            <div className="grow">
              <div className="flex items-center justify-between mb-4">
                <Brain className="h-7 w-7 text-green-600 dark:text-green-400" />
                {isNewUser && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                    <Star className="h-3 w-3" /> Recommended
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Quizzes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                Mood-adapted questions to test your knowledge
              </p>
            </div>

            <div className="mt-auto">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium pt-3 border-t border-transparent">
                Take Quiz &rarr;
              </div>
            </div>
          </Link>

          <Link
            href="/projects"
            className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-500"
          >
            <div className="grow">
              <div className="flex items-center justify-between mb-4">
                <Building className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                {progressStats && (
                  <StatusBadge
                    inProgress={progressStats.projects.inProgress}
                    completed={progressStats.projects.completed}
                    total={progressStats.projects.total}
                  />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Projects
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                Build real-world apps and get peer reviews
              </p>
            </div>

            <div className="mt-auto">
              <div className="text-sm text-orange-600 dark:text-orange-400 font-medium pt-3 border-t border-transparent">
                Start Building &rarr;
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Mentorship */}
      <Link
        href={
          session.user.subscription === "CRACKED"
            ? "/mentorship"
            : "/pricing?feature=mentorship"
        }
        className={`mb-10 flex items-center gap-4 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all group ${
          session.user.subscription === "CRACKED"
            ? "bg-linear-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-100 dark:border-violet-800/40 hover:border-violet-200 dark:hover:border-violet-700"
            : "bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 opacity-80 hover:opacity-100"
        }`}
      >
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            session.user.subscription === "CRACKED"
              ? "bg-violet-100 dark:bg-violet-800/40"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          {session.user.subscription === "CRACKED" ? (
            <MessageSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          ) : (
            <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm font-semibold ${
                session.user.subscription === "CRACKED"
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              1-on-1 Code Reviews
            </h3>
            {session.user.subscription !== "CRACKED" && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                Cracked
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {session.user.subscription === "CRACKED"
              ? "Book a live session or submit code for async feedback"
              : "Upgrade to Cracked for weekly 1-on-1 code reviews"}
          </p>
        </div>
        <ArrowRight
          className={`h-4 w-4 shrink-0 transition-colors ${
            session.user.subscription === "CRACKED"
              ? "text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-300"
              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }`}
        />
      </Link>

      {/* 6. Explore More — compact links */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Explore More
        </h2>
        <div className="flex flex-wrap gap-3">
          {exploreLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 ${link.hoverBorder} hover:shadow-sm transition-all`}
              >
                <Icon className={`h-4 w-4 ${link.color}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      <RecentAchievements userId={session.user.id} />

      {/* Dashboard Tour */}
      <TourProvider
        steps={dashboardTourSteps}
        run={tourRunning}
        onComplete={completeTour}
      />

      {/* 7. Progress Section */}
      <div>
        {loadingProgress ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your progress...
            </p>
          </div>
        ) : hasProgressError ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Error loading progress:{" "}
              {progressError?.message || "Unknown error"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : progressStats ? (
          <ProgressStats
            tutorialStats={progressStats.tutorials}
            challengeStats={progressStats.challenges}
            projectStats={progressStats.projects}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Your Progress
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Start learning to see your progress here!
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
