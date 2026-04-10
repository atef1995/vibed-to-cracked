"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader, VideoOff, Volume2, VolumeOff } from "lucide-react";

interface InterviewAvatarProps {
  companySlug: string;
  companyName: string;
  companyColor: string;
  speechText?: string;
  onReady?: () => void;
}

export default function InterviewAvatar({
  companySlug,
  companyName,
  companyColor,
  speechText,
  onReady,
}: InterviewAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const lastSpeechRef = useRef<string>("");

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

      const data = await res.json();
      const { sessionId: sid, url, accessToken } = data;
      setSessionId(sid);

      // Set up WebRTC connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setConnected(true);
          setLoading(false);
          onReady?.();
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "failed"
        ) {
          setConnected(false);
          setError("disconnected");
        }
      };

      // Connect to HeyGen streaming URL via SDP
      if (url && accessToken) {
        const sdpRes = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            sdp: await createOffer(pc),
            type: "offer",
          }),
        });

        if (sdpRes.ok) {
          const sdpData = await sdpRes.json();
          await pc.setRemoteDescription(new RTCSessionDescription(sdpData));
        }
      } else {
        // No WebRTC URL — avatar not fully configured, show fallback
        setError("unavailable");
        setLoading(false);
      }
    } catch (err) {
      console.error("Avatar init failed:", err);
      setError("unavailable");
      setLoading(false);
    }
  }, [companySlug, onReady]);

  // Create WebRTC offer
  async function createOffer(pc: RTCPeerConnection): Promise<string> {
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer.sdp || "";
  }

  // Send speech text to avatar
  useEffect(() => {
    if (!sessionId || !speechText || speechText === lastSpeechRef.current)
      return;
    lastSpeechRef.current = speechText;

    fetch("/api/mock-interview/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, text: speechText }),
    }).catch((err) => console.error("Avatar speak failed:", err));
  }, [sessionId, speechText]);

  // Init on mount
  useEffect(() => {
    initSession();
    return () => {
      peerConnectionRef.current?.close();
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
