/**
 * Central registry of all texture keys and asset paths.
 *
 * When real assets are placed in /public/game/, update the `path` fields
 * and set `loaded` flags accordingly in BootScene.
 *
 * Spritesheet configs include frame dimensions for Phaser's loader.
 */

// ── Tile textures ────────────────────────────────────────────────

export const TILES = {
  grass: { key: "tile_grass", path: "/game/tiles/grass.png" },
  path: { key: "tile_path", path: "/game/tiles/path.png" },
  water: { key: "tile_water", path: "/game/tiles/water.png" },
  sand: { key: "tile_sand", path: "/game/tiles/sand.png" },
} as const;

// ── Player spritesheet ───────────────────────────────────────────

export const PLAYER = {
  key: "player",
  path: "/game/characters/player.png",
  frameWidth: 32,
  frameHeight: 48,
  // Expected layout: 4 rows (down, left, right, up) × N walk frames
  directions: ["down", "left", "right", "up"] as const,
  framesPerDir: 4,
} as const;

// ── NPC spritesheets ─────────────────────────────────────────────

export interface NPCDef {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  framesPerDir: number;
}

export const NPCS: Record<string, NPCDef> = {
  elder: {
    key: "npc_elder",
    path: "/game/characters/npc_elder.png",
    frameWidth: 32,
    frameHeight: 48,
    framesPerDir: 2,
  },
  smith: {
    key: "npc_smith",
    path: "/game/characters/npc_smith.png",
    frameWidth: 32,
    frameHeight: 48,
    framesPerDir: 2,
  },
  merchant: {
    key: "npc_merchant",
    path: "/game/characters/npc_merchant.png",
    frameWidth: 32,
    frameHeight: 48,
    framesPerDir: 2,
  },
  scholar: {
    key: "npc_scholar",
    path: "/game/characters/npc_scholar.png",
    frameWidth: 32,
    frameHeight: 48,
    framesPerDir: 2,
  },
} as const;

// ── World objects ────────────────────────────────────────────────

export const OBJECTS = {
  sign: { key: "obj_sign", path: "/game/objects/sign.png" },
  block: { key: "obj_block", path: "/game/objects/block.png" },
  portal: { key: "obj_portal", path: "/game/objects/portal.png" },
  board: { key: "obj_board", path: "/game/objects/board.png" },
  deco: { key: "obj_deco", path: "/game/objects/deco.png" },
} as const;

// ── UI elements ──────────────────────────────────────────────────

export const UI = {
  questMarker: { key: "quest_marker", path: "/game/ui/quest_marker.png" },
  checkMarker: { key: "check_marker", path: "/game/ui/check_marker.png" },
} as const;

// ── Animation key helpers ────────────────────────────────────────

export function playerAnimKey(dir: string, action: "walk" | "idle" = "walk") {
  return `player_${action}_${dir}`;
}

export function npcAnimKey(npcKey: string, action: "idle" = "idle") {
  return `${npcKey}_${action}`;
}
