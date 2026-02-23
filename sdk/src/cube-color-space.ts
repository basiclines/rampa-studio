import { generateCubeSpace } from '../../src/engine/ColorSpaceEngine';
import { createColorAccessor, validateSameFormat } from './color-result';
import chroma from 'chroma-js';
import type { ColorFormat, InterpolationMode, CubeColorSpaceResult, ColorAccessor } from './types';

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
 * The constructor keys become shortcut function names and tint() aliases.
 * Key order determines cube position (see CORNER_MASKS above).
 * All input colors must use the same format.
 *
 * @example
 * ```ts
 * const space = new CubeColorSpace({
 *   k: '#1e1e2e', r: '#f38ba8', g: '#a6e3a1', b: '#89b4fa',
 *   y: '#f9e2af', m: '#cba6f7', c: '#94e2d5', w: '#cdd6f4',
 * }).size(6);
 *
 * // With different interpolation or output format:
 * const space2 = new CubeColorSpace({ ... }).interpolation('lab').format('rgb').size(6);
 *
 * space.r(4)                 // → "f38ba8" (string in output format)
 * space.r(4).hsl()           // → "hsl(...)" (convert to another format)
 * space.tint({ r: 3, b: 2 }) // → string in output format
 * space.cube(3, 0, 2)        // → string in output format
 * space.palette               // → string[216]
 *
 * // Destructure for convenience:
 * const { r, w, tint, cube } = space;
 * ```
 */
export class CubeColorSpace {
  private _corners: Record<string, string>;
  private _interpolation: InterpolationMode;
  private _format: ColorFormat = 'hex';

  constructor(corners: Record<string, string>, options?: { interpolation?: InterpolationMode }) {
    const keys = Object.keys(corners);
    if (keys.length !== 8) {
      throw new Error(`CubeColorSpace requires exactly 8 corner colors, got ${keys.length}`);
    }
    validateSameFormat(Object.values(corners));
    this._corners = corners;
    this._interpolation = options?.interpolation ?? 'oklch';
  }

  /**
   * Set the interpolation mode.
   */
  interpolation(mode: InterpolationMode): this {
    this._interpolation = mode;
    return this;
  }

  /**
   * Set the output color format (default: 'hex').
   */
  format(fmt: ColorFormat): this {
    this._format = fmt;
    return this;
  }

  /**
   * Set the steps per axis and return the color space accessor object.
   */
  size(stepsPerAxis: number): CubeColorSpaceResult {
    const keys = Object.keys(this._corners);
    // Convert all input colors to hex for internal computation
    const cornerColors = keys.map(k => chroma(this._corners[k]).hex()) as
      [string, string, string, string, string, string, string, string];
    const outputFormat = this._format;

    // Build alias → mask mapping from key order
    const aliases: Record<string, { x: number; y: number; z: number }> = {};
    for (let i = 0; i < 8; i++) {
      aliases[keys[i]] = CORNER_MASKS[i];
    }

    const palette = generateCubeSpace(cornerColors, stepsPerAxis, this._interpolation);
    const max = stepsPerAxis - 1;

    // Helper: resolve raw (x,y,z) to a ColorAccessor
    const lookup = (cx: number, cy: number, cz: number): ColorAccessor => {
      cx = Math.max(0, Math.min(max, Math.round(cx)));
      cy = Math.max(0, Math.min(max, Math.round(cy)));
      cz = Math.max(0, Math.min(max, Math.round(cz)));
      const index = cx * stepsPerAxis * stepsPerAxis + cy * stepsPerAxis + cz;
      return createColorAccessor(palette[index], outputFormat);
    };

    // tint(): multi-axis alias lookup
    const tint = (query: Record<string, number>): ColorAccessor => {
      let cx = 0, cy = 0, cz = 0;
      for (const [key, intensity] of Object.entries(query)) {
        const mask = aliases[key];
        if (!mask) continue;
        cx = Math.max(cx, mask.x * intensity);
        cy = Math.max(cy, mask.y * intensity);
        cz = Math.max(cz, mask.z * intensity);
      }
      return lookup(cx, cy, cz);
    };

    // cube(): raw 3D coordinate access
    const cube = (x: number, y: number, z: number): ColorAccessor => lookup(x, y, z);

    // Build result object with per-corner shortcut functions
    const result: CubeColorSpaceResult = {
      tint,
      cube,
      palette,
      size: stepsPerAxis,
    };

    // Add per-corner shortcut: e.g. result.r = (index) => tint({ r: index })
    for (const key of keys) {
      result[key] = (index: number): ColorAccessor => tint({ [key]: index });
    }

    return result;
  }
}
