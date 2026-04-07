"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  TrendingUp,
  Eye,
  Monitor,
  Smartphone,
  Globe,
  ArrowRight,
  Clock,
} from "lucide-react";

interface Stats {
  totalSessions: number;
  convertedSessions: number;
  unconvertedSessions: number;
  conversionRate: number;
  avgTutorialsViewed: number;
}

interface FunnelStep {
  bucket: string;
  total: number;
  converted: number;
  conversionRate: number;
}

interface TopTutorial {
  tutorialId: string;
  slug: string;
  conversions: number;
}

interface RecentSession {
  id: string;
  anonymousId: string;
  pagesViewed: number;
  totalTimeSpent: number;
  tutorialsViewed: { tutorialId: string; slug?: string; timeSpent: number }[];
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  source: string | null;
  landingPage: string | null;
  convertedToUserId: string | null;
  convertedAt: string | null;
  createdAt: string;
  lastActiveAt: string;
}

interface DeviceEntry {
  device: string;
  count: number;
}

interface SourceEntry {
  source: string;
  count: number;
}

interface MetricsData {
  stats: Stats;
  funnel: FunnelStep[];
  topTutorials: TopTutorial[];
  recentSessions: RecentSession[];
  deviceBreakdown: DeviceEntry[];
  sourceBreakdown: SourceEntry[];
}

export default function AnonymousMetrics() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/anonymous-metrics");
      if (response.ok) {
        setData(await response.json());
      }
    } catch (error) {
      console.error("Error fetching anonymous metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatBucket = (b: string) =>
    b.replace(/_/g, " ").replace(/(\d)/g, " $1").trim();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        Failed to load anonymous metrics.
      </div>
    );
  }

  const {
    stats,
    funnel,
    topTutorials,
    recentSessions,
    deviceBreakdown,
    sourceBreakdown,
  } = data;

  const totalDevices = deviceBreakdown.reduce((s, d) => s + d.count, 0);
  const totalSources = sourceBreakdown.reduce((s, d) => s + d.count, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-8 h-8 text-blue-600" />}
          bg="bg-gray-600"
          value={stats.totalSessions.toLocaleString()}
          label="Total Anonymous Sessions"
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8 text-green-600" />}
          bg="bg-gray-600"
          value={`${stats.conversionRate}%`}
          label={`${stats.convertedSessions} Conversions`}
        />
        <StatCard
          icon={<Eye className="w-8 h-8 text-purple-600" />}
          bg="bg-gray-600"
          value={stats.avgTutorialsViewed.toFixed(1)}
          label="Avg Tutorials Viewed"
        />
        <StatCard
          icon={<Users className="w-8 h-8 text-orange-600" />}
          bg="bg-gray-600"
          value={stats.unconvertedSessions.toLocaleString()}
          label="Active Anonymous"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Conversion Funnel
          </h3>
          <div className="space-y-2">
            {funnel.map((step) => {
              const pct =
                stats.totalSessions > 0
                  ? (step.total / stats.totalSessions) * 100
                  : 0;
              return (
                <div key={step.bucket} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-28 shrink-0">
                    {formatBucket(step.bucket)}
                  </span>
                  <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gray-6000 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-400">
                      {step.total} ({step.conversionRate}% converted)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Converting Tutorials */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Top Converting Tutorials
          </h3>
          {topTutorials.length === 0 ? (
            <p className="text-sm text-gray-400">No conversion data yet.</p>
          ) : (
            <div className="space-y-2">
              {topTutorials.map((t, i) => (
                <div
                  key={t.tutorialId}
                  className="flex items-center justify-between px-3 py-2 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400 w-5">
                      {i + 1}.
                    </span>
                    <span className="text-sm text-gray-800 truncate max-w-50">
                      {t.slug || t.tutorialId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-700 font-medium">
                    <ArrowRight className="w-3 h-3" />
                    {t.conversions}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Devices</h3>
          <div className="space-y-2">
            {deviceBreakdown.map((d) => {
              const pct = totalDevices > 0 ? (d.count / totalDevices) * 100 : 0;
              const Icon =
                d.device?.toLowerCase() === "mobile" ? Smartphone : Monitor;
              return (
                <div key={d.device} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-400 w-20 shrink-0">
                    {d.device}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {d.count} ({Math.round(pct)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Traffic Sources
          </h3>
          <div className="space-y-2">
            {sourceBreakdown.map((s) => {
              const pct = totalSources > 0 ? (s.count / totalSources) * 100 : 0;
              return (
                <div key={s.source} className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-400 w-20 shrink-0 truncate">
                    {s.source}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {s.count} ({Math.round(pct)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          Recent Visitors
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Visitor
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Pages
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Tutorials
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Device
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s) => {
                const tutorials = Array.isArray(s.tutorialsViewed)
                  ? s.tutorialsViewed
                  : [];
                return (
                  <tr
                    key={s.id}
                    className="border-b border-gray-100 hover:bg-gray-700"
                  >
                    <td className="py-2 px-3">
                      <span
                        className="text-xs text-gray-500 font-mono"
                        title={s.anonymousId}
                      >
                        {s.anonymousId.slice(0, 16)}...
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-400">
                      {s.pagesViewed}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-sm text-gray-400">
                        {tutorials.length}
                      </span>
                      {tutorials.length > 0 && (
                        <span
                          className="ml-1 text-xs text-gray-400"
                          title={tutorials
                            .map((t) => t.slug || t.tutorialId)
                            .join(", ")}
                        >
                          ({tutorials.map((t) => t.slug || "?").join(", ")})
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatTime(s.totalTimeSpent)}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-300">
                      {[s.device, s.browser, s.os]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-300">
                      {s.source || "Direct"}
                    </td>
                    <td className="py-2 px-3">
                      {s.convertedToUserId ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Converted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-300">
                          Anonymous
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-500">
                      {formatDate(s.lastActiveAt)}
                    </td>
                  </tr>
                );
              })}
              {recentSessions.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    No anonymous sessions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  bg,
  value,
  label,
}: {
  icon: React.ReactNode;
  bg: string;
  value: string;
  label: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-4 flex items-center gap-3`}>
      {icon}
      <div>
        <p className="text-2xl font-bold text-gray-400">{value}</p>
        <p className="text-sm text-gray-300">{label}</p>
      </div>
    </div>
  );
}
