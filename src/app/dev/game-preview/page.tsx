"use client";

import dynamic from "next/dynamic";

const GameSandbox = dynamic(
  () => import("@/components/tutorial/game/GameSandbox"),
  { ssr: false }
);

export default function GamePreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 px-4 py-2 bg-yellow-950 border border-yellow-700 rounded-lg inline-flex items-center gap-2">
          <span className="text-yellow-400 text-xs font-mono">DEV PREVIEW</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Isometric Game World
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Walk around with WASD or arrow keys. Collide with NPCs.
        </p>
        <GameSandbox />
      </div>
    </div>
  );
}
