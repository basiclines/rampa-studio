import { generateLinearSpace } from '../../src/engine/ColorSpaceEngine';
import { createColorResult } from './color-result';
import type { InterpolationMode, LinearColorSpaceFn, ColorResult } from './types';

/**
 * Create a linear color space.
 *
 * @example
 * ```ts
 * // Interpolated (default: oklch)
 * const neutral = new LinearColorSpace('#ffffff', '#000000').size(24);
 * neutral(12)                // → ColorResult (mid gray)
 * neutral(12).format('hsl')  // → 'hsl(...)'
 *
 * // Different interpolation
 * const ramp = new LinearColorSpace('#ff0000', '#0000ff').interpolation('lab').size(10);
 *
 * // Lookup table — no interpolation, just a plain color array
 * const base = new LinearColorSpace('#000', '#f00', '#0f0', '#ff0', '#00f', '#f0f', '#0ff', '#fff')
 *   .interpolation(false)
 *   .size(8);
 * base(1)  // → first color
 * base(3)  // → third color
 * ```
 */
export class LinearColorSpace {
  private _colors: string[];
  private _interpolation: InterpolationMode | false = 'oklch';

  constructor(...colors: string[]) {
    if (colors.length < 2) {
      throw new Error('LinearColorSpace requires at least 2 colors');
    }
    this._colors = colors;
  }

  /**
   * Set the interpolation mode.
   * Pass false for a plain lookup table (no interpolation).
   */
  interpolation(mode: InterpolationMode | false): this {
    this._interpolation = mode;
    return this;
  }

  /**
   * Set the number of color steps and return the color accessor function.
   */
  size(steps: number): LinearColorSpaceFn {
    let palette: string[];

    if (this._interpolation === false) {
      // Lookup table — use the input colors directly
      palette = [...this._colors];
    } else {
      // Interpolated — generate between first and last color
      palette = generateLinearSpace(
        this._colors[0],
        this._colors[this._colors.length - 1],
        steps,
        this._interpolation
      );
    }

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
