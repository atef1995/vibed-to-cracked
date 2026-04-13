"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface UseSpeechRecognitionOptions {
  /** Ms of silence after last speech before countdown begins. Default: 2000 */
  silenceDelay?: number;
  /** Seconds of visible countdown before auto-submit. Default: 3 */
  countdownSeconds?: number;
  /** Called when countdown reaches 0 — time to auto-submit */
  onAutoSubmit?: (transcript: string) => void;
  /** Pause recognition (e.g. while avatar is speaking or submitting) */
  paused?: boolean;
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  /** Whether the user has spoken at all this turn */
  hasSpoken: boolean;
  /** Accumulated final transcript for the current turn */
  transcript: string;
  /** Current interim (in-progress) words */
  interim: string;
  /** Visible countdown seconds remaining (null = not counting down) */
  countdown: number | null;
  start: () => void;
  stop: () => void;
  clearTranscript: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    silenceDelay = 2000,
    countdownSeconds = 3,
    onAutoSubmit,
    paused = false,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const transcriptRef = useRef("");
  const hasSpokenRef = useRef(false);
  const shouldBeListeningRef = useRef(false);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const countdownSecondsRef = useRef(countdownSeconds);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);
  useEffect(() => {
    countdownSecondsRef.current = countdownSeconds;
  }, [countdownSeconds]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  const clearAllTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  }, []);

  const startCountdown = useCallback(() => {
    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let remaining = countdownSecondsRef.current;
    setCountdown(remaining);

    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        const text = transcriptRef.current.trim();
        if (text && onAutoSubmitRef.current) {
          onAutoSubmitRef.current(text);
        }
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, []);

  const startSilenceTimer = useCallback(() => {
    // Only start the timer if the user has actually spoken
    if (!hasSpokenRef.current) return;

    clearAllTimers();
    silenceTimerRef.current = setTimeout(() => {
      silenceTimerRef.current = null;
      startCountdown();
    }, silenceDelay);
  }, [clearAllTimers, silenceDelay, startCountdown]);

  const destroyRecognition = useCallback(() => {
    clearAllTimers();
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  }, [clearAllTimers]);

  const createAndStart = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    destroyRecognition();

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let sessionFinal = "";
      let sessionInterim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          sessionFinal += result[0].transcript;
        } else {
          sessionInterim += result[0].transcript;
        }
      }

      const fullTranscript = sessionFinal;
      transcriptRef.current = fullTranscript;
      setTranscript(fullTranscript);
      setInterim(sessionInterim);

      // Mark that the user has started speaking
      if (fullTranscript.trim() || sessionInterim.trim()) {
        if (!hasSpokenRef.current) {
          hasSpokenRef.current = true;
          setHasSpoken(true);
        }
        // Any speech resets all timers (user is still talking/thinking)
        clearAllTimers();
        // Re-arm silence detection after this speech event
        startSilenceTimer();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // Chrome kills continuous sessions periodically — auto-restart
      if (shouldBeListeningRef.current) {
        try {
          const next = new SR();
          next.continuous = true;
          next.interimResults = true;
          next.lang = "en-US";
          next.onresult = recognition.onresult;
          next.onerror = recognition.onerror;
          next.onend = recognition.onend;
          recognitionRef.current = next;
          next.start();
        } catch {
          setIsListening(false);
          shouldBeListeningRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      shouldBeListeningRef.current = false;
    }
  }, [destroyRecognition, clearAllTimers, startSilenceTimer]);

  const start = useCallback(() => {
    shouldBeListeningRef.current = true;
    hasSpokenRef.current = false;
    transcriptRef.current = "";
    setHasSpoken(false);
    setTranscript("");
    setInterim("");
    setCountdown(null);
    createAndStart();
  }, [createAndStart]);

  const stop = useCallback(() => {
    shouldBeListeningRef.current = false;
    clearAllTimers();
    destroyRecognition();
    setIsListening(false);
    setInterim("");
    setCountdown(null);
    hasSpokenRef.current = false;
    setHasSpoken(false);
    transcriptRef.current = "";
    setTranscript("");
  }, [clearAllTimers, destroyRecognition]);

  const clearTranscript = useCallback(() => {
    transcriptRef.current = "";
    hasSpokenRef.current = false;
    setTranscript("");
    setInterim("");
    setHasSpoken(false);
    setCountdown(null);
    clearAllTimers();
  }, [clearAllTimers]);

  // Pause/resume when avatar is speaking or submitting
  useEffect(() => {
    if (!shouldBeListeningRef.current) return;

    if (paused) {
      clearAllTimers();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      setIsListening(false);
    } else {
      createAndStart();
    }
  }, [paused, clearAllTimers, createAndStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      destroyRecognition();
    };
  }, [destroyRecognition]);

  return {
    isSupported,
    isListening,
    hasSpoken,
    transcript,
    interim,
    countdown,
    start,
    stop,
    clearTranscript,
  };
}
