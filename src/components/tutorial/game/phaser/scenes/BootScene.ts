import Phaser from "phaser";
import {
  TILES,
  PLAYER,
  NPCS,
  OBJECTS,
  UI,
  playerAnimKey,
  npcAnimKey,
} from "../assets/AssetKeys";
import { TILE_W, TILE_H } from "../systems/IsometricUtils";

/**
 * BootScene — loads real assets when available, otherwise generates
 * minimal colored placeholders so the game is playable immediately.
 *
 * To use real assets: drop PNGs into /public/game/ matching the paths
 * defined in AssetKeys.ts, then set USE_REAL_ASSETS = true below.
 */

const USE_REAL_ASSETS = false; // flip when you add itch.io sprites

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    if (USE_REAL_ASSETS) {
      this.loadRealAssets();
    }
  }

  create() {
    if (!USE_REAL_ASSETS) {
      this.generatePlaceholders();
    }
    this.createAnimations();
    this.scene.start("WorldScene");
  }

  // ── Real asset loading ───────────────────────────────────────

  private loadRealAssets() {
    // tiles
    for (const tile of Object.values(TILES)) {
      this.load.image(tile.key, tile.path);
    }

    // player spritesheet
    this.load.spritesheet(PLAYER.key, PLAYER.path, {
      frameWidth: PLAYER.frameWidth,
      frameHeight: PLAYER.frameHeight,
    });

    // NPC spritesheets
    for (const npc of Object.values(NPCS)) {
      this.load.spritesheet(npc.key, npc.path, {
        frameWidth: npc.frameWidth,
        frameHeight: npc.frameHeight,
      });
    }

    // objects
    for (const obj of Object.values(OBJECTS)) {
      this.load.image(obj.key, obj.path);
    }

    // UI
    for (const ui of Object.values(UI)) {
      this.load.image(ui.key, ui.path);
    }
  }

  // ── Placeholder generation (dev mode) ────────────────────────

  private generatePlaceholders() {
    this.makeTilePlaceholder(TILES.grass.key, "#4ade80", "#22c55e");
    this.makeTilePlaceholder(TILES.path.key, "#d4a574", "#b8956a");
    this.makeTilePlaceholder(TILES.water.key, "#60a5fa", "#3b82f6");
    this.makeTilePlaceholder(TILES.sand.key, "#fbbf24", "#f59e0b");

    this.makeCharPlaceholder(
      PLAYER.key,
      "#3b82f6",
      PLAYER.frameWidth,
      PLAYER.frameHeight,
      PLAYER.directions.length,
      PLAYER.framesPerDir
    );

    for (const npc of Object.values(NPCS)) {
      this.makeCharPlaceholder(
        npc.key,
        "#ef4444",
        npc.frameWidth,
        npc.frameHeight,
        4,
        npc.framesPerDir
      );
    }

    this.makeRectPlaceholder(OBJECTS.sign.key, 32, 40, "#92400e");
    this.makeRectPlaceholder(OBJECTS.block.key, 48, 48, "#64748b");
    this.makeRectPlaceholder(OBJECTS.portal.key, 40, 56, "#7c3aed");
    this.makeRectPlaceholder(OBJECTS.board.key, 44, 52, "#fef9c3");
    this.makeRectPlaceholder(OBJECTS.deco.key, 24, 24, "#22c55e");

    this.makeCirclePlaceholder(UI.questMarker.key, 8, "#eab308");
    this.makeCirclePlaceholder(UI.checkMarker.key, 8, "#22c55e");
  }

  /** Diamond-shaped isometric tile placeholder */
  private makeTilePlaceholder(key: string, fill: string, stroke: string) {
    const g = this.add.graphics();
    const hw = TILE_W / 2;
    const hh = TILE_H / 2;

    g.fillStyle(Phaser.Display.Color.HexStringToColor(fill).color);
    g.beginPath();
    g.moveTo(hw, 0);
    g.lineTo(TILE_W, hh);
    g.lineTo(hw, TILE_H);
    g.lineTo(0, hh);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, Phaser.Display.Color.HexStringToColor(stroke).color);
    g.beginPath();
    g.moveTo(hw, 0);
    g.lineTo(TILE_W, hh);
    g.lineTo(hw, TILE_H);
    g.lineTo(0, hh);
    g.closePath();
    g.strokePath();

    g.generateTexture(key, TILE_W, TILE_H);
    g.destroy();
  }

  /** Spritesheet placeholder: rows = directions, cols = frames per direction */
  private makeCharPlaceholder(
    key: string,
    color: string,
    fw: number,
    fh: number,
    dirs: number,
    framesPerDir: number
  ) {
    const totalW = fw * framesPerDir;
    const totalH = fh * dirs;
    const g = this.add.graphics();
    const c = Phaser.Display.Color.HexStringToColor(color).color;

    for (let row = 0; row < dirs; row++) {
      for (let col = 0; col < framesPerDir; col++) {
        const x = col * fw;
        const y = row * fh;

        // body
        g.fillStyle(c);
        g.fillRect(x + fw * 0.25, y + fh * 0.1, fw * 0.5, fh * 0.7);

        // head
        g.fillStyle(0xfcd34d);
        g.fillCircle(x + fw / 2, y + fh * 0.2, fw * 0.2);

        // slight frame variation (offset legs)
        const legOffset = col % 2 === 0 ? -2 : 2;
        g.fillStyle(c);
        g.fillRect(
          x + fw * 0.3 + legOffset,
          y + fh * 0.75,
          fw * 0.15,
          fh * 0.2
        );
        g.fillRect(
          x + fw * 0.55 - legOffset,
          y + fh * 0.75,
          fw * 0.15,
          fh * 0.2
        );
      }
    }

    g.generateTexture(key, totalW, totalH);
    g.destroy();

    // Add spritesheet frames to the generated texture
    const tex = this.textures.get(key);
    if (tex) {
      const src = tex.source[0];
      let frameIndex = 0;
      for (let row = 0; row < dirs; row++) {
        for (let col = 0; col < framesPerDir; col++) {
          tex.add(frameIndex, 0, col * fw, row * fh, fw, fh);
          frameIndex++;
        }
      }
    }
  }

  private makeRectPlaceholder(
    key: string,
    w: number,
    h: number,
    color: string
  ) {
    const g = this.add.graphics();
    g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color);
    g.fillRect(0, 0, w, h);
    g.lineStyle(1, 0x000000, 0.3);
    g.strokeRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeCirclePlaceholder(key: string, radius: number, color: string) {
    const g = this.add.graphics();
    g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color);
    g.fillCircle(radius, radius, radius);
    g.generateTexture(key, radius * 2, radius * 2);
    g.destroy();
  }

  // ── Animations ───────────────────────────────────────────────

  private createAnimations() {
    const { framesPerDir, directions, key: pKey } = PLAYER;

    // Player walk + idle animations for each direction
    for (let d = 0; d < directions.length; d++) {
      const dir = directions[d];
      const start = d * framesPerDir;

      this.anims.create({
        key: playerAnimKey(dir, "walk"),
        frames: this.anims.generateFrameNumbers(pKey, {
          start,
          end: start + framesPerDir - 1,
        }),
        frameRate: 8,
        repeat: -1,
      });

      this.anims.create({
        key: playerAnimKey(dir, "idle"),
        frames: [{ key: pKey, frame: start }],
        frameRate: 1,
        repeat: 0,
      });
    }

    // NPC idle animations
    for (const npc of Object.values(NPCS)) {
      this.anims.create({
        key: npcAnimKey(npc.key),
        frames: this.anims.generateFrameNumbers(npc.key, {
          start: 0,
          end: npc.framesPerDir - 1,
        }),
        frameRate: 3,
        repeat: -1,
      });
    }
  }
}
