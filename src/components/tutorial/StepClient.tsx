"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { MDXRemote } from "next-mdx-remote";
import { useMood } from "@/components/providers/MoodProvider";
import { useStep, useStepList } from "@/hooks/useStep";
import { useStepProgress } from "@/hooks/useStepProgress";
import { useToast } from "@/hooks/useToast";
import getMoodColors from "@/lib/getMoodColors";
import StepCodeEditor from "@/components/tutorial/StepCodeEditor";
import StepStepper from "@/components/tutorial/StepStepper";
import StepNavigation from "@/components/tutorial/StepNavigation";
import InteractiveCodeBlock from "@/components/InteractiveCodeBlock";
import dynamic from "next/dynamic";
import { DOMInteractiveBlock } from "@/components/ui/DOMInteractiveBlock";
import { HTMLPreviewWindow } from "@/components/ui/HTMLPreviewWindow";
import { HTMLEditorPreview } from "@/components/ui/HTMLEditorPreview";
import { SeparatedEditorPreview } from "@/components/ui/SeparatedEditorPreview";
import DualPaneEditor from "@/components/DualPaneEditor";
import { ComparisonTable } from "@/components/tutorial/ComparisonTable";
import { StepFlow } from "@/components/tutorial/StepFlow";
import { UpgradeCTA } from "@/components/tutorial/UpgradeCTA";
import { ValidatedExercise } from "@/components/ui/ValidatedExercise";
import { AlgorithmExercise } from "@/components/ui/AlgorithmExercise";
import { Lock, ArrowLeft, Trophy, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import TutorFAB from "@/components/tutor/TutorFAB";
import TutorChatPanel from "@/components/tutor/TutorChatPanel";
import SelectionTooltip from "@/components/tutor/SelectionTooltip";
import { useTutorChat } from "@/hooks/useTutorChat";
import type { TutorContext } from "@/hooks/useTutorChat";
import type { ValidationResponse } from "@/hooks/useStep";

const MultiFileCodeEditor = dynamic(
  () => import("@/components/MultiFileCodeEditor"),
  { ssr: false }
);

// Reuse the same MDX components as TutorialContent for consistent rendering
const mdxComponents = {
  InteractiveCodeBlock,
  MultiFileCodeEditor,
  DOMInteractiveBlock,
  HTMLPreviewWindow,
  HTMLEditorPreview,
  SeparatedEditorPreview,
  DualPaneEditor,
  ComparisonTable,
  StepFlow,
  UpgradeCTA,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl font-bold text-gray-900 dark:text-gray-300 mb-4"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl font-semibold text-gray-800 dark:text-gray-300 mt-8 mb-4"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !props.className;
    if (isInline) {
      const text = typeof props.children === "string" ? props.children : "";
      const isHtmlTag = /^<\/?[a-zA-Z]/.test(text);
      const isCssProp = /^[a-z-]+\s*:/.test(text);
      const colorClass = isHtmlTag
        ? "text-orange-600 dark:text-orange-300"
        : isCssProp
          ? "text-teal-600 dark:text-teal-300"
          : "text-violet-600 dark:text-violet-300";
      return (
        <code
          className={`bg-slate-100 dark:bg-slate-800/80 ${colorClass} text-pretty font-semibold px-2 py-0.5 my-0.5 rounded text-sm font-mono border border-slate-200/80 dark:border-slate-700`}
          {...props}
        />
      );
    }
    const codeContent =
      typeof props.children === "string" ? props.children : "";
    return (
      <InteractiveCodeBlock language={props.className}>
        {codeContent}
      </InteractiveCodeBlock>
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    const hasCodeChild = React.Children.toArray(props.children).some(
      (child) => React.isValidElement(child) && child.type === "code"
    );
    return hasCodeChild ? <>{props.children}</> : <pre {...props} />;
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-outside space-y-2 text-gray-600 dark:text-gray-300 mb-4 ml-6 pl-2"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-outside space-y-2 text-gray-600 dark:text-gray-300 mb-4 ml-6 pl-2"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li
      className="text-gray-600 dark:text-gray-300 leading-relaxed"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-gray-900 dark:text-blue-300" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-gray-700 dark:text-gray-300" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-blue-400 dark:border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic my-4 rounded-r-lg"
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium transition-colors"
      {...props}
    />
  ),
};

interface StepClientProps {
  category: string;
  tutorialSlug: string;
  stepSlug: string;
}

export default function StepClient({
  category,
  tutorialSlug,
  stepSlug,
}: StepClientProps) {
  const { currentMood } = useMood();
  const { data: session } = useSession();
  const moodColors = getMoodColors(currentMood.id);
  const toast = useToast();
  const [stepPassed, setStepPassed] = useState(false);
  const [showPassedModal, setShowPassedModal] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isAuthenticated = !!session?.user?.id;
  const stepStartTime = useRef(Date.now());

  const {
    data: step,
    isLoading,
    isError,
    error,
    validate,
  } = useStep(tutorialSlug, stepSlug);

  const { data: stepList } = useStepList(tutorialSlug);

  const { completeStepLocally } = useStepProgress(
    tutorialSlug,
    stepList?.steps?.map((s) => ({ slug: s.slug, order: s.order })) || []
  );

  // Track current code for saving on pass
  const [currentCode, setCurrentCode] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");
  const [lastValidationResult, setLastValidationResult] =
    useState<ValidationResponse | null>(null);

  // Build tutor context from lifted step state
  const tutorContext: TutorContext = useMemo(
    () => ({
      userCode: currentCode || undefined,
      consoleOutput: currentOutput || undefined,
      stepTitle: step?.title,
      stepDescription: step?.description ?? undefined,
      taskInstructions: step?.validationConfig?.taskInstructions,
      validationResult: lastValidationResult
        ? {
            passed: lastValidationResult.passed,
            feedback: lastValidationResult.feedback,
          }
        : null,
      stepOrder: step?.order,
      totalSteps: stepList?.steps?.length,
    }),
    [
      currentCode,
      currentOutput,
      step?.title,
      step?.description,
      step?.validationConfig?.taskInstructions,
      lastValidationResult,
      step?.order,
      stepList?.steps?.length,
    ]
  );

  // AI Tutor
  const tutor = useTutorChat({
    contentType: "tutorial",
    contentSlug: tutorialSlug,
    enabled: isAuthenticated,
    context: tutorContext,
  });

  const handleTutorToggle = useCallback(() => {
    setTutorOpen((prev) => !prev);
  }, []);

  const handleTextSelect = useCallback(
    (text: string) => {
      tutor.setHighlightedText(text);
      setTutorOpen(true);
    },
    [tutor]
  );

  const handleSignInPrompt = useCallback(() => {
    window.location.href =
      "/auth/signin?callbackUrl=" +
      encodeURIComponent(window.location.pathname);
  }, []);

  // Handle step pass — update local progress for anon users
  const handlePass = useCallback(() => {
    setStepPassed(true);
    setShowPassedModal(true);
    if (!session?.user?.id) {
      completeStepLocally(stepSlug, currentCode);
    }
  }, [session?.user?.id, stepSlug, completeStepLocally, currentCode]);

  // Handle validation
  const handleValidate = useCallback(
    async (code: string, output: string) => {
      const elapsedSeconds = Math.round(
        (Date.now() - stepStartTime.current) / 1000
      );
      const result = await validate.mutateAsync({
        code,
        output,
        timeSpent: elapsedSeconds > 0 ? elapsedSeconds : undefined,
      });

      if (result.passed) {
        if (result.xpAwarded > 0) {
          toast.success("Step Complete", `+${result.xpAwarded} XP`);
        }
        if (result.achievements?.length) {
          for (const a of result.achievements) {
            toast.achievement(`${a.icon} ${a.title}`, a.description);
          }
        }
      }

      return result;
    },
    [validate, toast]
  );

  // Handle exercise-type step completion (ValidatedExercise in MDX passed all tests)
  const handleExerciseComplete = useCallback(
    async (code: string) => {
      const elapsedSeconds = Math.round(
        (Date.now() - stepStartTime.current) / 1000
      );
      try {
        const result = await validate.mutateAsync({
          code,
          output: "",
          timeSpent: elapsedSeconds > 0 ? elapsedSeconds : undefined,
        });
        if (result.passed) {
          if (result.xpAwarded > 0) {
            toast.success("Step Complete", `+${result.xpAwarded} XP`);
          }
          if (result.achievements?.length) {
            for (const a of result.achievements) {
              toast.achievement(`${a.icon} ${a.title}`, a.description);
            }
          }
        }
      } catch {
        // Validation failed server-side — still mark locally
      }
      handlePass();
    },
    [validate, toast, handlePass]
  );

  // Loading
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-linear-to-br ${moodColors.gradient}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Locked step
  if (isError && error?.message === "STEP_LOCKED") {
    return (
      <div className={`min-h-screen bg-linear-to-br ${moodColors.gradient}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <Lock className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Step Locked
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete the previous steps to unlock this one.
            </p>
            <Link
              href={`/tutorials/category/${category}/${tutorialSlug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to tutorial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (isError || !step) {
    return (
      <div className={`min-h-screen bg-linear-to-br ${moodColors.gradient}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error?.message || "Could not load this step."}
            </p>
            <Link
              href={`/tutorials/category/${category}/${tutorialSlug}`}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to tutorial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPassed = stepPassed || step.progress?.passed || false;
  const totalSteps = stepList?.steps.length || 0;
  const completedSteps = stepList?.steps.filter((s) => s.passed).length || 0;
  const allStepsComplete =
    totalSteps > 0 &&
    (completedSteps === totalSteps ||
      (completedSteps === totalSteps - 1 && isPassed));
  const canAdvance = isPassed;
  const initialCode =
    step.validationConfig?.initialCode || "// Write your code here\n";

  // Extend mdxComponents with ValidatedExercise wired to step completion
  const nextStepHref = step.nextStep
    ? `/tutorials/category/${category}/${tutorialSlug}/step/${step.nextStep.slug}`
    : undefined;

  const stepMdxComponents = {
    ...mdxComponents,
    ValidatedExercise: (
      props: React.ComponentProps<typeof ValidatedExercise>
    ) => (
      <ValidatedExercise
        {...props}
        onAllPassed={handleExerciseComplete}
        passed={isPassed}
        nextStepHref={nextStepHref}
      />
    ),
    AlgorithmExercise: (
      props: React.ComponentProps<typeof AlgorithmExercise>
    ) => (
      <AlgorithmExercise
        {...props}
        onAllPassed={handleExerciseComplete}
        passed={isPassed}
        nextStepHref={nextStepHref}
      />
    ),
  };

  return (
    <div className={`min-h-screen bg-linear-to-br ${moodColors.gradient}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href={`/tutorials/category/${category}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {category}
            </Link>
            <span>/</span>
            <Link
              href={`/tutorials/category/${category}/${tutorialSlug}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {step.tutorialTitle}
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">
              {step.title}
            </span>
          </div>

          {/* Step bar (mobile: horizontal, desktop: sidebar) */}
          <div className="flex flex-col sm:flex-row gap-8">
            {stepList?.steps && (
              <StepStepper
                steps={stepList.steps}
                currentStepSlug={stepSlug}
                category={category}
                tutorialSlug={tutorialSlug}
              />
            )}

            {/* Main content area */}
            <div className="flex-1 min-w-0">
              {/* Step header */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg dark:shadow-xl mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h1>
                {step.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                )}
              </div>

              {/* MDX Content */}
              {step.mdxSource && (
                <div
                  ref={contentRef}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg dark:shadow-xl mb-6"
                >
                  <div className="prose dark:prose-invert max-w-none">
                    <MDXRemote
                      {...step.mdxSource}
                      components={stepMdxComponents}
                    />
                  </div>
                </div>
              )}

              {/* Code validation section — hidden for exercise type (ValidatedExercise in MDX handles it) */}
              {step.validationType !== "none" &&
                step.validationType !== "exercise" && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg dark:shadow-xl">
                    {step.validationConfig?.taskInstructions && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3 mb-4">
                        <h4 className="text-blue-800 dark:text-blue-300 font-semibold text-sm mb-1">
                          Your Task
                        </h4>
                        <p className="text-blue-700 dark:text-blue-200 text-sm">
                          {step.validationConfig.taskInstructions}
                        </p>
                      </div>
                    )}
                    <StepCodeEditor
                      initialCode={initialCode}
                      validationType={step.validationType}
                      onValidate={handleValidate}
                      onPass={handlePass}
                      passed={isPassed}
                      lastSavedCode={step.progress?.userCode}
                      onCodeChange={setCurrentCode}
                      onOutputChange={setCurrentOutput}
                      onValidationResult={setLastValidationResult}
                    />
                  </div>
                )}

              {/* Bottom navigation */}
              <StepNavigation
                category={category}
                tutorialSlug={tutorialSlug}
                prevStep={step.prevStep}
                nextStep={step.nextStep}
                exerciseSlug={step.exerciseSlug}
                currentOrder={step.order}
                totalSteps={totalSteps}
                canAdvance={canAdvance}
              />

              {allStepsComplete && (
                <div className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-6 text-center">
                  <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    All steps completed
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                    You&apos;ve finished every step in this tutorial.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {step.exerciseSlug && (
                      <Link
                        href={`/exercises/${step.exerciseSlug}`}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Practice with Exercise
                      </Link>
                    )}
                    <Link
                      href={`/tutorials/category/${category}/${tutorialSlug}`}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back to Tutorial
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step Passed Modal */}
      {showPassedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPassedModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-black/40 p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPassedModal(false)}
              aria-label="Close"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Step Complete
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {step.nextStep
                ? `Up next: ${step.nextStep.title}`
                : "You finished the last step!"}
            </p>
            {step.nextStep ? (
              <Link
                href={`/tutorials/category/${category}/${tutorialSlug}/step/${step.nextStep.slug}`}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/tutorials/category/${category}/${tutorialSlug}`}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
              >
                Back to Tutorial
              </Link>
            )}
          </div>
        </div>
      )}

      {/* AI Tutor */}
      <TutorFAB
        onClick={handleTutorToggle}
        isOpen={tutorOpen}
        moodColors={moodColors}
        remaining={tutor.usage.remaining}
        isAuthenticated={isAuthenticated}
        onSignInPrompt={handleSignInPrompt}
      />

      {isAuthenticated && (
        <>
          <TutorChatPanel
            isOpen={tutorOpen}
            onClose={() => setTutorOpen(false)}
            messages={tutor.messages}
            isStreaming={tutor.isStreaming}
            usage={tutor.usage}
            highlightedText={tutor.highlightedText}
            onSendMessage={tutor.sendMessage}
            onClearHistory={tutor.clearHistory}
            onStopStreaming={tutor.stopStreaming}
            onClearHighlight={() => tutor.setHighlightedText(null)}
            moodColors={moodColors}
            moodId={currentMood.id}
          />

          <SelectionTooltip
            containerRef={contentRef}
            onSelect={handleTextSelect}
            moodAccent={moodColors.accent}
          />
        </>
      )}
    </div>
  );
}
