"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Check,
  X,
  Play,
  RotateCcw,
  Code2,
  FileText,
  Palette,
  Lightbulb,
  Trophy,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import CodeEditor from "../CodeEditor";
import { submitExerciseAction } from "@/lib/actions";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "./Toast";
import { getValidator } from "@/lib/exerciseValidators";

function generatePreviewHTMLFrom(html: string, css: string, js: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exercise Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.5;
        }
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
    (function(){
      var _log = console.log, _err = console.error, _warn = console.warn;
      function send(level, args){
        try {
          parent.postMessage({ __exerciseConsole: true, level: level, args: Array.prototype.map.call(args, function(a){ return typeof a === 'object' ? JSON.stringify(a,null,2) : String(a); }) }, '*');
        } catch(e){}
      }
      console.log  = function(){ send('log',  arguments); _log.apply(console, arguments); };
      console.error= function(){ send('error',arguments); _err.apply(console, arguments); };
      console.warn = function(){ send('warn', arguments); _warn.apply(console, arguments); };
      window.onerror = function(msg){ send('error', [msg]); };
    })();
    </script>
    <script>
        ${js}
    </script>
</body>
</html>`;
}

interface TestCase {
  description: string;
  validatorKey: string;
}

interface ValidatedExerciseProps {
  title: string;
  instructions: string;
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  testCases: TestCase[];
  hints?: string[];
  solution?: {
    html?: string;
    css?: string;
    js?: string;
  };
  showHtmlEditor?: boolean;
  showCssEditor?: boolean;
  showJsEditor?: boolean;
  exerciseId?: string;
  exerciseSlug?: string;
  onAllPassed?: (code: string) => void;
  passed?: boolean;
  nextStepHref?: string;
}

export function ValidatedExercise({
  title,
  instructions,
  initialHtml = "",
  initialCss = "",
  initialJs = "",
  testCases,
  hints = [],
  solution,
  showHtmlEditor = true,
  showCssEditor = true,
  showJsEditor = true,
  exerciseId,
  exerciseSlug,
  onAllPassed,
  passed: initialPassed = false,
  nextStepHref,
}: ValidatedExerciseProps) {
  const { data: session } = useSession();
  const toast = useToast();
  const storageKey = exerciseSlug || exerciseId;
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">(
    showJsEditor ? "js" : "html"
  );
  const [testResults, setTestResults] = useState<
    Array<{ passed: boolean; description: string }>
  >([]);
  const [isChecking, setIsChecking] = useState(false);
  const [allPassed, setAllPassed] = useState(initialPassed);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionLoaded, setSolutionLoaded] = useState(false);
  const [hintsViewed, setHintsViewed] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [previewHtml, setPreviewHtml] = useState(() =>
    generatePreviewHTMLFrom(initialHtml, initialCss, initialJs)
  );
  const [consoleLogs, setConsoleLogs] = useState<
    Array<{ level: string; text: string }>
  >([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore saved code from localStorage on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(`exercise-code-${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.html !== undefined) setHtml(parsed.html);
        if (parsed.css !== undefined) setCss(parsed.css);
        if (parsed.js !== undefined) setJs(parsed.js);
        if (parsed.solutionUsed) setSolutionLoaded(true);
        setPreviewHtml(
          generatePreviewHTMLFrom(
            parsed.html ?? initialHtml,
            parsed.css ?? initialCss,
            parsed.js ?? initialJs
          )
        );
      }
    } catch {
      // Ignore corrupt data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Auto-save code to localStorage (debounced)
  const saveToStorage = useCallback(
    (h: string, c: string, j: string, wasSolutionUsed = false) => {
      if (!storageKey) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        // Only save if code differs from initial
        if (h === initialHtml && c === initialCss && j === initialJs) {
          localStorage.removeItem(`exercise-code-${storageKey}`);
        } else {
          localStorage.setItem(
            `exercise-code-${storageKey}`,
            JSON.stringify({
              html: h,
              css: c,
              js: j,
              solutionUsed: wasSolutionUsed,
            })
          );
        }
      }, 800);
    },
    [storageKey, initialHtml, initialCss, initialJs]
  );

  // Reset start time when exercise loads
  useEffect(() => {
    setStartTime(Date.now());
  }, [exerciseId]);

  // Listen for console messages from the preview iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.__exerciseConsole) {
        setConsoleLogs((prev) => [
          ...prev,
          { level: e.data.level, text: e.data.args.join(" ") },
        ]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const refreshPreview = () => {
    setConsoleLogs([]);
    setPreviewHtml(generatePreviewHTMLFrom(html, css, js));
  };

  const generatePreviewHTML = () => {
    return generatePreviewHTMLFrom(html, css, js);
  };

  const runTests = async () => {
    setIsChecking(true);
    setTestResults([]);

    // Also refresh the visual preview
    refreshPreview();

    // Create a temporary unsandboxed iframe for validation (needs DOM access)
    const tempIframe = document.createElement("iframe");
    tempIframe.style.display = "none";
    document.body.appendChild(tempIframe);

    const iframeWindow = tempIframe.contentWindow;
    if (!iframeWindow) {
      document.body.removeChild(tempIframe);
      setIsChecking(false);
      return;
    }

    const doc = iframeWindow.document;
    const previewHtml = generatePreviewHTML();

    doc.open();
    doc.write(previewHtml);
    doc.close();

    // Wait for content to be parsed and scripts to execute
    await new Promise((resolve) => setTimeout(resolve, 500));

    const results = [];
    let passedCount = 0;

    for (const testCase of testCases) {
      try {
        // Get validator function from registry
        const validateFn = getValidator(
          exerciseSlug || exerciseId || "",
          testCase.validatorKey
        );

        if (!validateFn) {
          results.push({
            passed: false,
            description: `${testCase.description} (Validator not found)`,
          });
          continue;
        }

        const passed = await validateFn(html, css, js, iframeWindow);
        results.push({
          passed,
          description: testCase.description,
        });
        if (passed) passedCount++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push({
          passed: false,
          description: `${testCase.description} (Error: ${errorMsg})`,
        });
      }
    }

    setTestResults(results);
    const allTestsPassed = passedCount === testCases.length;
    setAllPassed(allTestsPassed);

    // Clean up temporary iframe
    document.body.removeChild(tempIframe);

    // Notify parent (e.g. StepClient) that all tests passed
    if (allTestsPassed && onAllPassed) {
      onAllPassed(js);
    }

    // Submit to server if user is logged in and all tests passed
    if (allTestsPassed && session?.user && exerciseId) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds

      // Check if solution was used
      if (solutionLoaded) {
        toast.warning(
          "Solution Used",
          "Nice work! But using the solution doesn't count towards achievements. Try solving it on your own next time!"
        );
      } else {
        try {
          const result = await submitExerciseAction(
            exerciseId,
            html,
            css,
            js,
            true,
            passedCount,
            timeSpent,
            hintsViewed
          );

          if (result.success) {
            toast.success(
              "Exercise Completed!",
              "Great job! Your progress has been saved."
            );

            // Show achievement toasts
            if (result.achievements && result.achievements.length > 0) {
              result.achievements.forEach((ua) => {
                toast.achievement(
                  `${ua.achievement.icon} ${ua.achievement.title}`,
                  ua.achievement.description
                );
              });
            }
          } else if (result.error) {
            toast.error("Submission Failed", result.error);
          }
        } catch (error) {
          console.error("Error submitting exercise:", error);
          toast.error(
            "Submission Failed",
            "Failed to save your progress. Please try again."
          );
        }
      }
    }

    setIsChecking(false);
  };

  const handleReset = () => {
    setHtml(initialHtml);
    setCss(initialCss);
    setJs(initialJs);
    setTestResults([]);
    setAllPassed(false);
    setShowHints(false);
    setShowSolution(false);
    setSolutionLoaded(false);
    setHintsViewed(false);
    setStartTime(Date.now());
    setConsoleLogs([]);
    setPreviewHtml(generatePreviewHTMLFrom(initialHtml, initialCss, initialJs));
    if (storageKey) localStorage.removeItem(`exercise-code-${storageKey}`);
  };

  const loadSolution = () => {
    if (solution) {
      const solHtml = solution.html || html;
      const solCss = solution.css || css;
      const solJs = solution.js || js;
      if (solution.html) setHtml(solution.html);
      if (solution.css) setCss(solution.css);
      if (solution.js) setJs(solution.js);
      setShowSolution(true);
      setSolutionLoaded(true);
      setConsoleLogs([]);
      setPreviewHtml(generatePreviewHTMLFrom(solHtml, solCss, solJs));
      if (storageKey) localStorage.removeItem(`exercise-code-${storageKey}`);
      toast.info(
        "Solution Loaded",
        "Remember: using the solution won't count for achievements. Try solving it yourself!"
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden my-6">
      {/* Header */}
      <div
        data-tour="exercise-header"
        className="bg-linear-to-r from-green-500 to-emerald-600 px-4 py-3"
      >
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
                data-tour="exercise-solution-btn"
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
      <div
        data-tour="exercise-instructions"
        className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-700 px-4 py-3"
      >
        <h4 className="text-blue-800 dark:text-blue-300 font-semibold text-sm mb-1">
          📝 Exercise Instructions:
        </h4>
        <p
          className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed prose"
          dangerouslySetInnerHTML={{
            __html: instructions
              .replace(
                /&lt;(\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^&]*?)?)\s*&gt;|<(\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*?)?)\s*>/g,
                (_m, escaped, raw) => {
                  const tag = escaped || raw;
                  return `<code class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200/60 dark:border-orange-700/50">&lt;${tag}&gt;</code>`;
                }
              )
              .replace(
                /&#39;([^&#]+?)&#39;|'([^']+?)'/g,
                (_m, escaped, raw) => {
                  const val = escaped || raw;
                  return `<code class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200/60 dark:border-violet-700/50">${val}</code>`;
                }
              ),
          }}
        />
      </div>

      {/* Success Message */}
      {allPassed && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b-2 border-green-200 dark:border-green-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">All tests passed!</span>
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

      {/* Solution Warning */}
      {solutionLoaded && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-b-2 border-orange-200 dark:border-orange-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm">
                Solution is view-only. Reset the editor to try it yourself.
              </span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        data-tour="exercise-tabs"
        className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
      >
        <div className="flex">
          {showHtmlEditor && (
            <button
              onClick={() => setActiveTab("html")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "html"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              HTML
            </button>
          )}
          {showCssEditor && (
            <button
              onClick={() => setActiveTab("css")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "css"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <Palette className="w-4 h-4" />
              CSS
            </button>
          )}
          {showJsEditor && (
            <button
              onClick={() => setActiveTab("js")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "js"
                  ? "border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-800"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <Code2 className="w-4 h-4" />
              JavaScript
            </button>
          )}
          <button
            onClick={refreshPreview}
            className="ml-auto px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Run code and refresh preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Run
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div
        data-tour="exercise-editor"
        className="m-3 grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        {/* Code Editor */}
        <div>
          {activeTab === "html" && showHtmlEditor && (
            <CodeEditor
              language="html"
              initialCode={html}
              onCodeChange={(v: string) => {
                setHtml(v);
                saveToStorage(v, css, js, solutionLoaded);
              }}
              height="350px"
              canRun={false}
              readOnly={solutionLoaded}
            />
          )}

          {activeTab === "css" && showCssEditor && (
            <CodeEditor
              language="css"
              initialCode={css}
              onCodeChange={(v: string) => {
                setCss(v);
                saveToStorage(html, v, js, solutionLoaded);
              }}
              height="350px"
              canRun={false}
              readOnly={solutionLoaded}
            />
          )}

          {activeTab === "js" && showJsEditor && (
            <CodeEditor
              language="javascript"
              initialCode={js}
              onCodeChange={(v: string) => {
                setJs(v);
                saveToStorage(html, css, v, solutionLoaded);
              }}
              height="350px"
              canRun={false}
              readOnly={solutionLoaded}
            />
          )}
        </div>

        {/* Live Preview */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Preview
            </span>
            <button
              onClick={refreshPreview}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              title="Refresh preview"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            title="Preview"
            className="w-full h-52 border-0"
            sandbox="allow-scripts"
          />
          {/* Console Output */}
          <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-900 text-gray-100 h-full max-h-28 overflow-y-auto font-mono text-xs">
            <div className="px-2 py-1 bg-gray-800 text-gray-400 text-[10px] uppercase tracking-wider sticky top-0">
              Console
            </div>
            {consoleLogs.length === 0 ? (
              <div className="px-2 py-1 text-gray-500 italic">
                No output yet. Click Run to execute your code.
              </div>
            ) : (
              consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={`px-2 py-0.5 border-b border-gray-800 ${
                    log.level === "error"
                      ? "text-red-400"
                      : log.level === "warn"
                        ? "text-yellow-400"
                        : "text-gray-200"
                  }`}
                >
                  {log.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="border-t-2 border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Test Results:
          </h4>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded ${
                  result.passed
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                }`}
              >
                {result.passed ? (
                  <Check className="w-4 h-4 mt-0.5 shrink" />
                ) : (
                  <X className="w-4 h-4 mt-0.5 shrink" />
                )}
                <span className="text-sm">{result.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hints */}
      {hints.length > 0 && (
        <div
          data-tour="exercise-hints"
          className="border-t-2 border-gray-200 dark:border-gray-700 p-4"
        >
          <button
            onClick={() => {
              if (!showHints) {
                setHintsViewed(true);
              }
              setShowHints(!showHints);
            }}
            className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium cursor-pointer hover:text-yellow-700 dark:hover:text-yellow-300"
          >
            <Lightbulb className="w-4 h-4" />
            {showHints ? "Hide Hints" : "Need a Hint?"}
          </button>
          {showHints && (
            <div className="mt-3 space-y-2">
              {hints.map((hint, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800 dark:text-yellow-200"
                >
                  <strong>Hint {index + 1}:</strong> {hint}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Check Button */}
      <div className="border-t-2 border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <button
          data-tour="exercise-check-btn"
          onClick={runTests}
          disabled={isChecking || solutionLoaded}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {solutionLoaded ? (
            <>
              <RotateCcw className="w-4 h-4" />
              Reset to submit your own solution
            </>
          ) : isChecking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Checking...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Check My Solution
            </>
          )}
        </button>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
