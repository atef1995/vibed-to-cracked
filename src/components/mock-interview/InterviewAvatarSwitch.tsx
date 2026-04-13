"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";

const InterviewAvatar = dynamic(
  () => import("@/components/mock-interview/InterviewAvatar"),
  { ssr: false }
);
const SimliAvatar = dynamic(
  () => import("@/components/mock-interview/SimliAvatar"),
  { ssr: false }
);

interface InterviewAvatarSwitchProps {
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

type AvatarProvider = "heygen" | "simli" | null;

export default function InterviewAvatarSwitch(
  props: InterviewAvatarSwitchProps
) {
  const [provider, setProvider] = useState<AvatarProvider>(null);
  const [detecting, setDetecting] = useState(true);
  const detectedRef = useRef(false);

  const detectProvider = useCallback(async () => {
    try {
      // Lightweight probe to detect provider without creating sessions
      const res = await fetch("/api/mock-interview/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "probe" }),
      });

      if (!res.ok) {
        // Service unavailable, fall through to fallback
        setProvider("heygen");
        return;
      }

      const { data } = await res.json();
      setProvider(data?.provider === "simli" ? "simli" : "heygen");
    } catch {
      setProvider("heygen");
    } finally {
      setDetecting(false);
    }
  }, []);

  useEffect(() => {
    if (detectedRef.current) return;
    detectedRef.current = true;
    detectProvider();
  }, [detectProvider]);

  if (detecting || !provider) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (provider === "simli") {
    return <SimliAvatar {...props} />;
  }

  // HeyGen doesn't need interviewId
  const { interviewId: _, ...heygenProps } = props;
  return <InterviewAvatar {...heygenProps} />;
}
