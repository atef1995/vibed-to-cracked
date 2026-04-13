"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  Loader,
  SkipForward,
} from "lucide-react";

interface VideoCallToolbarProps {
  isMicOn: boolean;
  onToggleMic: () => void;
  isCameraOn: boolean;
  onToggleCamera: () => void;
  onEndCall: () => void;
  onSubmit?: () => void;
  onSkip?: () => void;
  submitDisabled?: boolean;
  submitting?: boolean;
  ending?: boolean;
  showSubmit?: boolean;
}

export default function VideoCallToolbar({
  isMicOn,
  onToggleMic,
  isCameraOn,
  onToggleCamera,
  onEndCall,
  onSubmit,
  onSkip,
  submitDisabled,
  submitting,
  ending,
  showSubmit,
}: VideoCallToolbarProps) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
      {/* Mic toggle */}
      <button
        onClick={onToggleMic}
        className={`p-3 rounded-full transition-colors ${
          isMicOn
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
        title={isMicOn ? "Mute" : "Unmute"}
      >
        {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </button>

      {/* Camera toggle */}
      <button
        onClick={onToggleCamera}
        className={`p-3 rounded-full transition-colors ${
          isCameraOn
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
        title={isCameraOn ? "Turn off camera" : "Turn on camera"}
      >
        {isCameraOn ? (
          <Video className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5" />
        )}
      </button>

      {/* Submit answer */}
      {showSubmit && (
        <>
          {onSkip && (
            <button
              onClick={onSkip}
              disabled={submitting}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
              title="End Interview"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={submitDisabled || submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Submit Answer"
          >
            {submitting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="text-sm">Submit</span>
          </button>
        </>
      )}

      {/* End call */}
      <button
        onClick={onEndCall}
        disabled={ending}
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 ml-4"
        title="End Interview"
      >
        {ending ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <PhoneOff className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
