import { generateLinearSpace } from '../../src/engine/ColorSpaceEngine';
import { createColorAccessor, validateSameFormat } from './color-result';
import chroma from 'chroma-js';
import type { ColorFormat, InterpolationMode, LinearColorSpaceFn, ColorAccessor } from './types';

/**
 * Create a linear color space.
 * All input colors must use the same format.
 *
 * @example
 * ```ts
 * // Interpolated (default: oklch)
 * const neutral = new LinearColorSpace('#ffffff', '#000000').size(24);
 * neutral(12)                // → "#808080" (string in output format)
 * neutral(12).hsl()          // → "hsl(...)" (convert to another format)
 *
 * // Different interpolation and output format:
 * const ramp = new LinearColorSpace('#ff0000', '#0000ff').interpolation('lab').format('rgb').size(10);
 * ramp(5)                    // → "rgb(128, 0, 128)"
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
  private _format: ColorFormat = 'hex';

  constructor(...colors: string[]) {
    if (colors.length < 2) {
      throw new Error('LinearColorSpace requires at least 2 colors');
    }
    validateSameFormat(colors);
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
   * Set the output color format (default: 'hex').
   */
  format(fmt: ColorFormat): this {
    this._format = fmt;
    return this;
  }

  /**
   * Set the number of color steps and return the color accessor function.
   */
  size(steps: number): LinearColorSpaceFn {
    let palette: string[];
    const outputFormat = this._format;

    if (this._interpolation === false) {
      // Lookup table — convert input colors to hex for internal storage
      palette = this._colors.map(c => chroma(c).hex());
    } else {
      // Interpolated — convert to hex, generate between first and last color
      const firstHex = chroma(this._colors[0]).hex();
      const lastHex = chroma(this._colors[this._colors.length - 1]).hex();
      palette = generateLinearSpace(firstHex, lastHex, steps, this._interpolation);
    }

    return buildFn(palette, outputFormat);
  }
}

function buildFn(palette: string[], outputFormat: ColorFormat): LinearColorSpaceFn {
  const fn = ((index: number): ColorAccessor => {
    const i = Math.max(1, Math.min(palette.length, index)) - 1;
    return createColorAccessor(palette[i], outputFormat);
  }) as LinearColorSpaceFn;

  fn.palette = palette;
  fn.size = palette.length;

  return fn;
}
