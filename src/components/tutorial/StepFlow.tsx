"use client";

import React from "react";

export interface Step {
  emoji: string;
  title: string;
  description: string;
  code?: string;
}

export interface StepFlowProps {
  steps: Step[];
  className?: string;
}

/**
 * StepFlow Component
 * 
 * A compact, visually appealing step-by-step flow for tutorials.
 * Shows steps in a horizontal flow on desktop, vertical on mobile.
 */
export function StepFlow({ steps, className = "" }: StepFlowProps) {
  return (
    <div className={`my-6 ${className}`}>
      {/* Desktop: Horizontal flow */}
      <div className="hidden md:flex items-stretch gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex-1 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{step.emoji}</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {step.title}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {step.description}
              </p>
              {step.code && (
                <code className="block text-xs bg-gray-900 text-green-400 p-2 rounded font-mono overflow-x-auto">
                  {step.code}
                </code>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="flex items-center text-gray-400 dark:text-gray-600 text-2xl font-light">
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: Vertical flow */}
      <div className="md:hidden space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <div className="flex gap-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl">
                  {step.emoji}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-gradient-to-b from-indigo-500 to-purple-600 mt-2" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {step.description}
                </p>
                {step.code && (
                  <code className="block text-xs bg-gray-900 text-green-400 p-2 rounded font-mono overflow-x-auto">
                    {step.code}
                  </code>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
