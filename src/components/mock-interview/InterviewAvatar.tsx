"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader, Volume2, VolumeOff } from "lucide-react";
import {
  LiveAvatarSession,
  SessionState,
  SessionEvent,
} from "@heygen/liveavatar-web-sdk";

type AvatarProvider = "heygen" | "decart";

interface InterviewAvatarProps {
  companySlug: string;
  companyName: string;
  companyColor: string;
  speechText?: string;
  welcomeMessage?: string;
  onReady?: () => void;
}

export default function InterviewAvatar({
  companySlug,
  companyName,
  companyColor,
  speechText,
  welcomeMessage,
  onReady,
}: InterviewAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [provider, setProvider] = useState<AvatarProvider>("heygen");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const lastSpeechRef = useRef<string>("");
  const sessionIdRef = useRef<string | null>(null);
  const providerRef = useRef<AvatarProvider>("heygen");

  const speakViaDecart = useCallback(async (text: string) => {
    if (!sessionIdRef.current) return;
    try {
      await fetch("/api/mock-interview/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "speak",
          sessionId: sessionIdRef.current,
          text,
        }),
      });
    } catch (err) {
      console.error("Decart speak failed:", err);
    }
  }, []);

  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/mock-interview/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companySlug }),
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
      const { sessionId, provider: sessionProvider } = data;
      sessionIdRef.current = sessionId;
      providerRef.current = sessionProvider;
      setProvider(sessionProvider);

      if (sessionProvider === "decart") {
        // Decart: render via iframe using the returned stream URL
        setStreamUrl(data.streamUrl);
        setConnected(true);
        setLoading(false);
        onReady?.();
        if (welcomeMessage) {
          await speakViaDecart(welcomeMessage);
        }
        return;
      }

      // HeyGen: use the LiveAvatar SDK
      const { sessionToken } = data;
      if (!sessionToken) {
        setError("unavailable");
        setLoading(false);
        return;
      }

      const session = new LiveAvatarSession(sessionToken, {
        voiceChat: false,
      });
      sessionRef.current = session;

      session.on(SessionEvent.SESSION_STREAM_READY, () => {
        if (videoRef.current) {
          session.attach(videoRef.current);
        }
        setConnected(true);
        setLoading(false);
        onReady?.();
        if (welcomeMessage) {
          try {
            session.repeat(welcomeMessage);
          } catch (err) {
            console.error("Welcome message failed:", err);
          }
        }
      });

      session.on(SessionEvent.SESSION_STATE_CHANGED, (state: SessionState) => {
        if (state === SessionState.DISCONNECTED) {
          setConnected(false);
          setError("disconnected");
        }
      });

      await session.start();
    } catch (err) {
      console.error("Avatar init failed:", err);
      setError("unavailable");
      setLoading(false);
    }
  }, [companySlug, onReady, welcomeMessage, speakViaDecart]);

  // Send speech text to avatar
  useEffect(() => {
    if (!speechText || speechText === lastSpeechRef.current || !connected)
      return;
    lastSpeechRef.current = speechText;

    if (providerRef.current === "decart") {
      speakViaDecart(speechText);
    } else if (sessionRef.current) {
      try {
        sessionRef.current.repeat(speechText);
      } catch (err) {
        console.error("Avatar speak failed:", err);
      }
    }
  }, [speechText, connected, speakViaDecart]);

  // Init on mount
  useEffect(() => {
    initSession();
    return () => {
      sessionRef.current?.stop().catch(() => {});
      if (sessionIdRef.current) {
        fetch("/api/mock-interview/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "stop",
            sessionId: sessionIdRef.current,
            provider: providerRef.current,
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

  // Decart: iframe-based rendering
  if (provider === "decart" && streamUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900">
            <Loader className="h-8 w-8 animate-spin text-violet-400 mb-3" />
            <p className="text-sm text-gray-400">Connecting avatar...</p>
          </div>
        )}
        {connected && (
          <iframe
            src={streamUrl}
            className="w-full h-full border-0"
            allow="camera; microphone; autoplay"
            title={`${companyName} interviewer avatar`}
          />
        )}
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

  // HeyGen: video-element rendering via SDK
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
