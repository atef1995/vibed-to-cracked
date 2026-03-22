import Phaser from "phaser";
import { PLAYER, playerAnimKey } from "../assets/AssetKeys";
import {
  cartToIso,
  isoToCart,
  TILE_W,
  TILE_H,
} from "../systems/IsometricUtils";

const SPEED = 120; // pixels per second

/**
 * Player entity — handles WASD/arrow movement in isometric space
 * with directional walk animations.
 */
export default class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private facing: string = "down";

  constructor(scene: Phaser.Scene, tileX: number, tileY: number) {
    const pos = cartToIso(tileX, tileY);

    this.sprite = scene.physics.add.sprite(pos.x, pos.y, PLAYER.key);
    this.sprite.setDepth(10);
    this.sprite.setOrigin(0.5, 0.8); // feet near tile center
    this.sprite.setCollideWorldBounds(false);

    // Scale placeholder sprites up slightly so they're visible
    this.sprite.setScale(1);

    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update() {
    let dx = 0;
    let dy = 0;

    // Cartesian movement intent (WASD / arrows)
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;

    if (dx === 0 && dy === 0) {
      this.sprite.setVelocity(0, 0);
      this.sprite.anims.play(playerAnimKey(this.facing, "idle"), true);
      return;
    }

    // Map cartesian direction to isometric velocity
    // In isometric: moving "down" (cart +y) = screen right+down
    //               moving "right" (cart +x) = screen right+up
    const isoVx = (dx - dy) * (TILE_W / 2);
    const isoVy = (dx + dy) * (TILE_H / 2);

    // Normalize to constant speed
    const len = Math.sqrt(isoVx * isoVx + isoVy * isoVy);
    this.sprite.setVelocity((isoVx / len) * SPEED, (isoVy / len) * SPEED);

    // Determine facing direction from cartesian intent
    if (Math.abs(dx) >= Math.abs(dy)) {
      this.facing = dx > 0 ? "right" : "left";
    } else {
      this.facing = dy > 0 ? "down" : "up";
    }

    this.sprite.anims.play(playerAnimKey(this.facing, "walk"), true);
  }

  /** Current tile position (fractional) */
  getTilePos(): { x: number; y: number } {
    return isoToCart(this.sprite.x, this.sprite.y);
  }

  /** Screen position */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }
}
