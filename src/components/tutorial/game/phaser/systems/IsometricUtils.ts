/**
 * Isometric coordinate conversion utilities.
 *
 * The world uses a diamond (staggered) isometric projection.
 * - Cartesian (cart) = flat grid coordinates (tile col, tile row)
 * - Isometric (iso)  = screen-space pixel coordinates
 *
 * TILE_W and TILE_H define the diamond dimensions.
 */

export const TILE_W = 64;
export const TILE_H = 32;

/** Convert cartesian tile (col, row) to isometric screen position. */
export function cartToIso(cx: number, cy: number): { x: number; y: number } {
  return {
    x: (cx - cy) * (TILE_W / 2),
    y: (cx + cy) * (TILE_H / 2),
  };
}

/** Convert isometric screen position back to cartesian tile (col, row). */
export function isoToCart(ix: number, iy: number): { x: number; y: number } {
  return {
    x: (ix / (TILE_W / 2) + iy / (TILE_H / 2)) / 2,
    y: (iy / (TILE_H / 2) - ix / (TILE_W / 2)) / 2,
  };
}

/** Snap a fractional tile position to the nearest integer tile. */
export function snapToTile(cx: number, cy: number): { x: number; y: number } {
  return { x: Math.round(cx), y: Math.round(cy) };
}

/** Get the center screen position of a tile. */
export function tileCenterIso(
  col: number,
  row: number
): { x: number; y: number } {
  return cartToIso(col + 0.5, row + 0.5);
}
