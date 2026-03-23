"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Trash2, Send, Square, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TutorMessageBubble } from "./TutorMessage";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  highlightedText?: string | null;
  createdAt?: string;
}

interface TutorChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isStreaming: boolean;
  usage: { used: number; limit: number | null; remaining: number | null };
  highlightedText: string | null;
  onSendMessage: (text: string, highlighted?: string | null) => void;
  onClearHistory: () => void;
  onStopStreaming: () => void;
  onClearHighlight: () => void;
  moodColors: {
    accent: string;
    text: string;
    border: string;
    bg: string;
    badge: string;
  };
  moodId: string;
}

const TUTOR_NAMES: Record<string, string> = {
  chill: "Zen",
  rush: "Bolt",
  grind: "Forge",
};

export default function TutorChatPanel({
  isOpen,
  onClose,
  messages,
  isStreaming,
  usage,
  highlightedText,
  onSendMessage,
  onClearHistory,
  onStopStreaming,
  onClearHighlight,
  moodColors,
  moodId,
}: TutorChatPanelProps) {
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tutorName = TUTOR_NAMES[moodId] || "Zen";
  const isLimitReached =
    usage.limit !== null && usage.remaining !== null && usage.remaining <= 0;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming || isLimitReached) return;
    onSendMessage(text, highlightedText);
    setInput("");
    onClearHighlight();
  }, [
    input,
    isStreaming,
    isLimitReached,
    onSendMessage,
    highlightedText,
    onClearHighlight,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed z-9998 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-200 dark:border-gray-700 dark:bg-gray-900 ${
            expanded
              ? "bottom-4 right-4 h-[min(90vh,800px)] w-[min(700px,calc(100vw-2rem))]"
              : "bottom-20 right-4 h-[min(500px,70vh)] w-[min(400px,calc(100vw-2rem))]"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${moodColors.badge} text-sm font-bold`}
              >
                {tutorName[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {tutorName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your JS tutor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  title="Clear history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div
                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${moodColors.badge} text-xl font-bold`}
                >
                  {tutorName[0]}
                </div>
                <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hey, I&apos;m {tutorName}
                </p>
                <p className="max-w-65 text-xs text-gray-500 dark:text-gray-400">
                  I won&apos;t give you the answer directly, but I&apos;ll help
                  you figure it out. Highlight any text in the tutorial and ask
                  me about it.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className="group">
                <TutorMessageBubble
                  role={msg.role}
                  content={msg.content}
                  highlightedText={msg.highlightedText}
                  moodAccent={moodColors.accent}
                  moodText={moodColors.text}
                />
              </div>
            ))}

            {/* Streaming indicator */}
            {isStreaming &&
              messages.length > 0 &&
              messages[messages.length - 1].content === "" && (
                <div className="mb-3 flex justify-start">
                  <div className="rounded-xl bg-white px-4 py-3 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>

          {/* Highlighted text preview */}
          {highlightedText && (
            <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
              <div className="flex items-start gap-2">
                <div
                  className={`flex-1 rounded-md border-l-2 border-current bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400`}
                >
                  <span className={`font-medium ${moodColors.text}`}>
                    Selected text:
                  </span>{" "}
                  &ldquo;
                  {highlightedText.length > 100
                    ? highlightedText.slice(0, 100) + "..."
                    : highlightedText}
                  &rdquo;
                </div>
                <button
                  onClick={onClearHighlight}
                  className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Clear selection"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Usage + Input */}
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            {/* Rate limit warning */}
            {isLimitReached && (
              <div className="mb-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                You&apos;ve used all {usage.limit} messages for today. Resets at
                midnight.
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isLimitReached
                    ? "Daily limit reached..."
                    : "Ask about the tutorial..."
                }
                disabled={isLimitReached}
                className="h-10 max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:bg-white disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-600 dark:focus:bg-gray-800"
                rows={1}
              />
              {isStreaming ? (
                <button
                  onClick={onStopStreaming}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  title="Stop"
                >
                  <Square className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLimitReached}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-30 ${moodColors.accent} text-white`}
                  title="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Usage counter */}
            {usage.limit !== null && (
              <p className="mt-1.5 text-center text-[10px] text-gray-400 dark:text-gray-500">
                {usage.used}/{usage.limit} messages today
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
