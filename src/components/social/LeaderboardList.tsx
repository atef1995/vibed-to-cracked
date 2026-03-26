"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trophy, Medal, Crown, Users, TrendingUp, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  score: number;
  level: number;
}

interface CurrentUserEntry extends LeaderboardEntry {
  isInTop100: boolean;
}

interface LeaderboardResponse {
  success: boolean;
  entries: LeaderboardEntry[];
  currentUser?: CurrentUserEntry;
  type: "xp" | "points";
  scope: "global" | "friends";
  period: "all" | "weekly" | "monthly";
  error?: string;
}

interface LeaderboardListProps {
  currentUserId?: string;
}

export const LeaderboardList = ({ currentUserId }: LeaderboardListProps) => {
  const [type, setType] = useState<"xp" | "points">("points");
  const [scope, setScope] = useState<"global" | "friends">("global");
  const [period, setPeriod] = useState<"all" | "weekly" | "monthly">("all");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/social/leaderboard?type=${type}&scope=${scope}&period=${period}`
        );
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type, scope, period]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {rank}
          </span>
        );
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case 2:
        return "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600";
      case 3:
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      default:
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          {/* Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Rank by:
            </span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setType("xp")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  type === "xp"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                XP
              </button>
              <button
                onClick={() => setType("points")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  type === "points"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Award className="w-4 h-4 inline mr-1" />
                Points
              </button>
            </div>
          </div>

          {/* Scope Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show:
            </span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setScope("global")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  scope === "global"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-1" />
                Global
              </button>
              <button
                onClick={() => setScope("friends")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  scope === "friends"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Friends
              </button>
            </div>
          </div>

          {/* Period Select */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Period:
            </span>
            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value as "all" | "weekly" | "monthly")
              }
              title="Select time period"
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-2">
        {data?.entries && data.entries.length > 0 ? (
          <>
            {data.entries.map((entry) => {
              const isCurrentUser = entry.id === currentUserId;
              const entryName = entry.name || "Anonymous";
              const entryUsername = entry.username || "user";
              const entryImage = entry.image || "/default-avatar.png";

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-shadow hover:shadow-sm ${getRankBackground(
                    entry.rank
                  )} ${isCurrentUser ? "ring-2 ring-blue-500" : ""}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <Image
                    src={entryImage}
                    alt={`${entryName} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {entryName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      @{entryUsername}
                    </p>
                  </div>

                  {/* Level Badge */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Lvl {entry.level}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {entry.score.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {type === "xp" ? "XP" : "pts"}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Current User if not in top 100 */}
            {data.currentUser && !data.currentUser.isInTop100 && (
              <>
                <div className="flex items-center justify-center py-2">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    ...
                  </span>
                </div>
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border ring-2 ring-blue-500 ${getRankBackground(
                    0
                  )}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {data.currentUser.rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <Image
                    src={data.currentUser.image || "/default-avatar.png"}
                    alt={`${data.currentUser.name} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {data.currentUser.name || "Anonymous"}
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      @{data.currentUser.username || "user"}
                    </p>
                  </div>

                  {/* Level Badge */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Lvl {data.currentUser.level}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {data.currentUser.score.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {type === "xp" ? "XP" : "pts"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No rankings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {scope === "friends"
                ? "Add some friends to see how you compare!"
                : period !== "all"
                  ? `No ${type === "xp" ? "XP" : "points"} earned this ${
                      period === "weekly" ? "week" : "month"
                    } yet.`
                  : "Start earning XP and unlock achievements to climb the leaderboard!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
