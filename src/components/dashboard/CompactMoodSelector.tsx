"use client";

import { useState } from "react";
import { useMood } from "@/components/providers/MoodProvider";
import { MoodSelector } from "@/components/MoodSelector";
import { Waves, Zap, Target, ChevronDown, ChevronUp } from "lucide-react";
import getMoodColors from "@/lib/getMoodColors";

const moodIcons: Record<string, typeof Waves> = {
  chill: Waves,
  rush: Zap,
  grind: Target,
};

export function CompactMoodSelector() {
  const { currentMood } = useMood();
  const [expanded, setExpanded] = useState(false);
  const Icon = moodIcons[currentMood.id] || Waves;
  const colors = getMoodColors(currentMood.id);

  return (
    <div className="mb-10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
      >
        <Icon className={`h-5 w-5 ${colors.text}`} />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Current mood: <span className={colors.text}>{currentMood.name}</span>
        </span>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          Change
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
      {expanded && (
        <div className="mt-3">
          <MoodSelector showDescription={true} />
        </div>
      )}
    </div>
  );
}
