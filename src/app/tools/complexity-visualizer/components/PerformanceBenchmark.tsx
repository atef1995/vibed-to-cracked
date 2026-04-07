"use client";

import React, { useState, useCallback } from "react";
import { UpgradeOverlay } from "./UpgradeOverlay";
import { Play, Clock, TrendingUp, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * PerformanceBenchmark Component
 *
 * Run real performance benchmarks on custom code
 *
 * Features:
 * - FREE mode: Shows pre-run benchmark results (static)
 * - CRACKED mode: Run custom code with different input sizes
 * - Real-time performance measurement
 * - Visual performance graphs
 * - Export results
 */

interface PerformanceBenchmarkProps {
  /** User's current plan */
  plan: "FREE" | "VIBED" | "CRACKED";
  /** Custom className */
  className?: string;
}

/**
 * Benchmark result for a single test
 */
interface BenchmarkResult {
  inputSize: number;
  runtime: number; // milliseconds
  iterations: number;
}

/**
 * Pre-computed benchmark results for FREE users
 */
const EXAMPLE_BENCHMARKS: Record<string, BenchmarkResult[]> = {
  "Array Sum (O(n))": [
    { inputSize: 100, runtime: 0.05, iterations: 1000 },
    { inputSize: 1000, runtime: 0.5, iterations: 1000 },
    { inputSize: 10000, runtime: 5.2, iterations: 100 },
    { inputSize: 100000, runtime: 52.8, iterations: 10 },
  ],
  "Bubble Sort (O(n²))": [
    { inputSize: 100, runtime: 2.1, iterations: 100 },
    { inputSize: 1000, runtime: 205.4, iterations: 10 },
    { inputSize: 10000, runtime: 20540.2, iterations: 1 },
  ],
};

/**
 * Extract a callable function from user code using new Function.
 * Expects the code to define a function (declaration or expression).
 */
function extractUserFunction(
  code: string
): ((...args: unknown[]) => unknown) | null {
  // Try as expression (arrow function or function expression)
  try {
    const fn = new Function("return " + code)();
    if (typeof fn === "function") return fn;
  } catch {
    /* not an expression */
  }

  // Try wrapping in an object to capture function declarations
  try {
    const fnMatch = code.match(/function\s+(\w+)/);
    if (fnMatch) {
      const fn = new Function(code + "\nreturn " + fnMatch[1] + ";")();
      if (typeof fn === "function") return fn;
    }
  } catch {
    /* declaration extraction failed */
  }

  return null;
}

/**
 * Generate a random integer array of length n
 */
function generateTestArray(n: number): number[] {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = Math.floor(Math.random() * n);
  return arr;
}

/**
 * Run a real benchmark by executing user code with different input sizes.
 * Returns results with actual measured timings.
 */
/** Max wall-clock time (ms) we allow per single input size */
const PER_SIZE_TIME_CAP = 5_000;

function runBenchmark(
  fn: (...args: unknown[]) => unknown,
  inputSizes: number[]
): BenchmarkResult[] {
  return inputSizes.map((n) => {
    const targetMs = 200;
    // Warm-up run
    const warmArr = generateTestArray(Math.min(n, 100));
    try {
      fn([...warmArr]);
    } catch {
      /* ignore warm-up errors */
    }

    // Single probe to estimate iteration count
    const probeArr = generateTestArray(n);
    const probeStart = performance.now();
    fn([...probeArr]);
    const probeTime = performance.now() - probeStart;

    // If a single call already exceeds the cap, return just the probe
    if (probeTime > PER_SIZE_TIME_CAP) {
      return {
        inputSize: n,
        runtime: Number(probeTime.toFixed(2)),
        iterations: 1,
      };
    }

    const iterations = Math.max(
      1,
      Math.min(1000, Math.ceil(targetMs / Math.max(probeTime, 0.01)))
    );

    // Timed runs with wall-clock budget
    let total = 0;
    let completed = 0;
    const deadline = performance.now() + PER_SIZE_TIME_CAP;
    for (let i = 0; i < iterations; i++) {
      if (performance.now() > deadline) break;
      const arr = generateTestArray(n);
      const start = performance.now();
      fn([...arr]);
      const end = performance.now();
      total += end - start;
      completed++;
    }

    return {
      inputSize: n,
      runtime: Number((total / Math.max(completed, 1)).toFixed(2)),
      iterations: completed,
    };
  });
}

export function PerformanceBenchmark({
  plan,
  className = "",
}: PerformanceBenchmarkProps) {
  const isCracked = plan === "CRACKED";

  const [selectedExample, setSelectedExample] = useState<string>(
    Object.keys(EXAMPLE_BENCHMARKS)[0]
  );
  const [customCode, setCustomCode] = useState("");
  const [inputSizes, setInputSizes] = useState<string>("100,1000,10000");
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle benchmark execution (CRACKED only)
   */
  const handleRunBenchmark = useCallback(() => {
    if (!isCracked || !customCode.trim()) return;

    setError(null);
    setIsRunning(true);

    // Use setTimeout to yield to the UI before blocking with benchmark runs
    setTimeout(() => {
      try {
        const fn = extractUserFunction(customCode);
        if (!fn) {
          setError(
            "Could not find a callable function in your code. Make sure you define a function that accepts an array parameter."
          );
          setIsRunning(false);
          return;
        }

        const sizes = inputSizes
          .split(",")
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n) && n > 0 && n <= 1_000_000);

        if (sizes.length === 0) {
          setError("Enter at least one valid input size (1 - 1,000,000).");
          setIsRunning(false);
          return;
        }

        const benchmarkResults = runBenchmark(fn, sizes);
        setResults(benchmarkResults);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while running the benchmark."
        );
      } finally {
        setIsRunning(false);
      }
    }, 50);
  }, [isCracked, customCode, inputSizes]);

  /**
   * Export results as CSV (CRACKED only)
   */
  const exportResults = () => {
    if (!isCracked || !results) return;

    const headers = ["Input Size", "Runtime (ms)", "Iterations"];
    const csvRows = [
      headers.join(","),
      ...results.map((r) => `${r.inputSize},${r.runtime},${r.iterations}`),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "benchmark-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Current data to display
   */
  const displayData =
    isCracked && results ? results : EXAMPLE_BENCHMARKS[selectedExample];

  /**
   * Calculate performance grade
   */
  const getPerformanceGrade = (results: BenchmarkResult[]): string => {
    if (results.length < 2) return "N/A";

    const firstResult = results[0];
    const lastResult = results[results.length - 1];
    const sizeRatio = lastResult.inputSize / firstResult.inputSize;
    const timeRatio = lastResult.runtime / firstResult.runtime;

    if (sizeRatio <= 1 || timeRatio <= 0 || !isFinite(timeRatio)) return "N/A";

    // Compute growth exponent: time ∝ n^k → k = log(timeRatio) / log(sizeRatio)
    const k = Math.log(timeRatio) / Math.log(sizeRatio);

    if (k < 1.3) return "Excellent (O(n) or better)";
    if (k < 1.8) return "Good (O(n log n))";
    if (k < 2.5) return "Fair (O(n²))";
    return "Poor (O(n³) or worse)";
  };

  return (
    <div className={`relative ${className}`}>
      {/* FREE Mode: Show preview with overlay */}
      {!isCracked && (
        <UpgradeOverlay
          featureName="Real-Time Performance Benchmark"
          valueProp="Run your code with different input sizes and measure actual performance"
          benefits={[
            "Run your code and measure real performance",
            "Test with custom input sizes (10 to 1,000,000)",
            "See real runtime measurements (not theoretical)",
            "Visual performance graphs and trends",
            "Export results for documentation and interviews",
          ]}
          currentPlan={plan}
          className="min-h-150"
        />
      )}

      {/* Example Selector (FREE mode) — outside pointer-events-none so controls work */}
      {!isCracked && (
        <div className="bg-white dark:bg-gray-900 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700 p-6 pb-0">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-7 h-7" />
              Performance Benchmark
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Preview: View example benchmark results
            </p>
          </div>
          <div className="mb-6">
            <label
              htmlFor="example-selection"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Example Benchmark:
            </label>
            <select
              id="example-selection"
              value={selectedExample}
              onChange={(e) => setSelectedExample(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
            >
              {Object.keys(EXAMPLE_BENCHMARKS).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 ${
          !isCracked
            ? "pointer-events-none select-none rounded-b-lg"
            : "rounded-lg"
        }`}
      >
        {/* Header (CRACKED only — FREE header is above) */}
        {isCracked && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-7 h-7" />
              Performance Benchmark
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Measure real-world performance of your code
            </p>
          </div>
        )}

        {/* Controls */}
        {isCracked && (
          <div className="mb-6 space-y-4">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Code:
              </label>
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="function yourFunction(arr) {&#10;  // Your implementation here&#10;  return result;&#10;}"
                className="w-full h-40 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Input Sizes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Input Sizes (comma-separated):
              </label>
              <input
                type="text"
                value={inputSizes}
                onChange={(e) => setInputSizes(e.target.value)}
                placeholder="100, 1000, 10000, 100000"
                className="w-full px-4 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended: Start small (100) and increase by 10x
              </p>
            </div>

            {/* Run Button */}
            <div className="flex gap-2">
              <button
                onClick={handleRunBenchmark}
                disabled={!customCode.trim() || isRunning}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                  ${
                    customCode.trim() && !isRunning
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                <Play className="w-4 h-4" />
                {isRunning ? "Running Benchmark..." : "Run Benchmark"}
              </button>

              {results && (
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isRunning && (
          <div className="mb-6 p-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
              Running benchmark with different input sizes...
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              This may take a few seconds
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isRunning && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Benchmark Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {displayData && !isRunning && (
          <>
            {/* Performance Grade */}
            <div className="mb-6 p-4 bg-linear-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Performance Grade:
              </h4>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-600 to-blue-600">
                {getPerformanceGrade(displayData)}
              </div>
            </div>

            {/* Chart */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Runtime vs Input Size
              </h4>
              <div className="w-full h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="inputSize"
                      label={{
                        value: "Input Size",
                        position: "insideBottom",
                        offset: -5,
                      }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis
                      label={{
                        value: "Runtime (ms)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.9)",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#f9fafb",
                      }}
                      formatter={(value: number | undefined) => {
                        if (value === undefined) return ["N/A", "Runtime"];
                        return [`${value}ms`, "Runtime"];
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="runtime"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#8b5cf6" }}
                      activeDot={{ r: 8 }}
                      name="Runtime (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Detailed Results
              </h4>
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-indigo-500 to-purple-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold rounded-tl-lg">
                      Input Size
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Runtime (ms)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Iterations
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold rounded-tr-lg">
                      Total Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayData.map((result, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50 dark:bg-gray-800/50"
                      }
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                        {result.inputSize.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                        {result.runtime.toFixed(2)}ms
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {result.iterations.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                        {(result.runtime * result.iterations).toFixed(2)}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Insights */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Performance Insights:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>
                  {(() => {
                    const first = displayData[0].runtime;
                    const last = displayData[displayData.length - 1].runtime;
                    const sizeGrowth =
                      displayData[displayData.length - 1].inputSize /
                      displayData[0].inputSize;
                    if (!first || !last || !isFinite(last / first)) {
                      return `• Input size spans ${sizeGrowth.toLocaleString()}x`;
                    }
                    return `• When input size increases ${sizeGrowth.toLocaleString()}x, runtime increases ${(last / first).toFixed(1)}x`;
                  })()}
                </li>
                <li>
                  • Faster execution means fewer iterations needed for reliable
                  measurement
                </li>
                <li>
                  • Look for linear growth (good) vs exponential growth (bad)
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Tips for FREE users */}
        {!isCracked && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
              Unlock Custom Benchmarks:
            </h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <li>• Test your own code implementations</li>
              <li>• Compare multiple approaches side-by-side</li>
              <li>• Identify performance bottlenecks</li>
              <li>• Generate performance reports for documentation</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
