"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface TutorFABProps {
  onClick: () => void;
  isOpen: boolean;
  moodColors: {
    accent: string;
    badge: string;
    text: string;
  };
  remaining: number | null;
  isAuthenticated: boolean;
  onSignInPrompt: () => void;
}

export default function TutorFAB({
  onClick,
  isOpen,
  moodColors,
  remaining,
  isAuthenticated,
  onSignInPrompt,
}: TutorFABProps) {
  const handleClick = () => {
    if (!isAuthenticated) {
      onSignInPrompt();
      return;
    }
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-4 right-4 z-9997 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors ${
        isOpen
          ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          : `${moodColors.accent} text-white`
      }`}
      title={isAuthenticated ? "Ask your tutor" : "Sign in to use AI tutor"}
      aria-label="Toggle AI tutor chat"
    >
      <GraduationCap className="h-6 w-6" />

      {/* Remaining messages badge */}
      {isAuthenticated && !isOpen && remaining !== null && remaining > 0 && (
        <span
          className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${moodColors.badge}`}
        >
          {remaining}
        </span>
      )}

      {/* Limit reached indicator */}
      {isAuthenticated && !isOpen && remaining !== null && remaining <= 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-[9px] text-gray-500 dark:bg-gray-600 dark:text-gray-400">
          0
        </span>
      )}
    </motion.button>
  );
}
