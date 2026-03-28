"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StepNavigationProps {
  category: string;
  tutorialSlug: string;
  prevStep: { slug: string; title: string } | null;
  nextStep: { slug: string; title: string } | null;
  exerciseSlug: string | null;
  currentOrder: number;
  totalSteps: number;
  canAdvance: boolean;
}

export default function StepNavigation({
  category,
  tutorialSlug,
  prevStep,
  nextStep,
  exerciseSlug,
  currentOrder,
  totalSteps,
  canAdvance,
}: StepNavigationProps) {
  const basePath = `/tutorials/category/${category}/${tutorialSlug}`;

  const truncateTitle = (title: string, max = 20) =>
    title.length > max ? title.slice(0, max) + "..." : title;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-xl mt-8">
      <div className="flex justify-between items-center">
        {/* Previous */}
        {prevStep ? (
          <Link
            href={`${basePath}/step/${prevStep.slug}`}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4" />
            <div className="text-left">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Previous
              </div>
              <div className="text-sm font-medium group-hover:underline">
                {truncateTitle(prevStep.title)}
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href={basePath}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to overview</span>
          </Link>
        )}

        {/* Progress */}
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentOrder} of {totalSteps}
          </div>
        </div>

        {/* Next / Exercise */}
        {nextStep ? (
          canAdvance ? (
            <Link
              href={`${basePath}/step/${nextStep.slug}`}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
            >
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Next
                </div>
                <div className="text-sm font-medium group-hover:underline">
                  {truncateTitle(nextStep.title)}
                </div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="flex items-center gap-2 text-gray-400 dark:text-gray-600 cursor-not-allowed">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide">Next</div>
                <div className="text-sm font-medium">
                  {truncateTitle(nextStep.title)}
                </div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </span>
          )
        ) : exerciseSlug ? (
          <Link
            href={`/exercises/${exerciseSlug}`}
            className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
          >
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Practice
              </div>
              <div className="text-sm font-medium group-hover:underline">
                Go to Exercise
              </div>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={basePath}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <span className="text-sm">Back to overview</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
