"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Check,
  X,
  Play,
  RotateCcw,
  Code2,
  Lightbulb,
  Trophy,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import CodeEditor from "../CodeEditor";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "./Toast";

interface TestCase {
  input: unknown;
  expected: unknown;
  description: string;
}

interface TestResult {
  passed: boolean;
  description: string;
  expected: unknown;
  actual: unknown;
  error?: string;
}

interface AlgorithmExerciseProps {
  title: string;
  instructions: string;
  initialCode?: string;
  testCases: TestCase[];
  hints?: string[];
  solution?: string;
  functionName?: string;
  onAllPassed?: (code: string) => void;
  passed?: boolean;
  nextStepHref?: string;
}

function extractFunction(
  code: string,
  targetName?: string
): ((...args: unknown[]) => unknown) | null {
  // Try as function expression / arrow function first
  try {
    const fn = new Function("return " + code)();
    if (typeof fn === "function") return fn;
  } catch {
    // Not a single expression — fall through
  }

  // Try evaluating as function declaration(s) and extract the target
  try {
    const scope: Record<string, unknown> = {};
    const wrapper = new Function(
      "scope",
      code +
        "\n;for(let __k in this){if(typeof this[__k]==='function') scope[__k]=this[__k];}"
    );
    wrapper.call(scope, scope);

    if (targetName && typeof scope[targetName] === "function") {
      return scope[targetName] as (...args: unknown[]) => unknown;
    }

    // Fallback: return the first function found
    const first = Object.values(scope).find((v) => typeof v === "function") as
      | ((...args: unknown[]) => unknown)
      | undefined;
    return first ?? null;
  } catch {
    return null;
  }
}

export function AlgorithmExercise({
  title,
  instructions,
  initialCode = "// Write your code here\n",
  testCases,
  hints = [],
  solution,
  functionName,
  onAllPassed,
  passed: initialPassed = false,
  nextStepHref,
}: AlgorithmExerciseProps) {
  const { data: session } = useSession();
  const toast = useToast();
  const [code, setCode] = useState(initialCode);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(initialPassed);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionLoaded, setSolutionLoaded] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [compileError, setCompileError] = useState<string | null>(null);

  useEffect(() => {
    setStartTime(Date.now());
  }, [title]);

  const runTests = () => {
    setIsRunning(true);
    setTestResults([]);
    setCompileError(null);

    const fn = extractFunction(code, functionName);

    if (!fn) {
      setCompileError(
        functionName
          ? `Could not find a function called \`${functionName}\`. Make sure your function is declared correctly.`
          : "No function found in your code. Make sure you define a function."
      );
      setIsRunning(false);
      return;
    }

    const results: TestResult[] = testCases.map((tc) => {
      try {
        // For single-param functions, pass input directly.
        // For multi-param functions, spread array inputs as arguments.
        const args =
          fn.length <= 1
            ? [tc.input]
            : Array.isArray(tc.input)
              ? tc.input
              : [tc.input];
        const actual = fn(...args);
        const passed = JSON.stringify(actual) === JSON.stringify(tc.expected);
        return {
          passed,
          description: tc.description,
          expected: tc.expected,
          actual,
        };
      } catch (err) {
        return {
          passed: false,
          description: tc.description,
          expected: tc.expected,
          actual: "Error",
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    setTestResults(results);
    const didPassAll = results.every((r) => r.passed);
    setAllPassed(didPassAll);

    if (didPassAll && onAllPassed && !solutionLoaded) {
      onAllPassed(code);
    }

    if (didPassAll && solutionLoaded) {
      toast.warning(
        "Solution Used",
        "Using the solution doesn't count towards achievements. Try solving it on your own."
      );
    }

    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(initialCode);
    setTestResults([]);
    setAllPassed(false);
    setCompileError(null);
    setShowHints(false);
    setShowSolution(false);
    setSolutionLoaded(false);
    setStartTime(Date.now());
  };

  const loadSolution = () => {
    if (solution) {
      setCode(solution);
      setSolutionLoaded(true);
      setShowSolution(true);
      toast.info(
        "Solution Loaded",
        "Using the solution won't count for achievements. Try it yourself first."
      );
    }
  };

  const passedCount = testResults.filter((r) => r.passed).length;
  const totalTests = testCases.length;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Header */}
      <div className="bg-linear-to-r from-indigo-500 to-purple-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-white/80 hover:text-white transition-colors p-1.5 rounded hover:bg-white/10 cursor-pointer"
              title="Reset exercise"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {solution && (
              <button
                onClick={loadSolution}
                className="text-white/80 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/10 text-xs font-medium cursor-pointer"
                title="Show solution"
              >
                Solution
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-700 px-4 py-3">
        <h4 className="text-blue-800 dark:text-blue-300 font-semibold text-sm mb-1">
          Your Task:
        </h4>
        <p className="text-blue-700 dark:text-blue-200 text-sm">
          {instructions}
        </p>
      </div>

      {/* Success message */}
      {allPassed && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b-2 border-green-200 dark:border-green-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">All tests passed</span>
            </div>
            {nextStepHref && (
              <Link
                href={nextStepHref}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Solution warning */}
      {solutionLoaded && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-b-2 border-orange-200 dark:border-orange-700 px-4 py-3">
          <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
            <Lightbulb className="w-5 h-5" />
            <span className="text-sm">
              Viewing the solution. Submissions won&apos;t count for
              achievements.
            </span>
          </div>
        </div>
      )}

      {/* Code editor */}
      <div className="h-64 border-b border-gray-200 dark:border-gray-700">
        <CodeEditor
          language="javascript"
          initialCode={code}
          onCodeChange={setCode}
          height="230px"
          canRun={false}
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Running..." : "Run Tests"}
        </button>
        {hints.length > 0 && (
          <button
            onClick={() => setShowHints(!showHints)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4" />
            {showHints ? "Hide Hints" : "Show Hints"}
          </button>
        )}
      </div>

      {/* Compile error */}
      {compileError && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700">
          <p className="text-red-700 dark:text-red-300 text-sm">
            {compileError}
          </p>
        </div>
      )}

      {/* Test results */}
      {testResults.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tests: {passedCount}/{totalTests} passed
            </span>
            <div className="flex gap-1">
              {testResults.map((r, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    r.passed ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {testResults.map((result, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 text-sm border ${
                  result.passed
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                    : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {result.passed ? (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <span
                    className={
                      result.passed
                        ? "text-green-800 dark:text-green-300"
                        : "text-red-800 dark:text-red-300"
                    }
                  >
                    {result.description}
                  </span>
                </div>
                {!result.passed && (
                  <div className="ml-6 mt-1 font-mono text-xs space-y-0.5">
                    <div className="text-gray-600 dark:text-gray-400">
                      Expected:{" "}
                      <span className="text-green-700 dark:text-green-400">
                        {JSON.stringify(result.expected)}
                      </span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Got:{" "}
                      <span className="text-red-700 dark:text-red-400">
                        {result.error ?? JSON.stringify(result.actual)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hints */}
      {showHints && hints.length > 0 && (
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
          <div className="space-y-2">
            {hints.map((hint, i) => (
              <div
                key={i}
                className="flex gap-2 text-sm text-amber-800 dark:text-amber-300"
              >
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{hint}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
