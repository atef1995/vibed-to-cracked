"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import {
  Users,
  TrendingUp,
  Eye,
  Monitor,
  Smartphone,
  Globe,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  LogOut,
  MapPin,
  Timer,
  AlertTriangle,
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
  tutorialsViewed: {
    tutorialId: string;
    slug?: string;
    startedAt?: string;
    timeSpent: number;
  }[];
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  region: string | null;
  source: string | null;
  medium: string | null;
  referrer: string | null;
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

interface DropOffData {
  lastTutorials: { slug: string; count: number }[];
  landingPages: {
    page: string;
    visits: number;
    avgTime: number;
    avgPages: number;
    bounceRate: number;
  }[];
  durationBuckets: { bucket: string; count: number }[];
  bounceRate: number;
  totalAbandoned: number;
}

interface MetricsData {
  stats: Stats;
  funnel: FunnelStep[];
  topTutorials: TopTutorial[];
  recentSessions: RecentSession[];
  deviceBreakdown: DeviceEntry[];
  sourceBreakdown: SourceEntry[];
  dropOff: DropOffData;
}

export default function AnonymousMetrics() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
    dropOff,
  } = data;

  const totalDevices = deviceBreakdown.reduce((s, d) => s + d.count, 0);
  const totalSources = sourceBreakdown.reduce((s, d) => s + d.count, 0);
  const maxDuration = Math.max(
    ...dropOff.durationBuckets.map((b) => b.count),
    1
  );

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Users className="w-8 h-8 text-blue-600" />}
          bg="bg-gray-600"
          value={stats.totalSessions.toLocaleString()}
          label="Total Sessions"
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8 text-green-600" />}
          bg="bg-gray-600"
          value={`${stats.conversionRate}%`}
          label={`${stats.convertedSessions} Converted`}
        />
        <StatCard
          icon={<Eye className="w-8 h-8 text-purple-600" />}
          bg="bg-gray-600"
          value={stats.avgTutorialsViewed.toFixed(1)}
          label="Avg Tutorials"
        />
        <StatCard
          icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
          bg="bg-gray-600"
          value={`${dropOff.bounceRate}%`}
          label="Bounce Rate"
        />
        <StatCard
          icon={<LogOut className="w-8 h-8 text-orange-600" />}
          bg="bg-gray-600"
          value={dropOff.totalAbandoned.toLocaleString()}
          label="Abandoned"
        />
      </div>

      {/* Session Duration + Drop-off Tutorials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            <Timer className="w-4 h-4 inline mr-1" />
            Session Duration (Abandoned)
          </h3>
          <div className="space-y-2">
            {dropOff.durationBuckets.map((b) => {
              const pct = (b.count / maxDuration) * 100;
              return (
                <div key={b.bucket} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-20 shrink-0">
                    {b.bucket}
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-red-400 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-500">
                      {b.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            <LogOut className="w-4 h-4 inline mr-1" />
            Last Tutorial Before Leaving
          </h3>
          {dropOff.lastTutorials.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {dropOff.lastTutorials.map((t, i) => (
                <div
                  key={t.slug}
                  className="flex items-center justify-between px-3 py-2 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400 w-5">
                      {i + 1}.
                    </span>
                    <span className="text-sm text-gray-300 truncate max-w-60">
                      {t.slug}
                    </span>
                  </div>
                  <span className="text-sm text-red-400 font-medium">
                    {t.count} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Landing Page Performance */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          <MapPin className="w-4 h-4 inline mr-1" />
          Landing Page Performance (Abandoned Users)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Landing Page
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Visits
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Avg Time
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Avg Pages
                </th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Bounce Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {dropOff.landingPages.map((lp) => (
                <tr
                  key={lp.page}
                  className="border-b border-gray-100 hover:bg-gray-700"
                >
                  <td className="py-2 px-3 text-sm text-gray-300 truncate max-w-60">
                    {lp.page}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-400">
                    {lp.visits}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-400">
                    {formatTime(lp.avgTime)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-400">
                    {lp.avgPages}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-sm font-medium ${
                        lp.bounceRate > 60
                          ? "text-red-400"
                          : lp.bounceRate > 30
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                    >
                      {lp.bounceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {/* Recent Sessions Table with expandable rows */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          Recent Visitors (click row to expand)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="py-2 px-3 text-xs font-medium text-gray-500 uppercase w-6" />
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
                const isExpanded = expandedRow === s.id;
                return (
                  <Fragment key={s.id}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                      className="border-b border-gray-100 hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="py-2 px-3 text-gray-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </td>
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
                      <td className="py-2 px-3 text-sm text-gray-400">
                        {tutorials.length}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {formatTime(s.totalTimeSpent)}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-300">
                        {[s.device, s.browser].filter(Boolean).join(" / ") ||
                          "—"}
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
                    {isExpanded && (
                      <tr key={`${s.id}-detail`}>
                        <td colSpan={8} className="px-6 py-4 bg-gray-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-300 text-xs uppercase tracking-wide">
                                Session Info
                              </h4>
                              <div className="space-y-1 text-gray-400">
                                <p>
                                  <span className="text-gray-500">
                                    Landing:
                                  </span>{" "}
                                  {s.landingPage || "—"}
                                </p>
                                <p>
                                  <span className="text-gray-500">Source:</span>{" "}
                                  {[s.source, s.medium]
                                    .filter(Boolean)
                                    .join(" / ") || "Direct"}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    Referrer:
                                  </span>{" "}
                                  {s.referrer || "—"}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    Location:
                                  </span>{" "}
                                  {[s.country, s.region]
                                    .filter(Boolean)
                                    .join(", ") || "—"}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    Platform:
                                  </span>{" "}
                                  {[s.device, s.browser, s.os]
                                    .filter(Boolean)
                                    .join(" / ") || "—"}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    First seen:
                                  </span>{" "}
                                  {formatDate(s.createdAt)}
                                </p>
                                {s.convertedAt && (
                                  <p>
                                    <span className="text-gray-500">
                                      Converted:
                                    </span>{" "}
                                    {formatDate(s.convertedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-300 text-xs uppercase tracking-wide">
                                Tutorial Journey
                                {tutorials.length === 0 && (
                                  <span className="ml-2 text-gray-500 font-normal normal-case">
                                    (no tutorials viewed)
                                  </span>
                                )}
                              </h4>
                              {tutorials.length > 0 && (
                                <div className="space-y-1">
                                  {tutorials.map((t, idx) => (
                                    <div
                                      key={t.tutorialId}
                                      className="flex items-center gap-2 text-gray-400"
                                    >
                                      <span className="text-gray-600 text-xs w-4">
                                        {idx + 1}.
                                      </span>
                                      <span className="truncate max-w-48">
                                        {t.slug || t.tutorialId}
                                      </span>
                                      <span className="text-xs text-gray-600 ml-auto shrink-0">
                                        {formatTime(t.timeSpent)}
                                        {t.startedAt && (
                                          <>
                                            {" "}
                                            &middot; {formatDate(t.startedAt)}
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
