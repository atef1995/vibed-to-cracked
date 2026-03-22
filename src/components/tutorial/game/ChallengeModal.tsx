"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Stage,
  FillTagChallenge,
  ArrangeChallenge,
  CodeOutputChallenge,
  FixHtmlChallenge,
  FreeformChallenge,
} from "./types";

// ─── Fill Tag ────────────────────────────────────────────────────────────────

function FillTag({
  challenge,
  onCorrect,
}: {
  challenge: FillTagChallenge;
  onCorrect: () => void;
}) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "wrong">("idle");
  const [attempts, setAttempts] = useState(0);

  function check() {
    const norm = value
      .trim()
      .toLowerCase()
      .replace(/[<>/\s]/g, "");
    if (norm === challenge.answer.toLowerCase()) {
      onCorrect();
    } else {
      setFeedback("wrong");
      setAttempts((n) => n + 1);
      setTimeout(() => setFeedback("idle"), 1200);
    }
  }

  return (
    <div>
      <p className="text-slate-300 mb-6 leading-relaxed">{challenge.prompt}</p>
      <div className="flex items-center gap-2">
        <span className="text-blue-400 font-mono text-lg">&lt;</span>
        <motion.input
          animate={feedback === "wrong" ? { x: [0, -8, 8, -8, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          className={`bg-slate-800 border rounded px-3 py-2 text-white font-mono text-base focus:outline-none transition-colors ${
            feedback === "wrong"
              ? "border-red-500 focus:border-red-500"
              : "border-slate-600 focus:border-blue-500"
          }`}
          placeholder="tag name"
          autoFocus
        />
        <span className="text-blue-400 font-mono text-lg">&gt;</span>
      </div>
      {challenge.hint && attempts >= 2 && (
        <p className="mt-3 text-yellow-400 text-sm">Hint: {challenge.hint}</p>
      )}
      {feedback === "wrong" && (
        <p className="mt-2 text-red-400 text-sm">Not quite — try again.</p>
      )}
      <button
        onClick={check}
        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
      >
        Check
      </button>
    </div>
  );
}

// ─── Arrange ─────────────────────────────────────────────────────────────────

function Arrange({
  challenge,
  onCorrect,
}: {
  challenge: ArrangeChallenge;
  onCorrect: () => void;
}) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const remaining = challenge.items.filter((item) => !placed.includes(item));

  useEffect(() => {
    if (placed.length !== challenge.items.length) return;
    const correct = placed.every(
      (item, i) => item === challenge.correctOrder[i]
    );
    if (correct) {
      onCorrect();
    } else {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPlaced([]);
      }, 900);
    }
  }, [placed, challenge, onCorrect]);

  function add(item: string) {
    setPlaced((p) => [...p, item]);
  }

  function remove(item: string) {
    setPlaced((p) => p.filter((x) => x !== item));
  }

  return (
    <div>
      <p className="text-slate-300 mb-5 leading-relaxed">{challenge.prompt}</p>

      {/* Sequence slots */}
      <motion.div
        animate={shake ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-2 mb-5"
      >
        {challenge.items.map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-slate-500 text-sm w-4 text-right">
              {i + 1}.
            </span>
            {placed[i] ? (
              <button
                onClick={() => remove(placed[i])}
                className="px-3 py-1.5 bg-blue-900 border border-blue-500 rounded text-blue-200 font-mono text-sm hover:bg-blue-800 transition-colors"
              >
                {placed[i]}
              </button>
            ) : (
              <div className="px-3 py-1.5 border border-dashed border-slate-600 rounded text-slate-600 text-sm min-w-30">
                click to place
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Item pool */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
        <span className="w-full text-slate-500 text-xs mb-1">Available:</span>
        {remaining.map((item) => (
          <button
            key={item}
            onClick={() => add(item)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-600 hover:border-blue-500 rounded text-slate-200 font-mono text-sm transition-colors"
          >
            {item}
          </button>
        ))}
        {remaining.length === 0 && placed.length < challenge.items.length && (
          <span className="text-slate-500 text-sm">All items placed</span>
        )}
      </div>
    </div>
  );
}

// ─── Code Output ─────────────────────────────────────────────────────────────

function CodeOutput({
  challenge,
  onCorrect,
}: {
  challenge: CodeOutputChallenge;
  onCorrect: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "wrong">("idle");

  function check() {
    if (selected === null) return;
    if (selected === challenge.correctIndex) {
      onCorrect();
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback("idle");
        setSelected(null);
      }, 1200);
    }
  }

  return (
    <div>
      <p className="text-slate-300 mb-4 leading-relaxed">{challenge.prompt}</p>
      <div className="space-y-2 mb-5">
        {challenge.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              if (feedback === "idle") setSelected(i);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-lg border font-mono text-sm transition-all ${
              selected === i
                ? feedback === "wrong"
                  ? "border-red-500 bg-red-900/30 text-red-300"
                  : "border-blue-500 bg-blue-900/30 text-blue-200"
                : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback === "wrong" && (
        <p className="mb-3 text-red-400 text-sm">
          That's not right — try another option.
        </p>
      )}
      <button
        onClick={check}
        disabled={selected === null}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        Check
      </button>
    </div>
  );
}

// ─── Fix HTML ─────────────────────────────────────────────────────────────────

function FixHtml({
  challenge,
  onCorrect,
}: {
  challenge: FixHtmlChallenge;
  onCorrect: () => void;
}) {
  const [code, setCode] = useState(challenge.broken);
  const [feedback, setFeedback] = useState<"idle" | "wrong">("idle");
  const [attempts, setAttempts] = useState(0);

  function check() {
    if (code.toLowerCase().includes(challenge.solution.toLowerCase())) {
      onCorrect();
    } else {
      setFeedback("wrong");
      setAttempts((n) => n + 1);
      setTimeout(() => setFeedback("idle"), 1200);
    }
  }

  return (
    <div>
      <p className="text-slate-300 mb-4 leading-relaxed">{challenge.prompt}</p>
      <motion.textarea
        animate={feedback === "wrong" ? { x: [0, -6, 6, -6, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={5}
        aria-label="Fix the HTML code"
        className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-slate-200 font-mono text-sm resize-none focus:outline-none transition-colors ${
          feedback === "wrong"
            ? "border-red-500"
            : "border-slate-600 focus:border-blue-500"
        }`}
        spellCheck={false}
      />
      {challenge.hint && attempts >= 2 && (
        <p className="mt-2 text-yellow-400 text-sm">Hint: {challenge.hint}</p>
      )}
      {feedback === "wrong" && (
        <p className="mt-1 text-red-400 text-sm">The fix isn't right yet.</p>
      )}
      <button
        onClick={check}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
      >
        Check Fix
      </button>
    </div>
  );
}

// ─── Freeform ─────────────────────────────────────────────────────────────────

function Freeform({
  challenge,
  onCorrect,
}: {
  challenge: FreeformChallenge;
  onCorrect: () => void;
}) {
  const [code, setCode] = useState(challenge.initialHtml);
  const [feedback, setFeedback] = useState<"idle" | "wrong">("idle");

  function check() {
    if (code.toLowerCase().includes(challenge.successIf.toLowerCase())) {
      onCorrect();
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback("idle"), 1400);
    }
  }

  return (
    <div>
      <p className="text-slate-300 mb-4 leading-relaxed">{challenge.prompt}</p>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={8}
        aria-label="Write your HTML code"
        className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-slate-200 font-mono text-sm resize-none focus:outline-none transition-colors ${
          feedback === "wrong"
            ? "border-red-500"
            : "border-slate-600 focus:border-blue-500"
        }`}
        spellCheck={false}
      />
      {feedback === "wrong" && (
        <p className="mt-2 text-red-400 text-sm">
          Not quite — make sure your HTML includes the required element.
        </p>
      )}
      <button
        onClick={check}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
      >
        Submit
      </button>
    </div>
  );
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────

interface ChallengeModalProps {
  stage: Stage;
  onClose: () => void;
  onClear: (xp: number) => void;
}

export function ChallengeModal({
  stage,
  onClose,
  onClear,
}: ChallengeModalProps) {
  const xp = stage.xpReward ?? 10;
  const [cleared, setCleared] = useState(false);

  function handleCorrect() {
    setCleared(true);
    setTimeout(() => onClear(xp), 900);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h3 className="text-white font-semibold text-lg">{stage.title}</h3>
            <span className="text-xs text-blue-400 font-medium">
              +{xp} XP on clear
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {cleared ? (
              <motion.div
                key="cleared"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-green-900 border-2 border-green-500 flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-green-400 font-semibold text-lg">
                  Stage cleared!
                </p>
                <p className="text-slate-400 text-sm">+{xp} XP earned</p>
              </motion.div>
            ) : (
              <motion.div
                key="challenge"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {stage.challenge.type === "fill-tag" && (
                  <FillTag
                    challenge={stage.challenge}
                    onCorrect={handleCorrect}
                  />
                )}
                {stage.challenge.type === "arrange" && (
                  <Arrange
                    challenge={stage.challenge}
                    onCorrect={handleCorrect}
                  />
                )}
                {stage.challenge.type === "code-output" && (
                  <CodeOutput
                    challenge={stage.challenge}
                    onCorrect={handleCorrect}
                  />
                )}
                {stage.challenge.type === "fix-html" && (
                  <FixHtml
                    challenge={stage.challenge}
                    onCorrect={handleCorrect}
                  />
                )}
                {stage.challenge.type === "freeform" && (
                  <Freeform
                    challenge={stage.challenge}
                    onCorrect={handleCorrect}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
