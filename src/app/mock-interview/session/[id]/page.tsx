"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Loader,
  Code,
  MessageSquare,
  ChevronRight,
  PlayCircle,
  Mic,
} from "lucide-react";
import { SessionState, InterviewStatus } from "@/lib/interviewConstants";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import VideoCallToolbar from "@/components/mock-interview/VideoCallToolbar";

const InterviewAvatarSwitch = dynamic(
  () => import("@/components/mock-interview/InterviewAvatarSwitch"),
  { ssr: false }
);
const InterviewCodeEditor = dynamic(
  () => import("@/components/mock-interview/InterviewCodeEditor"),
  { ssr: false }
);
const WebcamPreview = dynamic(
  () => import("@/components/mock-interview/WebcamPreview"),
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
  extra?: {
    questionText?: string;
    questionType?: string;
    starterCode?: string | null;
  }
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
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [avatarMuted, setAvatarMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const submitResponseRef = useRef<(() => Promise<void>) | null>(null);
  const isQuestionPhaseRef = useRef(false);

  const speech = useSpeechRecognition({
    silenceDelay: 2000,
    countdownSeconds: 3,
    onAutoSubmit: useCallback(() => {
      submitResponseRef.current?.();
    }, []),
    paused: isSpeaking || submitting,
  });

  const firstRoundRef = useRef<Round | null>(null);
  const hasResumed = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStateRef = useRef<string>(SessionState.INTRO);

  // Sync voice transcript into the response text field
  useEffect(() => {
    if (speech.transcript && !isCodeMode) {
      setResponseText(speech.transcript);
    }
  }, [speech.transcript, isCodeMode]);

  // Start/stop speech recognition when mic toggles
  useEffect(() => {
    if (micOn && isQuestionPhaseRef.current) {
      speech.start();
    } else {
      speech.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micOn]);

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
        if (transitionTimerRef.current)
          clearTimeout(transitionTimerRef.current);
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

        if (transitionTimerRef.current)
          clearTimeout(transitionTimerRef.current);
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

  // Keep refs in sync for use in callbacks
  submitResponseRef.current = submitResponse;

  const isQuestionPhase =
    sessionState === SessionState.QUESTION ||
    sessionState === SessionState.RESPONDING;
  isQuestionPhaseRef.current = isQuestionPhase;

  // Clear voice transcript on question transitions and after submit
  useEffect(() => {
    speech.clearTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound?.id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
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
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Thin top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ backgroundColor: interview.company.color }}
          >
            {interview.company.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-white text-sm leading-tight">
              {interview.company.name}
            </p>
            <p className="text-xs text-gray-400">
              {interview.interviewType} Interview
              {interview.isPreview && " (Preview)"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {previewTimer !== null && sessionState !== SessionState.INTRO && (
            <span className="text-sm font-mono text-orange-400">
              {previewTimer}s
            </span>
          )}
          <span className="text-sm text-gray-400">
            {answeredRounds}/{totalRounds}
          </span>
          {/* Progress bar */}
          <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Video area */}
        <div
          className={`relative flex-1 flex items-center justify-center bg-gray-950 ${
            isQuestionPhase ? "lg:w-3/5" : "w-full"
          } transition-all duration-300`}
        >
          {/* Avatar fills the video area */}
          <div className="w-full h-full">
            <InterviewAvatarSwitch
              companySlug={interview.company.slug}
              companyName={interview.company.name}
              companyColor={interview.company.color}
              interviewType={interview.interviewType}
              speechText={aiSpeech || undefined}
              onReady={handleAvatarReady}
              onSpeakingChange={setIsSpeaking}
              muted={avatarMuted}
              interviewId={id}
            />
          </div>

          {/* Captions overlay — shown when avatar is speaking */}
          {aiSpeech && isSpeaking && (
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
              <div className="max-w-2xl mx-auto bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2.5">
                <p className="text-white text-sm text-center leading-relaxed">
                  {aiSpeech}
                </p>
              </div>
            </div>
          )}

          {/* Webcam PiP */}
          <div className="absolute bottom-4 right-4 z-10">
            <WebcamPreview
              enabled={cameraOn}
              onToggle={() => setCameraOn(!cameraOn)}
            />
          </div>

          {/* Center overlays for non-question states */}
          {sessionState === SessionState.INTRO && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
              <div className="text-center max-w-md px-6">
                {introLoading || !avatarReady ? (
                  <>
                    <Loader className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-4" />
                    <p className="text-gray-300">
                      Your interviewer is getting ready...
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-300 mb-6">
                      {interview.company.name} is ready to begin your{" "}
                      {interview.interviewType.toLowerCase()} interview.{" "}
                      {totalRounds} questions ahead.
                    </p>
                    <button
                      onClick={beginInterview}
                      disabled={beginning}
                      className="flex items-center gap-2 px-8 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors text-lg disabled:opacity-50 mx-auto"
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
            </div>
          )}

          {sessionState === SessionState.TRANSITION && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-black/50 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                <Loader className="h-5 w-5 animate-spin text-violet-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Next question...</p>
              </div>
            </div>
          )}

          {sessionState === SessionState.SCORING && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <div className="text-center">
                <Loader className="h-10 w-10 animate-spin text-violet-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-white">
                  Evaluating your interview...
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Our AI is reviewing your responses
                </p>
              </div>
            </div>
          )}

          {sessionState === SessionState.CLOSING && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <div className="text-center max-w-md px-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {interview.isPreview
                    ? "Preview Complete"
                    : "Interview Complete"}
                </h2>
                <p className="text-gray-300 mb-6">
                  {interview.isPreview
                    ? "Get interview credits to unlock full interviews with scoring, feedback, and company-specific evaluation."
                    : "All questions answered. Ready to see your results?"}
                </p>
                <div className="flex gap-3 justify-center">
                  {interview.isPreview ? (
                    <>
                      <button
                        onClick={() => router.push("/mock-interview/credits")}
                        className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
                      >
                        Get Credits
                      </button>
                      <button
                        onClick={() => router.push("/mock-interview")}
                        className="px-6 py-3 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-800 font-medium transition-colors"
                      >
                        Back
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={completeInterview}
                      disabled={completing}
                      className="px-8 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {completing ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      See Results
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side panel — question + response during QUESTION phase */}
        {isQuestionPhase && currentRound && (
          <div className="hidden lg:flex flex-col w-2/5 max-w-md border-l border-gray-800 bg-gray-900">
            {/* Question */}
            <div className="p-5 border-b border-gray-800 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300">
                  Question {currentRound.order}
                </span>
                {currentRound.question?.type && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                    {currentRound.question.type}
                  </span>
                )}
              </div>
              <p className="text-white leading-relaxed">
                {currentRound.questionText}
              </p>
            </div>

            {/* Response area */}
            <div className="flex-1 flex flex-col p-5 overflow-y-auto min-h-0">
              {/* Mode toggle */}
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <button
                  onClick={() => setIsCodeMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    !isCodeMode
                      ? "bg-violet-900/40 text-violet-300"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Text
                </button>
                <button
                  onClick={() => setIsCodeMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isCodeMode
                      ? "bg-violet-900/40 text-violet-300"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <Code className="h-4 w-4" />
                  Code
                </button>
              </div>

              {/* Voice status indicator */}
              {micOn && !isCodeMode && (
                <div className="mb-3 shrink-0">
                  {speech.countdown !== null ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-900/30 border border-orange-800/40">
                      <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                      <span className="text-xs text-orange-300">
                        Submitting in {speech.countdown}s — keep talking to
                        cancel
                      </span>
                    </div>
                  ) : speech.hasSpoken ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-900/20 border border-violet-800/30">
                      <Mic className="h-3.5 w-3.5 text-violet-400" />
                      <span className="text-xs text-violet-300">
                        {speech.interim
                          ? "Listening..."
                          : "Waiting for you to continue..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/40">
                      <Mic className="h-3.5 w-3.5 text-gray-400 animate-pulse" />
                      <span className="text-xs text-gray-400">
                        Listening — start speaking when ready
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="flex-1 min-h-0">
                {isCodeMode ? (
                  <div className="h-full">
                    <InterviewCodeEditor
                      code={responseCode}
                      onChange={setResponseCode}
                      starterCode={
                        currentRound.question?.starterCode || undefined
                      }
                    />
                  </div>
                ) : (
                  <div className="relative h-full">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full h-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 placeholder-gray-500 text-sm"
                      placeholder={
                        micOn
                          ? "Speak or type your answer..."
                          : "Type your answer..."
                      }
                    />
                    {/* Interim speech overlay */}
                    {micOn && speech.interim && (
                      <div className="absolute bottom-2 left-3 right-3 pointer-events-none">
                        <p className="text-xs text-gray-500 italic truncate">
                          {speech.interim}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error feedback */}
              <div className="h-5 mt-2 shrink-0">
                {submitError && (
                  <p className="text-xs text-red-400">{submitError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile: bottom sheet for question when in question phase */}
        {isQuestionPhase && currentRound && (
          <div className="lg:hidden fixed inset-x-0 bottom-16 z-30 max-h-[50vh] overflow-y-auto bg-gray-900 border-t border-gray-800 rounded-t-2xl">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300">
                  Q{currentRound.order}
                </span>
                {currentRound.question?.type && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                    {currentRound.question.type}
                  </span>
                )}
              </div>
              <p className="text-white text-sm leading-relaxed mb-3">
                {currentRound.questionText}
              </p>

              {/* Mode toggle */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setIsCodeMode(false)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    !isCodeMode
                      ? "bg-violet-900/40 text-violet-300"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Text
                </button>
                <button
                  onClick={() => setIsCodeMode(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    isCodeMode
                      ? "bg-violet-900/40 text-violet-300"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  Code
                </button>
              </div>

              {/* Voice status (mobile) */}
              {micOn && !isCodeMode && (
                <div className="mb-2">
                  {speech.countdown !== null ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-900/30 border border-orange-800/40">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                      <span className="text-[11px] text-orange-300">
                        Submitting in {speech.countdown}s
                      </span>
                    </div>
                  ) : speech.hasSpoken ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-900/20 border border-violet-800/30">
                      <Mic className="h-3 w-3 text-violet-400" />
                      <span className="text-[11px] text-violet-300">
                        {speech.interim ? "Listening..." : "Waiting..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40">
                      <Mic className="h-3 w-3 text-gray-400 animate-pulse" />
                      <span className="text-[11px] text-gray-400">
                        Listening...
                      </span>
                    </div>
                  )}
                </div>
              )}

              {isCodeMode ? (
                <div className="h-40">
                  <InterviewCodeEditor
                    code={responseCode}
                    onChange={setResponseCode}
                    starterCode={
                      currentRound.question?.starterCode || undefined
                    }
                  />
                </div>
              ) : (
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 placeholder-gray-500 text-sm"
                  placeholder={
                    micOn ? "Speak or type..." : "Type your answer..."
                  }
                />
              )}
              {submitError && (
                <p className="text-xs text-red-400 mt-1">{submitError}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="shrink-0">
        <VideoCallToolbar
          isMicOn={micOn}
          onToggleMic={() => setMicOn(!micOn)}
          isCameraOn={cameraOn}
          onToggleCamera={() => setCameraOn(!cameraOn)}
          onEndCall={
            sessionState === SessionState.CLOSING
              ? completeInterview
              : endInterviewEarly
          }
          onSubmit={submitResponse}
          onSkip={endInterviewEarly}
          submitDisabled={
            submitting || (!responseText.trim() && !responseCode.trim())
          }
          submitting={submitting}
          ending={completing}
          showSubmit={isQuestionPhase}
        />
      </div>
    </div>
  );
}
