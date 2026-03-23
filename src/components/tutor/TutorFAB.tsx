"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X } from "lucide-react";

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

const NOTIFICATION_KEY = "tutor-notif-dismissed";

export default function TutorFAB({
  onClick,
  isOpen,
  moodColors,
  remaining,
  isAuthenticated,
  onSignInPrompt,
}: TutorFABProps) {
  const [showNotification, setShowNotification] = useState(false);

  // Show notification bubble after a delay, once per session
  useEffect(() => {
    if (!isAuthenticated || isOpen) return;
    if (sessionStorage.getItem(NOTIFICATION_KEY)) return;

    const timer = setTimeout(() => setShowNotification(true), 3000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isOpen]);

  // Auto-hide notification after 12 seconds
  useEffect(() => {
    if (!showNotification) return;
    const timer = setTimeout(() => setShowNotification(false), 12000);
    return () => clearTimeout(timer);
  }, [showNotification]);

  // Hide notification when chat opens
  useEffect(() => {
    if (isOpen && showNotification) {
      setShowNotification(false);
      sessionStorage.setItem(NOTIFICATION_KEY, "1");
    }
  }, [isOpen, showNotification]);

  const dismissNotification = () => {
    setShowNotification(false);
    sessionStorage.setItem(NOTIFICATION_KEY, "1");
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      onSignInPrompt();
      return;
    }
    onClick();
  };

  const handleNotificationClick = () => {
    dismissNotification();
    handleClick();
  };

  return (
    <>
      {/* Notification bubble */}
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-4 z-9997 max-w-[260px]"
          >
            <div
              onClick={handleNotificationClick}
              className="relative cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification();
                }}
                className="absolute right-1.5 top-1.5 rounded-full p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="pr-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                Need help? I&apos;m your AI tutor
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Try asking: &ldquo;Can you explain this in simpler terms?&rdquo;
              </p>
              {/* Arrow pointing to FAB */}
              <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}
