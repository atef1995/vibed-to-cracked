"use client";

import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameWorld } from "./useGameWorld";
import { ChallengeModal } from "./ChallengeModal";
import type { Stage } from "./types";

const COLS = 3;
const CELL_W = 200;
const ROW_H = 180;
const PAD_X = 100;
const PAD_Y = 80;
const NODE_R = 36;

function stagePosition(index: number) {
  const row = Math.floor(index / COLS);
  const posInRow = index % COLS;
  const col = row % 2 === 0 ? posInRow : COLS - 1 - posInRow;
  return { x: PAD_X + col * CELL_W, y: PAD_Y + row * ROW_H };
}

function mapSize(stageCount: number) {
  const rows = Math.ceil(stageCount / COLS);
  const cols = Math.min(stageCount, COLS);
  return {
    width: PAD_X * 2 + CELL_W * (cols - 1),
    height: PAD_Y * 2 + ROW_H * (rows - 1),
  };
}

function formatTitle(id: string) {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface Props {
  tutorialId: string;
  stages: Stage[];
}

export function TutorialGameWorld({ tutorialId, stages }: Props) {
  const { data: session } = useSession();
  const {
    cleared,
    activeStage,
    justClearedId,
    allCleared,
    clearedCount,
    getStatus,
    openStage,
    closeStage,
    clearStage,
  } = useGameWorld(tutorialId, stages);

  const positions = stages.map((_, i) => stagePosition(i));
  const { width, height } = mapSize(stages.length);
  const totalW = width + NODE_R * 2 + 20;
  const totalH = height + NODE_R * 2 + 20;

  async function handleStageClear(stageId: string, xpReward: number) {
    clearStage(stageId);
    if (session?.user && xpReward > 0) {
      try {
        await fetch("/api/user/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: xpReward,
            reason: "GAME_STAGE_CLEARED",
            metadata: { tutorialId, stageId },
          }),
        });
      } catch {}
    }
    const willBeAllCleared =
      stages.filter((s) => cleared.has(s.id) || s.id === stageId).length ===
      stages.length;
    if (willBeAllCleared) {
      setTimeout(async () => {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 } });
      }, 300);
    }
  }

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
      {/* HUD */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700">
        <span className="text-sm text-slate-400">
          <span className="text-white font-semibold">
            {formatTitle(tutorialId)}
          </span>
          {" — "}
          {clearedCount}/{stages.length} cleared
        </span>
        <div className="flex items-center gap-3">
          {allCleared && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-400 font-medium"
            >
              All cleared!
            </motion.span>
          )}
          <div className="flex gap-1.5">
            {stages.map((s) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  cleared.has(s.id) ? "bg-green-500" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="px-6 pt-4 pb-1">
        <p className="text-slate-500 text-sm">
          Click an available zone to tackle its challenge. Each cleared zone
          unlocks the next.
        </p>
      </div>

      {/* Map */}
      <div className="overflow-x-auto pb-4">
        <div
          className="relative mx-auto"
          style={{ width: totalW, height: totalH }}
        >
          {/* Connecting paths */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={totalW}
            height={totalH}
          >
            {stages.slice(0, -1).map((stage, i) => {
              const from = positions[i];
              const to = positions[i + 1];
              const isCleared = cleared.has(stage.id);
              return (
                <line
                  key={stage.id}
                  x1={from.x + NODE_R + 10}
                  y1={from.y + NODE_R + 10}
                  x2={to.x + NODE_R + 10}
                  y2={to.y + NODE_R + 10}
                  stroke={isCleared ? "#22c55e" : "#2d3748"}
                  strokeWidth={2.5}
                  strokeDasharray={isCleared ? undefined : "7 5"}
                  opacity={isCleared ? 0.65 : 0.5}
                />
              );
            })}
          </svg>

          {/* Stage nodes */}
          {stages.map((stage, i) => {
            const pos = positions[i];
            const status = getStatus(stage.id);
            const isJustCleared = justClearedId === stage.id;

            // Tailwind classes for each status (avoids inline styles)
            const ringColor =
              status === "cleared"
                ? "border-green-500"
                : status === "available"
                  ? "border-blue-500"
                  : "border-gray-700";
            const bgColor =
              status === "cleared"
                ? "bg-green-950"
                : status === "available"
                  ? "bg-slate-950"
                  : "bg-gray-900";
            const textColor =
              status === "cleared"
                ? "text-green-300"
                : status === "available"
                  ? "text-blue-300"
                  : "text-gray-600";
            const glowClass =
              status === "available"
                ? "shadow-[0_0_18px_rgba(59,130,246,0.27)]"
                : "";

            return (
              <motion.button
                key={stage.id}
                onClick={() => openStage(stage.id)}
                disabled={status === "locked"}
                animate={
                  isJustCleared
                    ? { scale: [1, 1.25, 1], transition: { duration: 0.45 } }
                    : undefined
                }
                whileHover={status !== "locked" ? { scale: 1.07 } : undefined}
                whileTap={status !== "locked" ? { scale: 0.93 } : undefined}
                className="absolute flex flex-col items-center"
                style={{ left: pos.x + 10, top: pos.y + 10 }}
              >
                {/* Circle */}
                <div
                  className={`relative flex items-center justify-center rounded-full border-2 w-18 h-18 ${ringColor} ${bgColor} ${glowClass}`}
                >
                  {status === "cleared" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : status === "locked" ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="5"
                        y="11"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="#4b5563"
                        strokeWidth="2"
                        fill="#1f2937"
                      />
                      <path
                        d="M8 11V7a4 4 0 0 1 8 0v4"
                        stroke="#4b5563"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <span className={`text-base font-bold ${textColor}`}>
                      {i + 1}
                    </span>
                  )}

                  {/* Pulse ring for available */}
                  {status === "available" && (
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none border-2 border-blue-500"
                      animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-2 text-xs font-medium text-center leading-snug max-w-23 ${textColor}`}
                >
                  {stage.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Challenge modal */}
      <AnimatePresence>
        {activeStage && (
          <ChallengeModal
            stage={activeStage}
            onClose={closeStage}
            onClear={(xp) => handleStageClear(activeStage.id, xp)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
