"use client";

export default function CheatSheetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || "Failed to load this cheat sheet."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
