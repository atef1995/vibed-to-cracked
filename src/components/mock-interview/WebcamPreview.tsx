"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Video, VideoOff } from "lucide-react";

interface WebcamPreviewProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function WebcamPreview({
  enabled,
  onToggle,
}: WebcamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch {
      setHasPermission(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [enabled, startCamera, stopCamera]);

  return (
    <div className="relative w-40 h-28 md:w-48 md:h-36 rounded-xl overflow-hidden bg-gray-800 shadow-lg border border-gray-700/50">
      {enabled && hasPermission !== false ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <VideoOff className="h-6 w-6 text-gray-500" />
        </div>
      )}
      <button
        onClick={onToggle}
        className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
        title={enabled ? "Turn off camera" : "Turn on camera"}
      >
        {enabled ? (
          <Video className="h-3.5 w-3.5" />
        ) : (
          <VideoOff className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
