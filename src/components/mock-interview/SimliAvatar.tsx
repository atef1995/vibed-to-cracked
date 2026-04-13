"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "lucide-react";
import { SimliClient } from "simli-client";

interface SimliAvatarProps {
  companySlug: string;
  companyName: string;
  companyColor: string;
  interviewType?: string;
  speechText?: string;
  onReady?: () => void;
  onSpeakingChange?: (speaking: boolean) => void;
  muted?: boolean;
  interviewId: string;
}

function resampleBuffer(
  audioBuffer: AudioBuffer,
  targetRate: number
): Float32Array {
  const srcRate = audioBuffer.sampleRate;
  const srcData = audioBuffer.getChannelData(0);
  if (srcRate === targetRate) return srcData;

  const ratio = srcRate / targetRate;
  const outLength = Math.round(srcData.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const srcIndex = i * ratio;
    const low = Math.floor(srcIndex);
    const high = Math.min(low + 1, srcData.length - 1);
    const frac = srcIndex - low;
    out[i] = srcData[low] * (1 - frac) + srcData[high] * frac;
  }
  return out;
}

function float32ToPcm16(float32: Float32Array): Uint8Array {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return new Uint8Array(pcm16.buffer);
}

export default function SimliAvatar({
  companyName,
  companyColor,
  interviewType,
  speechText,
  onReady,
  onSpeakingChange,
  muted: externalMuted,
  interviewId,
}: SimliAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const clientRef = useRef<SimliClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const onSpeakingChangeRef = useRef(onSpeakingChange);
  onSpeakingChangeRef.current = onSpeakingChange;
  const lastSpeechRef = useRef<string>("");
  const pendingSpeechRef = useRef<string | null>(null);
  const speakingRef = useRef(false);

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const sendSpeechAudio = useCallback(
    async (text: string) => {
      const client = clientRef.current;
      if (!client || speakingRef.current) return;

      try {
        speakingRef.current = true;

        const res = await fetch(`/api/mock-interview/${interviewId}/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, interviewType }),
        });

        if (!res.ok) {
          console.error("TTS request failed:", res.status);
          return;
        }

        const mp3Buffer = await res.arrayBuffer();
        const ctx = getAudioContext();
        const audioBuffer = await ctx.decodeAudioData(mp3Buffer.slice(0));
        const resampled = resampleBuffer(audioBuffer, 16000);
        const pcm16 = float32ToPcm16(resampled);

        // Send in paced chunks — Simli expects ~real-time PCM16 at 16kHz
        const chunkSize = 6000;
        for (let i = 0; i < pcm16.length; i += chunkSize) {
          const chunk = pcm16.slice(i, i + chunkSize);
          client.sendAudioData(chunk);
          if (i + chunkSize < pcm16.length) {
            await new Promise((r) => setTimeout(r, 50));
          }
        }
      } catch (err) {
        console.error("Simli speak failed:", err);
      } finally {
        speakingRef.current = false;
      }
    },
    [interviewId, interviewType, getAudioContext]
  );

  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/mock-interview/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewType }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          setError("unavailable");
          setLoading(false);
          onReady?.();
          return;
        }
        throw new Error("Failed to create avatar session");
      }

      const { data } = await res.json();
      if (!data?.sessionToken) {
        setError("unavailable");
        setLoading(false);
        onReady?.();
        return;
      }

      if (!videoRef.current || !audioRef.current) {
        setError("unavailable");
        setLoading(false);
        onReady?.();
        return;
      }

      const client = new SimliClient(
        data.sessionToken,
        videoRef.current,
        audioRef.current,
        null,
        undefined,
        "livekit"
      );

      client.on("start", () => {
        setConnected(true);
        setLoading(false);
        onReady?.();

        if (pendingSpeechRef.current) {
          const pending = pendingSpeechRef.current;
          pendingSpeechRef.current = null;
          sendSpeechAudio(pending);
          lastSpeechRef.current = pending;
        }
      });

      client.on("speaking", () => {
        setIsSpeaking(true);
        onSpeakingChangeRef.current?.(true);
      });
      client.on("silent", () => {
        setIsSpeaking(false);
        onSpeakingChangeRef.current?.(false);
      });

      client.on("error", (detail: string) => {
        console.error("Simli connection error:", detail);
        setError("unavailable");
        setLoading(false);
        onReady?.();
      });

      client.on("startup_error", (message: string) => {
        console.error("Simli startup error:", message);
        setError("unavailable");
        setLoading(false);
        onReady?.();
      });

      client.on("stop", () => {
        setConnected(false);
        setError("disconnected");
      });

      clientRef.current = client;
      await client.start();
    } catch (err) {
      console.error("Simli init failed:", err);
      setError("unavailable");
      setLoading(false);
      onReady?.();
    }
  }, [interviewType, onReady, sendSpeechAudio]);

  // Clear dedup ref when speech resets
  useEffect(() => {
    if (!speechText) {
      lastSpeechRef.current = "";
    }
    setIsSpeaking(false);
  }, [speechText]);

  // Send speech text when it changes
  useEffect(() => {
    if (!speechText || speechText === lastSpeechRef.current) return;

    if (!clientRef.current || !connected) {
      pendingSpeechRef.current = speechText;
      return;
    }

    lastSpeechRef.current = speechText;
    pendingSpeechRef.current = null;
    sendSpeechAudio(speechText);
  }, [speechText, connected, sendSpeechAudio]);

  // Init on mount
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    initSession();
    return () => {
      clientRef.current?.stop();
      audioContextRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle mute/unmute from parent
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = !!externalMuted;
    }
  }, [externalMuted]);

  if (error) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900 flex flex-col items-center justify-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
          style={{ backgroundColor: companyColor }}
        >
          {companyName.charAt(0)}
        </div>
        <p className="text-white font-medium">{companyName} Interviewer</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900">
          <Loader className="h-8 w-8 animate-spin text-violet-400 mb-3" />
          <p className="text-sm text-gray-400">Connecting...</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${connected ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      />
      <audio ref={audioRef} autoPlay />
    </div>
  );
}
