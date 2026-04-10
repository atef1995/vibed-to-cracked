"use client";

import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-75 bg-gray-950 rounded-xl animate-pulse" />
  ),
});

interface InterviewCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
  starterCode?: string;
}

export default function InterviewCodeEditor({
  code,
  onChange,
  language = "javascript",
  starterCode,
}: InterviewCodeEditorProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        {starterCode && code !== starterCode && (
          <button
            onClick={() => onChange(starterCode)}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
      <div className="h-75">
        <CodeEditor
          initialCode={code}
          language={language}
          onCodeChange={onChange}
          canRun={false}
          height="300px"
        />
      </div>
    </div>
  );
}
