import { generateLinearSpace } from '../../src/engine/ColorSpaceEngine';
import { createColorResult } from './color-result';
import type { InterpolationMode, LinearColorSpaceFn, ColorResult } from './types';

/**
 * Create a linear color space.
 *
 * Two modes:
 * 1. Interpolated: two colors + .size(n) → generates n intermediate colors
 * 2. Lookup table: array of colors, no interpolation
 *
 * @example
 * ```ts
 * // Interpolated
 * const neutral = new LinearColorSpace('#ffffff', '#000000').size(24);
 * neutral(12)               // → ColorResult (mid gray)
 * neutral(12).format('hsl') // → 'hsl(...)'
 *
 * // Lookup table (no interpolation)
 * const base = new LinearColorSpace(['#000', '#f00', '#0f0', ...]);
 * base(1)                   // → first color
 * base(3)                   // → third color
 * ```
 */
export class LinearColorSpace {
  private _colors: string[] | null = null;
  private _from: string = '';
  private _to: string = '';
  private _interpolation: InterpolationMode | false;

  constructor(colorsOrFrom: string[] | string, to?: string, options?: { interpolation?: InterpolationMode | false }) {
    if (Array.isArray(colorsOrFrom)) {
      // Lookup table mode — array of pre-defined colors
      this._colors = colorsOrFrom;
      this._interpolation = false;
    } else {
      this._from = colorsOrFrom;
      this._to = to!;
      this._interpolation = options?.interpolation ?? 'oklch';
    }
  }

  /**
   * Set the number of color steps and return the color accessor function.
   * Not needed for lookup table mode (array constructor).
   */
  size(steps: number): LinearColorSpaceFn {
    if (this._colors) {
      throw new Error('size() is not needed for lookup table mode — colors are already defined');
    }
    if (this._interpolation === false) {
      throw new Error('interpolation: false requires an array of colors, not from/to');
    }
    const palette = generateLinearSpace(this._from, this._to, steps, this._interpolation);
    return buildFn(palette);
  }
}

function buildFn(palette: string[]): LinearColorSpaceFn {
  const fn = ((index: number): ColorResult => {
    const i = Math.max(1, Math.min(palette.length, index)) - 1;
    return createColorResult(palette[i]);
  }) as LinearColorSpaceFn;

  fn.palette = palette;
  fn.size = palette.length;

  return fn;
}

/**
 * Shorthand: create a lookup table LinearColorSpaceFn from an array of colors.
 * Equivalent to `new LinearColorSpace(colors)` but returns the function directly.
 */
export function colorTable(colors: string[]): LinearColorSpaceFn {
  return buildFn([...colors]);
}
