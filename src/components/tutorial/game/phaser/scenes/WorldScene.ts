import Phaser from "phaser";
import { TILES, NPCS, OBJECTS, npcAnimKey } from "../assets/AssetKeys";
import { cartToIso, TILE_W, TILE_H } from "../systems/IsometricUtils";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import Player from "../entities/Player";

/**
 * Tile legend:
 * 0 = grass, 1 = path, 2 = water, 3 = sand
 */
const MAP_DATA: number[][] = [
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 3, 0],
  [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 3, 3, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const TILE_KEYS = [
  TILES.grass.key,
  TILES.path.key,
  TILES.water.key,
  TILES.sand.key,
];

interface NPCSpawn {
  npcKey: string;
  tileX: number;
  tileY: number;
}

const NPC_SPAWNS: NPCSpawn[] = [
  { npcKey: NPCS.elder.key, tileX: 3, tileY: 2 },
  { npcKey: NPCS.smith.key, tileX: 8, tileY: 4 },
  { npcKey: NPCS.merchant.key, tileX: 5, tileY: 9 },
  { npcKey: NPCS.scholar.key, tileX: 12, tileY: 3 },
];

interface ObjectSpawn {
  objKey: string;
  tileX: number;
  tileY: number;
}

const OBJECT_SPAWNS: ObjectSpawn[] = [
  { objKey: OBJECTS.sign.key, tileX: 2, tileY: 2 },
  { objKey: OBJECTS.board.key, tileX: 10, tileY: 7 },
  { objKey: OBJECTS.portal.key, tileX: 12, tileY: 4 },
];

export default class WorldScene extends Phaser.Scene {
  private player!: Player;
  private npcs: Phaser.Physics.Arcade.Sprite[] = [];

  constructor() {
    super({ key: "WorldScene" });
  }

  create() {
    const rows = MAP_DATA.length;
    const cols = MAP_DATA[0].length;

    // offset so the map is centered on screen
    const mapCenterIso = cartToIso(cols / 2, rows / 2);
    const offsetX = GAME_WIDTH / 2 - mapCenterIso.x;
    const offsetY = 80; // some top padding

    // ── Draw tile map ──────────────────────────────────────────
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileType = MAP_DATA[row][col];
        const pos = cartToIso(col, row);
        const tile = this.add.image(
          pos.x + offsetX,
          pos.y + offsetY,
          TILE_KEYS[tileType]
        );
        tile.setOrigin(0.5, 0.5);
        tile.setDepth(row + col); // basic depth sorting
      }
    }

    // ── Spawn objects ──────────────────────────────────────────
    for (const obj of OBJECT_SPAWNS) {
      const pos = cartToIso(obj.tileX, obj.tileY);
      const sprite = this.add.image(
        pos.x + offsetX,
        pos.y + offsetY - 12,
        obj.objKey
      );
      sprite.setOrigin(0.5, 1);
      sprite.setDepth(obj.tileY + obj.tileX + 1);
    }

    // ── Spawn NPCs ────────────────────────────────────────────
    for (const spawn of NPC_SPAWNS) {
      const pos = cartToIso(spawn.tileX, spawn.tileY);
      const npc = this.physics.add.sprite(
        pos.x + offsetX,
        pos.y + offsetY - 8,
        spawn.npcKey
      );
      npc.setOrigin(0.5, 0.8);
      npc.setDepth(spawn.tileY + spawn.tileX + 2);
      npc.setImmovable(true);
      npc.anims.play(npcAnimKey(spawn.npcKey), true);
      this.npcs.push(npc);
    }

    // ── Spawn player ───────────────────────────────────────────
    // We create player in screen space, using the offset
    const playerStart = cartToIso(4, 4);
    this.player = new Player(this, 0, 0); // temp position
    this.player.sprite.setPosition(
      playerStart.x + offsetX,
      playerStart.y + offsetY - 8
    );

    // Camera follow
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);

    // World bounds — generous range for walking
    const boundsMargin = 400;
    this.cameras.main.setBounds(
      -boundsMargin,
      -boundsMargin,
      GAME_WIDTH + boundsMargin * 2,
      GAME_HEIGHT + boundsMargin * 2
    );

    // ── NPC collision ──────────────────────────────────────────
    for (const npc of this.npcs) {
      this.physics.add.collider(this.player.sprite, npc);
    }
  }

  update() {
    this.player.update();

    // Depth sort player against entities based on Y position
    this.player.sprite.setDepth(this.player.sprite.y);
    for (const npc of this.npcs) {
      npc.setDepth(npc.y);
    }
  }
}
