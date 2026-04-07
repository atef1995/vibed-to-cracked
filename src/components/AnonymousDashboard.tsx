"use client";

import { useState } from "react";
import { MoodSelector } from "@/components/MoodSelector";
import { SignupCTA } from "@/components/SignupCTA";
import {
  BookOpen,
  Brain,
  FileText,
  Sparkles,
  GitPullRequest,
  Wrench,
  Zap,
  Gamepad,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { PageLayout } from "./ui/PageLayout";

const moreLinks = [
  {
    href: "/practice",
    icon: Zap,
    label: "Practice",
    color: "text-purple-600 dark:text-purple-400",
    hoverBorder: "hover:border-purple-200 dark:hover:border-purple-500",
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
    note: "Free tool",
  },
];

export function AnonymousDashboard() {
  const [showMore, setShowMore] = useState(false);

  return (
    <PageLayout>
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
          <Sparkles className="h-4 w-4" />
          Welcome to Vibed to Cracked
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 capitalize">
          Learn web dev at your own pace
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6">
          Tell us your goals and experience level, and we build a personalized
          learning path. Interactive tutorials, mood-adapted quizzes, and
          hands-on exercises.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <SignupCTA variant="primary" message="Get Your Learning Path" />
          <Link
            href="/tutorials"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Browse Tutorials →
          </Link>
        </div>
      </div>

      {/* Mood Selector */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
          How are you feeling today?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          Your mood shapes your learning experience
        </p>
        <MoodSelector showDescription={true} />
      </div>

      {/* Start Here — 3 focused cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          Start here
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          <Link
            href="/tutorials"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 group"
          >
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                5 free
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Tutorials
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interactive lessons with code examples
            </p>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-3">
              Start Learning →
            </div>
          </Link>

          <Link
            href="/quizzes"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-500 group"
          >
            <div className="flex items-center justify-between mb-3">
              <Brain className="h-7 w-7 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                Try free
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Quizzes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mood-adapted questions to test yourself
            </p>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-3">
              Take a Quiz →
            </div>
          </Link>

          <Link
            href="/cheat-sheets"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-yellow-200 dark:hover:border-yellow-500 group"
          >
            <div className="flex items-center justify-between mb-3">
              <FileText className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                Free
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Cheat Sheets
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quick reference guides for interviews
            </p>
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mt-3">
              Browse Sheets →
            </div>
          </Link>
        </div>
      </div>

      {/* What you unlock with an account */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          What you get with a free account
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center">
            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Personalized study plan
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Matched to your goals and skill level
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Progress tracking
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              XP, levels, and achievements as you learn
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center">
            <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Mood-adaptive learning
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Difficulty and pacing adjust to your energy
            </p>
          </div>
        </div>
      </div>

      {/* Sign up CTA — placed right after preview cards */}
      <SignupCTA variant="banner" showBenefits={true} className="mb-8" />

      {/* Explore more — collapsible */}
      <div className="mb-8">
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 mx-auto text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          See everything we offer
          {showMore ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {showMore && (
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {moreLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 ${link.hoverBorder} hover:shadow-sm transition-all`}
                >
                  <Icon className={`h-4 w-4 ${link.color}`} />
                  {link.label}
                  {link.note && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ({link.note})
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
