"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Video,
  FileCode,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Calendar,
} from "lucide-react";
import {
  MentorshipSessionType,
  MentorshipSessionStatus,
} from "@/lib/subscriptionConstants";

interface MentorshipSession {
  id: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  codeLink: string | null;
  description: string;
  feedback: string | null;
  completedAt: string | null;
  calendlyEventUri: string | null;
  createdAt: string;
}

interface SessionsResponse {
  sessions: MentorshipSession[];
  total: number;
  canBook: boolean;
  remaining: number;
  limit: number;
}

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  },
  SCHEDULED: {
    label: "Scheduled",
    icon: Calendar,
    className:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    className:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
  },
  NO_SHOW: {
    label: "No Show",
    icon: AlertCircle,
    className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function UsageBar({ remaining, limit }: { remaining: number; limit: number }) {
  const used = limit - remaining;
  const percentage = limit > 0 ? (used / limit) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Sessions This Month
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {used} of {limit} used
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {remaining === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          All sessions used. Resets on the 1st of next month.
        </p>
      )}
    </div>
  );
}

function AsyncBookingForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: { codeLink: string; description: string }) => void;
  isSubmitting: boolean;
}) {
  const [codeLink, setCodeLink] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit({ codeLink, description: description.trim() });
    setCodeLink("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="codeLink"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Code Link{" "}
          <span className="text-gray-400 dark:text-gray-500">(optional)</span>
        </label>
        <input
          id="codeLink"
          type="url"
          value={codeLink}
          onChange={(e) => setCodeLink(e.target.value)}
          placeholder="https://github.com/your-repo"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          What do you want reviewed?
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you'd like feedback on — specific files, patterns, architecture decisions, etc."
          rows={4}
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !description.trim()}
        className="min-w-32 inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit for Review
          </>
        )}
      </button>
    </form>
  );
}

function SessionCard({ session }: { session: MentorshipSession }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/mentorship/sessions/${session.id}`, {
        method: "DELETE",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to cancel");
        return r.json();
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["mentorship-sessions"] }),
  });

  const canCancel =
    session.status === MentorshipSessionStatus.PENDING ||
    session.status === MentorshipSessionStatus.SCHEDULED;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session.type === MentorshipSessionType.LIVE ? (
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <FileCode className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {session.type === MentorshipSessionType.LIVE
                  ? "Live Code Review"
                  : "Async Code Review"}
              </span>
              <StatusBadge status={session.status} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(session.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {session.description}
          </p>
          {session.codeLink && (
            <a
              href={session.codeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View Code
            </a>
          )}
          {session.feedback && (
            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                Feedback
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {session.feedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MentorshipHub({ calendlyUrl }: { calendlyUrl?: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"live" | "async">("async");

  const { data, isLoading } = useQuery<SessionsResponse>({
    queryKey: ["mentorship-sessions"],
    queryFn: () =>
      fetch("/api/mentorship/sessions").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      }),
    enabled: !!session?.user,
    staleTime: 60_000,
  });

  const bookMutation = useMutation({
    mutationFn: (body: {
      type: string;
      codeLink?: string;
      description: string;
    }) =>
      fetch("/api/mentorship/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok)
          return r.json().then((d) => Promise.reject(new Error(d.error)));
        return r.json();
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["mentorship-sessions"] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  const canBook = data?.canBook ?? false;
  const remaining = data?.remaining ?? 0;
  const limit = data?.limit ?? 4;
  const sessions = data?.sessions ?? [];

  return (
    <div className="space-y-6">
      {/* Usage bar */}
      <UsageBar remaining={remaining} limit={limit} />

      {/* Booking section */}
      {canBook && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Tab buttons */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("live")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "live"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Video className="h-4 w-4" />
              Live Code Review
            </button>
            <button
              onClick={() => setActiveTab("async")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "async"
                  ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-500 bg-violet-50/50 dark:bg-violet-900/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <FileCode className="h-4 w-4" />
              Async Code Review
            </button>
          </div>

          <div className="p-6">
            {activeTab === "live" ? (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Schedule a live 1-on-1 code review session. Pick a time that
                  works for you.
                </p>
                {calendlyUrl ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <iframe
                      src={`${calendlyUrl}?hide_gdpr_banner=1&background_color=0f172a&text_color=e2e8f0&primary_color=7c3aed`}
                      width="100%"
                      height="630"
                      frameBorder="0"
                      title="Schedule a code review"
                      className="dark:bg-gray-900"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">
                      Live booking is being set up. Use async review for now.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Submit your code for a written review. You'll get detailed
                  feedback within 48 hours.
                </p>
                <AsyncBookingForm
                  onSubmit={(data) =>
                    bookMutation.mutate({
                      type: MentorshipSessionType.ASYNC,
                      ...data,
                    })
                  }
                  isSubmitting={bookMutation.isPending}
                />
                {bookMutation.isError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {bookMutation.error?.message || "Failed to submit"}
                  </p>
                )}
                {bookMutation.isSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Session submitted! You'll hear back soon.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session history */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Your Sessions
        </h3>
        {sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <FileCode className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No sessions yet. Book your first code review above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
