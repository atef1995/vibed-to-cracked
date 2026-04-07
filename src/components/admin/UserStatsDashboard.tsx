"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Crown, TrendingUp, Calendar, Activity } from "lucide-react";

interface UserStats {
  totalUsers: number;
  subscribedUsers: number;
  freeUsers: number;
  activeToday: number;
  activeThisWeek: number;
  newThisWeek: number;
}

interface RecentUser {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  subscription: string;
  xp: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export default function UserStatsDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/user-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "VIBED":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-purple-500 text-purple-800 rounded-full">
            VIBED
          </span>
        );
      case "CRACKED":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-yellow-800 rounded-full">
            CRACKED
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-400 text-gray-800 rounded-full">
            FREE
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-200">User Statistics</h2>
        <button
          onClick={fetchStats}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-300">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {stats.totalUsers.toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-300" />
              <span className="text-sm text-gray-300">Subscribed</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {stats.subscribedUsers.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-gray-300" />
              <span className="text-sm text-gray-300">Free Users</span>
            </div>
            <p className="text-2xl font-bold text-gray-200">
              {stats.freeUsers.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-300" />
              <span className="text-sm text-gray-300">Active Today</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {stats.activeToday.toLocaleString()}
            </p>
          </div>

          <div className="bg-teal-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-teal-300" />
              <span className="text-sm text-gray-300">Active This Week</span>
            </div>
            <p className="text-2xl font-bold text-teal-900">
              {stats.activeThisWeek.toLocaleString()}
            </p>
          </div>

          <div className="bg-orange-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-300" />
              <span className="text-sm text-gray-300">New This Week</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {stats.newThisWeek.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Recent Users Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-200 mb-4">
          Recently Active Users
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-500">
            <thead className="bg-gray-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Subscription
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  XP / Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-600 divide-y divide-gray-500">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-300 text-sm">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-200 text-sm">
                          {user.name || "No name"}
                        </p>
                        <p className="text-xs text-gray-300">{user.email}</p>
                        {user.username && (
                          <p className="text-xs text-gray-400">
                            @{user.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getSubscriptionBadge(user.subscription)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-200">
                      {user.xp.toLocaleString()} XP
                    </span>
                    <span className="text-xs text-gray-300 ml-2">
                      Lvl {user.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatDate(user.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
