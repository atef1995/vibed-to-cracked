"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Send,
  SkipForward,
  StopCircle,
  Loader,
  Code,
  MessageSquare,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import { SessionState, InterviewStatus } from "@/lib/interviewConstants";
import VoiceInput from "@/components/mock-interview/VoiceInput";

const InterviewAvatar = dynamic(
  () => import("@/components/mock-interview/InterviewAvatar"),
  { ssr: false }
);
const InterviewCodeEditor = dynamic(
  () => import("@/components/mock-interview/InterviewCodeEditor"),
  { ssr: false }
);

interface Round {
  id: string;
  questionText: string;
  order: number;
  responseText?: string | null;
  responseCode?: string | null;
  score?: number | null;
  question?: {
    type: string;
    starterCode?: string | null;
    evaluationCriteria?: Record<string, string>;
  };
}

interface InterviewData {
  id: string;
  status: string;
  interviewType: string;
  isPreview: boolean;
  company: {
    slug: string;
    name: string;
    interviewStyle: string;
    color: string;
  };
  rounds: Round[];
}

async function generateSpeech(
  interviewId: string,
  type: "intro" | "question" | "closing",
  extra?: { questionText?: string; questionType?: string; starterCode?: string | null }
): Promise<string> {
  try {
    const res = await fetch(`/api/mock-interview/${interviewId}/speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...extra }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.data?.speech || "";
  } catch {
    return "";
  }
}

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [sessionState, setSessionState] = useState<string>(SessionState.INTRO);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responseCode, setResponseCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [aiSpeech, setAiSpeech] = useState("");
  const [previewTimer, setPreviewTimer] = useState<number | null>(null);
  const [avatarReady, setAvatarReady] = useState(false);
  const [introLoading, setIntroLoading] = useState(false);
  const [beginning, setBeginning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const firstRoundRef = useRef<Round | null>(null);
  const hasResumed = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStateRef = useRef<string>(SessionState.INTRO);

  // Fetch interview data
  useEffect(() => {
    async function fetchInterview() {
      try {
        const res = await fetch(`/api/mock-interview/${id}/results`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setInterview(data.interview);

        if (data.interview.status === InterviewStatus.COMPLETED) {
          router.replace(`/mock-interview/session/${id}/results`);
          return;
        }

        // Find first unanswered round
        const pending = data.interview.rounds.find(
          (r: Round) => !r.responseText && !r.responseCode
        );
        if (pending) {
          firstRoundRef.current = pending;

          // If some rounds were already answered, this is a resume — skip intro
          const answeredCount = data.interview.rounds.filter(
            (r: Round) => r.responseText || r.responseCode
          ).length;
          if (answeredCount > 0) {
            hasResumed.current = true;
            setCurrentRound(pending);
            setSessionState(SessionState.QUESTION);
            if (pending.question?.type === "TECHNICAL") {
              setIsCodeMode(true);
              setResponseCode(pending.question?.starterCode || "");
            }
          }
          // Otherwise stay in INTRO — the avatar welcome will play
        } else {
          // All rounds answered but interview not yet completed — go straight to closing
          setSessionState(SessionState.CLOSING);
        }

        if (data.interview.isPreview) {
          setPreviewTimer(30);
        }
      } catch {
        router.replace("/mock-interview");
      } finally {
        setLoading(false);
      }
    }
    fetchInterview();
  }, [id, router]);

  // Generate intro speech once both avatar and interview data are ready
  useEffect(() => {
    if (
      !avatarReady ||
      !interview ||
      sessionState !== SessionState.INTRO ||
      hasResumed.current
    )
      return;

    let cancelled = false;
    setIntroLoading(true);

    generateSpeech(id, "intro").then((speech) => {
      if (cancelled) return;
      setAiSpeech(speech);
      setIntroLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [avatarReady, interview, sessionState, id]);

  // Fallback: if avatar never connects, let the user proceed after 15 seconds
  useEffect(() => {
    if (avatarReady || loading) return;
    const timer = setTimeout(() => {
      setAvatarReady(true);
    }, 15_000);
    return () => clearTimeout(timer);
  }, [avatarReady, loading]);

  // Clean up dangling transition timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Begin the interview — transition from INTRO to first question
  const beginInterview = useCallback(async () => {
    if (beginning) return;
    const round = firstRoundRef.current;
    if (!round) return;

    setBeginning(true);
    setCurrentRound(round);
    if (round.question?.type === "TECHNICAL") {
      setIsCodeMode(true);
      setResponseCode(round.question?.starterCode || "");
    }

    // Clear speech first so avatar dedup ref resets
    setAiSpeech("");

    // Generate question delivery speech for the first question
    const questionSpeech = await generateSpeech(id, "question", {
      questionText: round.questionText,
      questionType: round.question?.type,
      starterCode: round.question?.starterCode,
    });

    setAiSpeech(questionSpeech);
    setSessionState(SessionState.QUESTION);
    setBeginning(false);
  }, [id, beginning]);

  // Preview countdown — paused during INTRO so timer doesn't expire before interview begins
  useEffect(() => {
    if (previewTimer === null || previewTimer <= 0) return;
    if (sessionState === SessionState.INTRO) return;
    const timer = setTimeout(() => {
      setPreviewTimer((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [previewTimer, sessionState]);

  useEffect(() => {
    if (previewTimer === 0) {
      setSessionState(SessionState.CLOSING);
    }
  }, [previewTimer]);

  const submitResponse = useCallback(async () => {
    if (!currentRound || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/mock-interview/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: currentRound.id,
          responseText: isCodeMode ? undefined : responseText,
          responseCode: isCodeMode ? responseCode : undefined,
          responseType: isCodeMode ? "CODE" : "TEXT",
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      const data = await res.json();

      if (data.nextRound) {
        // Clear speech so avatar dedup ref resets for next question
        setAiSpeech("");

        // Show transition speech while we generate the next question delivery
        if (data.transitionSpeech) {
          setAiSpeech(data.transitionSpeech);
          setSessionState(SessionState.TRANSITION);
        }

        // After a short pause for the transition, deliver the next question
        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = setTimeout(async () => {
          const nextRound = data.nextRound;
          setCurrentRound(nextRound);
          setResponseText("");
          setResponseCode(nextRound.question?.starterCode || "");
          setIsCodeMode(nextRound.question?.type === "TECHNICAL");

          setAiSpeech("");
          const questionSpeech = await generateSpeech(id, "question", {
            questionText: nextRound.questionText,
            questionType: nextRound.question?.type,
            starterCode: nextRound.question?.starterCode,
          });

          setAiSpeech(questionSpeech);
          setSessionState(SessionState.QUESTION);
        }, 3000);
      } else if (data.isComplete) {
        // Generate closing speech before showing results
        setAiSpeech("");
        setSessionState(SessionState.TRANSITION);
        const closingSpeech = await generateSpeech(id, "closing");
        setAiSpeech(closingSpeech);

        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = setTimeout(() => {
          setSessionState(SessionState.CLOSING);
        }, 4000);
      }
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitError("Failed to submit your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [currentRound, id, isCodeMode, responseCode, responseText, submitting]);

  const completeInterview = useCallback(async () => {
    setCompleting(true);
    prevStateRef.current = sessionState;
    setSessionState(SessionState.SCORING);
    try {
      const res = await fetch(`/api/mock-interview/${id}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to complete");
      router.push(`/mock-interview/session/${id}/results`);
    } catch (err) {
      console.error("Complete failed:", err);
      // Revert to previous state so user can retry
      setSessionState(prevStateRef.current);
      setCompleting(false);
    }
  }, [id, router, sessionState]);

  // "End Interview" from the question area — generate closing speech first
  const endInterviewEarly = useCallback(async () => {
    setAiSpeech("");
    setSessionState(SessionState.TRANSITION);
    const closingSpeech = await generateSpeech(id, "closing");
    setAiSpeech(closingSpeech);

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setSessionState(SessionState.CLOSING);
    }, 4000);
  }, [id]);

  const handleAvatarReady = useCallback(() => {
    setAvatarReady(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!interview || !session?.user) {
    return null;
  }

  const totalRounds = interview.rounds.length;
  const answeredRounds = interview.rounds.filter(
    (r) => r.responseText || r.responseCode
  ).length;
  const progressPercent =
    totalRounds > 0 ? (answeredRounds / totalRounds) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: interview.company.color }}
            >
              {interview.company.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {interview.company.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {interview.interviewType} Interview
                {interview.isPreview && " (Preview)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {previewTimer !== null && (
              <span className="text-sm font-mono text-orange-600 dark:text-orange-400">
                {previewTimer}s
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {answeredRounds}/{totalRounds}
            </span>
            <button
              onClick={completeInterview}
              disabled={completing}
              className="text-sm px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <StopCircle className="h-4 w-4 inline mr-1" />
              End
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-5xl mx-auto mt-2">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Avatar + AI Speech */}
        <div className="mb-6">
          <InterviewAvatar
            companySlug={interview.company.slug}
            companyName={interview.company.name}
            companyColor={interview.company.color}
            interviewType={interview.interviewType}
            speechText={aiSpeech || undefined}
            onReady={handleAvatarReady}
          />
        </div>

        {/* Intro State — Avatar welcomes the candidate */}
        {sessionState === SessionState.INTRO && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {introLoading || !avatarReady ? (
              <>
                <Loader className="h-8 w-8 animate-spin text-violet-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Your interviewer is getting ready...
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg">
                  {interview.company.name} is ready to begin your{" "}
                  {interview.interviewType.toLowerCase()} interview.{" "}
                  {totalRounds} questions ahead. Take a breath and click below
                  when you are ready.
                </p>
                <button
                  onClick={beginInterview}
                  disabled={beginning}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors text-lg disabled:opacity-50"
                >
                  {beginning ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <PlayCircle className="h-5 w-5" />
                  )}
                  {beginning ? "Starting..." : "I'm Ready"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Transition State — Avatar speaks between questions */}
        {sessionState === SessionState.TRANSITION && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="h-6 w-6 animate-spin text-violet-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Moving to the next question...
            </p>
          </div>
        )}

        {/* Scoring State */}
        {sessionState === SessionState.SCORING && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="h-10 w-10 animate-spin text-violet-500 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Evaluating your interview...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Our AI is reviewing your responses
            </p>
          </div>
        )}

        {/* Preview ended */}
        {sessionState === SessionState.CLOSING && interview.isPreview && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Preview Complete
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Get interview credits to unlock full interviews with scoring,
              feedback, and company-specific evaluation.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/mock-interview/credits")}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
              >
                Get Credits
              </button>
              <button
                onClick={() => router.push("/mock-interview")}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Back to Companies
              </button>
            </div>
          </div>
        )}

        {/* Closing for non-preview */}
        {sessionState === SessionState.CLOSING && !interview.isPreview && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Interview Complete
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              All questions answered. Ready to see your results?
            </p>
            <button
              onClick={completeInterview}
              disabled={completing}
              className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {completing ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              See Results
            </button>
          </div>
        )}

        {/* Question & Response Area */}
        {(sessionState === SessionState.QUESTION ||
          sessionState === SessionState.RESPONDING) &&
          currentRound && (
            <div className="space-y-6">
              {/* Question */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                    Question {currentRound.order}
                  </span>
                  {currentRound.question?.type && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {currentRound.question.type}
                    </span>
                  )}
                </div>
                <p className="text-gray-900 dark:text-white text-lg leading-relaxed">
                  {currentRound.questionText}
                </p>
              </div>

              {/* Response Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCodeMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    !isCodeMode
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Text
                </button>
                <button
                  onClick={() => setIsCodeMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isCodeMode
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Code className="h-4 w-4" />
                  Code
                </button>
              </div>

              {/* Response Input */}
              {isCodeMode ? (
                <InterviewCodeEditor
                  code={responseCode}
                  onChange={setResponseCode}
                  starterCode={currentRound.question?.starterCode || undefined}
                />
              ) : (
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  placeholder="Type your answer..."
                />
              )}

              {/* Submit */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={endInterviewEarly}
                    disabled={submitting}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 disabled:opacity-50"
                  >
                    <SkipForward className="h-4 w-4" />
                    End Interview
                  </button>
                  {!isCodeMode && (
                    <VoiceInput
                      onTranscript={(text) =>
                        setResponseText((prev) =>
                          prev ? prev + " " + text : text
                        )
                      }
                      disabled={submitting}
                    />
                  )}
                </div>
                <button
                  onClick={submitResponse}
                  disabled={
                    submitting || (!responseText.trim() && !responseCode.trim())
                  }
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Answer
                </button>
              </div>

              {/* Submit error feedback */}
              {submitError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
