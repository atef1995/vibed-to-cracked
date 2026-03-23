"use client";

import { memo, useState } from "react";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TutorMessageProps {
  role: "user" | "assistant";
  content: string;
  highlightedText?: string | null;
  moodAccent: string;
  moodText: string;
}

export const TutorMessageBubble = memo(function TutorMessageBubble({
  role,
  content,
  highlightedText,
  moodAccent,
  moodText,
}: TutorMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`relative max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
            : `bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`
        }`}
      >
        {/* Highlighted text quote */}
        {highlightedText && isUser && (
          <div
            className={`mb-2 rounded-md border-l-3 ${moodAccent} bg-gray-100 p-2 text-xs text-gray-600 dark:bg-gray-700/50 dark:text-gray-400`}
          >
            &ldquo;
            {highlightedText.length > 150
              ? highlightedText.slice(0, 150) + "..."
              : highlightedText}
            &rdquo;
          </div>
        )}

        {/* Message content */}
        {isUser ? (
          <div className="whitespace-pre-wrap wrap-break-word">{content}</div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-headings:my-2 prose-headings:text-sm prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-normal dark:prose-code:bg-gray-700 prose-pre:rounded-md prose-pre:bg-gray-900 prose-pre:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}

        {/* Copy button for assistant messages */}
        {!isUser && content && (
          <button
            onClick={handleCopy}
            className={`absolute -bottom-5 right-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-400 transition-opacity hover:text-gray-600 group-hover:opacity-100 dark:hover:text-gray-300 ${copied ? "opacity-100" : "opacity-0"}`}
            title="Copy response"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
});
