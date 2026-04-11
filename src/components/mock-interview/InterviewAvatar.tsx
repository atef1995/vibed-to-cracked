"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader, VideoOff, Volume2, VolumeOff } from "lucide-react";
import {
  LiveAvatarSession,
  SessionState,
  SessionEvent,
} from "@heygen/liveavatar-web-sdk";

interface InterviewAvatarProps {
  companySlug: string;
  companyName: string;
  companyColor: string;
  interviewType?: string;
  speechText?: string;
  onReady?: () => void;
}

export default function InterviewAvatar({
  companySlug,
  companyName,
  companyColor,
  interviewType,
  speechText,
  onReady,
}: InterviewAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const lastSpeechRef = useRef<string>("");
  const pendingSpeechRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get session token from our backend
      const res = await fetch("/api/mock-interview/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewType }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          setError("unavailable");
          setLoading(false);
          return;
        }
        throw new Error("Failed to create avatar session");
      }

      const { data } = await res.json();
      const { sessionId, sessionToken } = data;

      if (!sessionToken) {
        setError("unavailable");
        setLoading(false);
        return;
      }

      sessionIdRef.current = sessionId;

      // Create LiveAvatar session using the SDK
      const session = new LiveAvatarSession(sessionToken, {
        voiceChat: false,
      });
      sessionRef.current = session;

      // Listen for stream ready
      session.on(SessionEvent.SESSION_STREAM_READY, () => {
        if (videoRef.current) {
          session.attach(videoRef.current);
        }
        setConnected(true);
        setLoading(false);
        onReady?.();

        // Send any pending speech that arrived before stream was ready
        if (pendingSpeechRef.current) {
          try {
            session.repeat(pendingSpeechRef.current);
            lastSpeechRef.current = pendingSpeechRef.current;
          } catch (err) {
            console.error("Avatar speak failed:", err);
          }
          pendingSpeechRef.current = null;
        }
      });

      // Listen for state changes
      session.on(SessionEvent.SESSION_STATE_CHANGED, (state: SessionState) => {
        if (state === SessionState.DISCONNECTED) {
          setConnected(false);
          setError("disconnected");
        }
      });

      // Start the session
      await session.start();
    } catch (err) {
      console.error("Avatar init failed:", err);
      setError("unavailable");
      setLoading(false);
    }
  }, [interviewType, onReady]);

  // Clear dedup ref when speech resets so same text can be re-sent next round
  useEffect(() => {
    if (!speechText) {
      lastSpeechRef.current = "";
    }
  }, [speechText]);

  // Send speech text to avatar via SDK repeat() method
  useEffect(() => {
    if (!speechText || speechText === lastSpeechRef.current) return;

    // If not connected yet, queue it for when stream is ready
    if (!sessionRef.current || !connected) {
      pendingSpeechRef.current = speechText;
      return;
    }

    try {
      sessionRef.current.repeat(speechText);
      lastSpeechRef.current = speechText;
      pendingSpeechRef.current = null;
    } catch (err) {
      console.error("Avatar speak failed:", err);
    }
  }, [speechText, connected]);

  // Init on mount
  useEffect(() => {
    initSession();
    return () => {
      // Clean up: stop SDK session and notify backend
      sessionRef.current?.stop().catch(() => {});
      if (sessionIdRef.current) {
        fetch("/api/mock-interview/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "stop",
            sessionId: sessionIdRef.current,
          }),
        }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback: text-based avatar with company branding
  if (error) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 flex flex-col items-center justify-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
          style={{ backgroundColor: companyColor }}
        >
          {companyName.charAt(0)}
        </div>
        <p className="text-white font-medium">{companyName} Interviewer</p>
        {speechText && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3">
            <p className="text-white text-sm text-center leading-relaxed">
              {speechText}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900">
          <Loader className="h-8 w-8 animate-spin text-violet-400 mb-3" />
          <p className="text-sm text-gray-400">Connecting avatar...</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover ${connected ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
      />
      {connected && (
        <button
          onClick={() => setMuted(!muted)}
          className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          {muted ? (
            <VolumeOff className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      )}
      {/* Subtitle overlay for speech */}
      {speechText && connected && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3">
          <p className="text-white text-sm text-center leading-relaxed">
            {speechText}
          </p>
        </div>
      )}
    </div>
  );
}
