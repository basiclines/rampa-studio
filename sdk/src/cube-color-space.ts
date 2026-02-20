import { generateCubeSpace } from '../../src/engine/ColorSpaceEngine';
import { createColorResult } from './color-result';
import type { InterpolationMode, CubeColorSpaceFn, ColorResult } from './types';

// The 8 cube corner positions in binary order.
// Constructor keys map to these positions by their insertion order.
const CORNER_MASKS: { x: number; y: number; z: number }[] = [
  { x: 0, y: 0, z: 0 }, // 1st key → origin
  { x: 1, y: 0, z: 0 }, // 2nd key → x
  { x: 0, y: 1, z: 0 }, // 3rd key → y
  { x: 0, y: 0, z: 1 }, // 4th key → z
  { x: 1, y: 1, z: 0 }, // 5th key → xy
  { x: 1, y: 0, z: 1 }, // 6th key → xz
  { x: 0, y: 1, z: 1 }, // 7th key → yz
  { x: 1, y: 1, z: 1 }, // 8th key → xyz
];

/**
 * Create a 3D color cube from 8 named corner colors.
 *
 * The constructor keys become alias names for tint() lookups.
 * Key order determines cube position (see CORNER_MASKS above).
 *
 * @example
 * ```ts
 * const tint = new CubeColorSpace({
 *   k: '#1e1e2e', r: '#f38ba8', g: '#a6e3a1', b: '#89b4fa',
 *   y: '#f9e2af', m: '#cba6f7', c: '#94e2d5', w: '#cdd6f4',
 * }).size(6);
 *
 * tint({ r: 4, b: 2 })  // → ColorResult
 * tint({ w: 3 })         // → ColorResult
 * tint.palette            // → string[216]
 * ```
 */
export class CubeColorSpace {
  private _corners: Record<string, string>;
  private _interpolation: InterpolationMode;

  constructor(corners: Record<string, string>, options?: { interpolation?: InterpolationMode }) {
    const keys = Object.keys(corners);
    if (keys.length !== 8) {
      throw new Error(`CubeColorSpace requires exactly 8 corner colors, got ${keys.length}`);
    }
    this._corners = corners;
    this._interpolation = options?.interpolation ?? 'oklch';
  }

  /**
   * Set the steps per axis and return the color accessor function.
   */
  size(stepsPerAxis: number): CubeColorSpaceFn {
    const keys = Object.keys(this._corners);
    const cornerColors = keys.map(k => this._corners[k]) as
      [string, string, string, string, string, string, string, string];

    // Build alias → mask mapping from key order
    const aliases: Record<string, { x: number; y: number; z: number }> = {};
    for (let i = 0; i < 8; i++) {
      aliases[keys[i]] = CORNER_MASKS[i];
    }

    const palette = generateCubeSpace(cornerColors, stepsPerAxis, this._interpolation);
    const max = stepsPerAxis - 1;

    const fn = ((query: Record<string, number>): ColorResult => {
      let cx = 0, cy = 0, cz = 0;

      for (const [key, intensity] of Object.entries(query)) {
        const mask = aliases[key];
        if (!mask) continue;
        cx = Math.max(cx, mask.x * intensity);
        cy = Math.max(cy, mask.y * intensity);
        cz = Math.max(cz, mask.z * intensity);
      }

      // Clamp to valid range
      cx = Math.max(0, Math.min(max, Math.round(cx)));
      cy = Math.max(0, Math.min(max, Math.round(cy)));
      cz = Math.max(0, Math.min(max, Math.round(cz)));

      const index = cx * stepsPerAxis * stepsPerAxis + cy * stepsPerAxis + cz;
      return createColorResult(palette[index]);
    }) as CubeColorSpaceFn;

    fn.palette = palette;
    fn.size = stepsPerAxis;

    return fn;
  }
}
