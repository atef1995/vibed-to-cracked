"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SelectionTooltipProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (text: string) => void;
  moodAccent: string;
}

export default function SelectionTooltip({
  containerRef,
  onSelect,
  moodAccent,
}: SelectionTooltipProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [selectedText, setSelectedText] = useState("");
  const tooltipRef = useRef<HTMLButtonElement>(null);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      // Small delay before hiding to allow click on tooltip
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (tooltipRef.current && tooltipRef.current.contains(activeEl)) return;
        setPosition(null);
        setSelectedText("");
      }, 200);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 3 || text.length > 1000) return;

    // Check if selection is within the tutorial content container
    const range = selection.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer))
      return;

    const rect = range.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setSelectedText(text);
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener("mouseup", handleSelectionChange);
    document.addEventListener("touchend", handleSelectionChange);

    return () => {
      document.removeEventListener("mouseup", handleSelectionChange);
      document.removeEventListener("touchend", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const handleClick = () => {
    if (selectedText) {
      onSelect(selectedText);
      setPosition(null);
      setSelectedText("");
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <AnimatePresence>
      {position && selectedText && (
        <motion.button
          ref={tooltipRef}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          onClick={handleClick}
          className={`fixed z-9999 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-lg ${moodAccent} hover:opacity-90`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <MessageCircleQuestion className="h-3.5 w-3.5" />
          Ask Tutor
        </motion.button>
      )}
    </AnimatePresence>
  );
}
