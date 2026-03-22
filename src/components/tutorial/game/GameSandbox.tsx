"use client";

import dynamic from "next/dynamic";

const PhaserGame = dynamic(() => import("./phaser/PhaserGame"), { ssr: false });

/**
 * Full game sandbox layout: Phaser canvas on the left, code panel on the right.
 * For Phase 1 we just render the game — the code panel comes in Phase 2.
 */
export default function GameSandbox() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full rounded-lg overflow-hidden border border-border">
        <PhaserGame className="w-full" />
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Use WASD or arrow keys to move around the world
      </p>
    </div>
  );
}
