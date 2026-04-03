"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

interface RecentAchievement {
  id: string;
  title: string;
  icon: string;
  rarity: string;
  points: number;
  unlockedAt: string;
}

const rarityBorder: Record<string, string> = {
  COMMON: "border-gray-200 dark:border-gray-600",
  RARE: "border-blue-300 dark:border-blue-600",
  EPIC: "border-purple-300 dark:border-purple-600",
  LEGENDARY: "border-yellow-300 dark:border-yellow-600",
};

export function RecentAchievements({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<RecentAchievement[]>([]);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/achievements");
        if (!res.ok) return;
        const data = await res.json();

        const unlocked = data.achievements
          .filter((a: { isUnlocked: boolean }) => a.isUnlocked)
          .sort(
            (a: { unlockedAt: string }, b: { unlockedAt: string }) =>
              new Date(b.unlockedAt).getTime() -
              new Date(a.unlockedAt).getTime()
          )
          .slice(0, 4);

        setAchievements(unlocked);
        setTotalUnlocked(data.unlockedCount);
        setTotalCount(data.totalCount);
      } catch {
        // silently fail — not critical
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [userId]);

  if (loading || achievements.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Achievements
        </h2>
        <Link
          href="/achievements"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          View all ({totalUnlocked}/{totalCount})
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {achievements.map((a) => (
          <Link
            key={a.id}
            href={`/achievements?highlight=${a.id}`}
            className={`flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border ${
              rarityBorder[a.rarity] || rarityBorder.COMMON
            } hover:shadow-md transition-all text-center`}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
              {a.title}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {new Date(a.unlockedAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
