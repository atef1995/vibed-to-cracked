"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Video,
  FileCode,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  User,
} from "lucide-react";
import { MentorshipSessionStatus } from "@/lib/subscriptionConstants";

interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface MentorshipSession {
  id: string;
  userId: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  codeLink: string | null;
  description: string;
  feedback: string | null;
  completedAt: string | null;
  createdAt: string;
  user: SessionUser;
}

interface AdminSessionsResponse {
  sessions: MentorshipSession[];
  total: number;
  page: number;
  pageSize: number;
}

const filterOptions = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function AdminSessionCard({ session }: { session: MentorshipSession }) {
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (body: { status: string; feedback?: string }) =>
      fetch(`/api/mentorship/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to update");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-mentorship"] });
      setShowFeedback(false);
      setFeedbackText("");
    },
  });

  const isPending =
    session.status === MentorshipSessionStatus.PENDING ||
    session.status === MentorshipSessionStatus.SCHEDULED;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(session.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              session.type === "LIVE"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
            }`}
          >
            {session.type === "LIVE" ? (
              <Video className="h-3 w-3" />
            ) : (
              <FileCode className="h-3 w-3" />
            )}
            {session.type === "LIVE" ? "Live" : "Async"}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              session.status === MentorshipSessionStatus.COMPLETED
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : session.status === MentorshipSessionStatus.CANCELLED
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {session.status === MentorshipSessionStatus.COMPLETED ? (
              <CheckCircle className="h-3 w-3" />
            ) : session.status === MentorshipSessionStatus.CANCELLED ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {session.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {session.description}
      </p>

      {session.codeLink && (
        <a
          href={session.codeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:underline mb-3"
        >
          <ExternalLink className="h-3 w-3" />
          View Code
        </a>
      )}

      {/* Existing feedback */}
      {session.feedback && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-3">
          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
            Feedback
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {session.feedback}
          </p>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          {!showFeedback ? (
            <>
              <button
                onClick={() => setShowFeedback(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <CheckCircle className="h-3 w-3" />
                Mark Complete
              </button>
              <button
                onClick={() =>
                  updateMutation.mutate({
                    status: MentorshipSessionStatus.CANCELLED,
                  })
                }
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium rounded-lg transition-colors"
              >
                <XCircle className="h-3 w-3" />
                Cancel
              </button>
            </>
          ) : (
            <div className="w-full space-y-2">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write your feedback here..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      status: MentorshipSessionStatus.COMPLETED,
                      feedback: feedbackText || undefined,
                    })
                  }
                  disabled={updateMutation.isPending}
                  className="min-w-24 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Save & Complete"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedbackText("");
                  }}
                  className="px-3 py-1.5 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MentorshipDashboard() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<AdminSessionsResponse>({
    queryKey: ["admin-mentorship", statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      return fetch(`/api/mentorship/admin?${params}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      });
    },
    staleTime: 30_000,
  });

  const sessions = data?.sessions ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 20;
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Mentorship Sessions ({total})
        </h2>
        <div className="flex items-center gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === opt.value
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm">No sessions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <AdminSessionCard key={s.id} session={s} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
