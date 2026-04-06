"use client";

import React, { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, XCircle, Loader2, Play, RotateCcw } from "lucide-react";
import type { ValidationResponse } from "@/hooks/useStep";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
  ),
});

interface StepCodeEditorProps {
  initialCode: string;
  validationType: string;
  onValidate: (code: string, output: string) => Promise<ValidationResponse>;
  onPass: () => void;
  passed?: boolean;
  lastSavedCode?: string | null;
  language?: string;
  onCodeChange?: (code: string) => void;
  onOutputChange?: (output: string) => void;
  onValidationResult?: (result: ValidationResponse) => void;
}

export default function StepCodeEditor({
  initialCode,
  validationType,
  onValidate,
  onPass,
  passed = false,
  lastSavedCode,
  language = "javascript",
  onCodeChange: onCodeChangeProp,
  onOutputChange: onOutputChangeProp,
  onValidationResult: onValidationResultProp,
}: StepCodeEditorProps) {
  const [code, setCode] = useState(lastSavedCode || initialCode);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const outputRef = useRef("");

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setResult(null);
      setHasRun(false);
      onCodeChangeProp?.(newCode);
    },
    [onCodeChangeProp]
  );

  const handleRunComplete = useCallback(
    (output: string[]) => {
      setHasRun(true);
      const joined = output.join("\n");
      outputRef.current = joined;
      onOutputChangeProp?.(joined);
    },
    [onOutputChangeProp]
  );

  const handleCheck = useCallback(async () => {
    if (!hasRun && (validationType === "output" || validationType === "both")) {
      setResult({
        passed: false,
        feedback: "Run your code first, then check it.",
        outputMatch: null,
        patternResults: [],
        canAdvance: false,
        nextStep: null,
        achievements: [],
        xpAwarded: 0,
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await onValidate(code, outputRef.current);
      setResult(response);
      onValidationResultProp?.(response);
      if (response.passed) {
        onPass();
      }
    } catch {
      setResult({
        passed: false,
        feedback: "Something went wrong while checking your code. Try again.",
        outputMatch: null,
        patternResults: [],
        canAdvance: false,
        nextStep: null,
        achievements: [],
        xpAwarded: 0,
      });
    } finally {
      setIsValidating(false);
    }
  }, [code, hasRun, validationType, onValidate, onPass]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    setResult(null);
    setHasRun(false);
    outputRef.current = "";
  }, [initialCode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Turn
        </h3>
        {passed && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </span>
        )}
      </div>

      {/* Reuse the same CodeEditor — handles Monaco + execution + Console */}
      <CodeEditor
        initialCode={code}
        onCodeChange={handleCodeChange}
        onRunComplete={handleRunComplete}
        height={`${Math.min(Math.max(code.split("\n").length + 2, 4) * 21, 420)}px`}
        language={language}
        canRun={true}
      />

      {/* Actions row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCheck}
          disabled={isValidating || !code.trim()}
          className="min-w-36 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isValidating ? "Checking..." : "Check My Code"}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Feedback area — reserved space to prevent layout shift */}
      <div
        className={`min-h-14 rounded-lg border px-4 py-3 text-sm transition-colors duration-200 ${
          result
            ? result.passed
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-red-500 bg-red-500/10"
            : "border-transparent bg-transparent"
        }`}
      >
        {result ? (
          <div className="flex items-start gap-2">
            {result.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              {result.feedback.split("\n").map((line, i) => (
                <p
                  key={i}
                  className={
                    result.passed
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-red-700 dark:text-red-300"
                  }
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <span className="invisible">placeholder</span>
        )}
      </div>
    </div>
  );
}
