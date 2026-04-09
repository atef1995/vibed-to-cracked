"use client";

import React, {
  useState,
  useEffect,
  useRef as useReactRef,
  useMemo,
  useCallback,
  useContext,
  createContext,
  useRef,
  useId,
} from "react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  RotateCcw,
  CodeIcon,
  AppWindowIcon,
  Eye,
} from "lucide-react";
import type { ValidationResponse } from "@/hooks/useStep";
import type {
  DomSnapshotEntry,
  DomCheck,
  PreAction,
} from "@/lib/stepValidator";

interface ReactStepCodeEditorProps {
  starterCode: string;
  onValidate: (
    code: string,
    output: string,
    domSnapshot: DomSnapshotEntry[]
  ) => Promise<ValidationResponse>;
  onPass: () => void;
  passed?: boolean;
  lastSavedCode?: string | null;
  domChecks?: DomCheck[];
  preActions?: PreAction[];
  onCodeChange?: (code: string) => void;
  onValidationResult?: (result: ValidationResponse) => void;
  solutionCode?: string;
}

/** Strips import/export lines and appends render() for react-live. */
function prepareForLive(code: string): string {
  let cleaned = code
    .replace(/import\s+.*?from\s+['"].*?['"];?\s*\n?/g, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/export\s+/g, "")
    .trim();

  if (!cleaned.includes("render(")) {
    const matches = [...cleaned.matchAll(/function\s+(\w+)\s*\(/g)];
    const last = matches[matches.length - 1];
    if (last) {
      cleaned += `\n\nrender(<${last[1]} />);`;
    }
  }
  return cleaned;
}

/**
 * Captures a DOM snapshot from a rendered preview container,
 * querying for each selector defined in domChecks.
 */
function captureSnapshot(
  container: HTMLElement,
  domChecks: DomCheck[]
): DomSnapshotEntry[] {
  const selectors = new Set(domChecks.map((c) => c.selector));
  return Array.from(selectors).map((selector) => {
    const elements = container.querySelectorAll(selector);
    const first = elements[0];
    const attrs: Record<string, string> = {};
    if (first) {
      for (const attr of first.attributes) {
        attrs[attr.name] = attr.value;
      }
    }
    return {
      selector,
      textContent: first?.textContent ?? undefined,
      exists: elements.length > 0,
      count: elements.length,
      attributes: Object.keys(attrs).length > 0 ? attrs : undefined,
    };
  });
}

/**
 * Simulates user interactions on the rendered preview before snapshotting.
 * Supports click and input actions. Waits briefly after each for React to re-render.
 */
async function executePreActions(
  container: HTMLElement,
  actions: PreAction[]
): Promise<void> {
  for (const action of actions) {
    const el = container.querySelector(action.selector);
    if (!el) continue;

    if (action.type === "click") {
      (el as HTMLElement).click();
    } else if (action.type === "input" && action.value !== undefined) {
      const nativeInputValueSetter =
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")
          ?.set ??
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")
          ?.set;
      nativeInputValueSetter?.call(el, action.value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Let React process the state update
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** Extracts CSS from inline <style> JSX tags in user code. */
function extractStyleContent(code: string): string {
  const styleRegex =
    /<style[^>]*>\s*\{`([\s\S]*?)`\}\s*<\/style>|<style[^>]*>\s*\{["']([\s\S]*?)["']\}\s*<\/style>/g;
  const parts: string[] = [];
  let match;
  while ((match = styleRegex.exec(code)) !== null) {
    parts.push(match[1] ?? match[2] ?? "");
  }
  return parts.join("\n");
}

/** Prefixes CSS selectors so styles are scoped to a specific preview container. */
function scopeCss(css: string, scopeId: string): string {
  if (!css.trim()) return "";
  return css.replace(/([.#]?[\w-]+)\s*\{/g, (_match, selector: string) => {
    if (selector.startsWith(".") || selector.startsWith("#")) {
      return `[data-preview-id="${scopeId}"] ${selector} {`;
    }
    return `[data-preview-id="${scopeId}"] ${_match}`;
  });
}

/** Scope passed to react-live so user code can use hooks. */
const liveScope = {
  React,
  useState,
  useEffect,
  useRef: useReactRef,
  useMemo,
  useCallback,
  useContext,
  createContext,
};

export default function ReactStepCodeEditor({
  starterCode,
  onValidate,
  onPass,
  passed = false,
  lastSavedCode,
  domChecks = [],
  preActions = [],
  onCodeChange: onCodeChangeProp,
  onValidationResult: onValidationResultProp,
  solutionCode,
}: ReactStepCodeEditorProps) {
  const [code, setCode] = useState(lastSavedCode || starterCode);
  const [liveCode, setLiveCode] = useState(prepareForLive(code));
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [hasError, setHasError] = useState(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const styleId = useId();

  // Extract and scope CSS from user code so <style> tags don't leak globally
  const scopedCss = useMemo(
    () => scopeCss(extractStyleContent(code), styleId),
    [code, styleId]
  );

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setLiveCode(prepareForLive(newCode));
      setResult(null);
      setHasError(false);
      onCodeChangeProp?.(newCode);
    },
    [onCodeChangeProp]
  );

  const handleCheck = useCallback(async () => {
    // Switch to preview so the component renders before we snapshot
    setActiveTab("preview");
    setIsValidating(true);

    // Small delay to let react-live render the preview
    await new Promise((r) => setTimeout(r, 150));

    try {
      let snapshot: DomSnapshotEntry[] = [];
      if (previewRef.current && domChecks.length > 0) {
        if (preActions.length > 0) {
          await executePreActions(previewRef.current, preActions);
        }
        snapshot = captureSnapshot(previewRef.current, domChecks);
      }

      const response = await onValidate(code, "", snapshot);
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
  }, [code, domChecks, preActions, onValidate, onPass, onValidationResultProp]);

  const handleReset = useCallback(() => {
    setCode(starterCode);
    setLiveCode(prepareForLive(starterCode));
    setResult(null);
    setHasError(false);
  }, [starterCode]);

  const handleShowSolution = useCallback(() => {
    if (!solutionCode) return;
    setCode(solutionCode);
    setLiveCode(prepareForLive(solutionCode));
    setResult(null);
    setHasError(false);
    setShowSolutionConfirm(false);
    onCodeChangeProp?.(solutionCode);
  }, [solutionCode, onCodeChangeProp]);

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

      {/* Editor + Preview */}
      <div className="border dark:border-gray-600 rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="bg-gray-100 dark:bg-gray-750 px-2 py-1 border-b border-gray-200 dark:border-gray-600 flex gap-1">
          <button
            onClick={() => setActiveTab("code")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all ${
              activeTab === "code"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <CodeIcon size={14} />
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all ${
              activeTab === "preview"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <AppWindowIcon size={14} />
            Preview
          </button>
        </div>

        {/* Content area — fixed height to prevent layout shift */}
        <div className="h-72">
          {activeTab === "code" ? (
            <div className="h-full overflow-auto bg-gray-900">
              <LiveProvider code={liveCode} noInline scope={liveScope}>
                <LiveEditor
                  className="font-mono! text-sm! bg-gray-900! min-h-full!"
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: "14px",
                    backgroundColor: "#1e1e1e",
                    minHeight: "100%",
                  }}
                  onChange={(newCode) => {
                    // LiveEditor gives us the cleaned code; store it for validation
                    // but also reconstruct the "raw" version for pattern matching
                    setLiveCode(newCode);
                    setCode(newCode);
                    setResult(null);
                    setHasError(false);
                    onCodeChangeProp?.(newCode);
                  }}
                />
              </LiveProvider>
            </div>
          ) : (
            <div className="h-full overflow-auto bg-white dark:bg-gray-900 p-4">
              {scopedCss && (
                <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
              )}
              <LiveProvider code={liveCode} noInline scope={liveScope}>
                <LiveError className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4 text-sm font-mono" />
                <div ref={previewRef} data-preview-id={styleId}>
                  <LivePreview className="react-live-preview" />
                </div>
              </LiveProvider>
            </div>
          )}
        </div>
      </div>

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

        {solutionCode && !passed && (
          <div className="relative ml-auto">
            <button
              onClick={() => setShowSolutionConfirm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Show Solution
            </button>
            {showSolutionConfirm && (
              <div className="absolute bottom-full right-0 mb-2 w-56 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-10">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  This will replace your current code. Are you sure?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleShowSolution}
                    className="flex-1 px-2 py-1 text-xs font-medium rounded bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                  >
                    Yes, show it
                  </button>
                  <button
                    onClick={() => setShowSolutionConfirm(false)}
                    className="flex-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
