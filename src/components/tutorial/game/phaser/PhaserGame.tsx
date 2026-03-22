"use client";

import { useEffect, useRef } from "react";

/**
 * React wrapper that creates and manages a Phaser 3 game instance.
 * Must be loaded with `dynamic(() => import(...), { ssr: false })`.
 */
export default function PhaserGame({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    let destroyed = false;

    // Dynamic import so Phaser is only loaded client-side
    import("phaser").then((Phaser) => {
      if (destroyed || !containerRef.current) return;

      // Import scenes and config inside the dynamic block
      return Promise.all([
        import("./config"),
        import("./scenes/BootScene"),
        import("./scenes/WorldScene"),
      ]).then(([configMod, bootMod, worldMod]) => {
        if (destroyed || !containerRef.current) return;

        const config = configMod.createGameConfig(containerRef.current!, [
          bootMod.default,
          worldMod.default,
        ]);

        gameRef.current = new Phaser.Game(config);
      });
    });

    return () => {
      destroyed = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full aspect-4/3 bg-[#1a1a2e] ${className ?? ""}`}
    />
  );
}
