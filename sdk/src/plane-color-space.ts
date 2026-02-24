import { generatePlaneSpace } from '../../src/engine/ColorSpaceEngine';
import { createColorAccessor, validateSameFormat } from './color-result';
import chroma from 'chroma-js';
import type { ColorFormat, InterpolationMode, PlaneColorSpaceResult, ColorAccessor } from './types';

/**
 * Create a 2D color plane from dark, light, and hue anchors.
 *
 * The plane interpolates between 4 corners:
 *   (0,0) = dark    — origin (bottom-left)
 *   (1,0) = dark    — saturation has no effect at lightness=0
 *   (0,1) = light   — achromatic light (top-left)
 *   (1,1) = hue     — full chromatic color (top-right)
 *
 * Create one plane per hue, reusing the same dark/light anchors:
 *
 * @example
 * ```ts
 * const red  = new PlaneColorSpace('#1e1e2e', '#cdd6f4', '#f38ba8').size(6);
 * const blue = new PlaneColorSpace('#1e1e2e', '#cdd6f4', '#89b4fa').size(6);
 *
 * red(3, 5)     // → ColorAccessor (saturation=3, lightness=5)
 * red(0, 3)     // → achromatic at lightness 3
 * red.palette   // → string[36] (6²)
 *
 * // With different interpolation or output format:
 * new PlaneColorSpace(dark, light, hue).interpolation('lab').format('rgb').size(8);
 * ```
 */
export class PlaneColorSpace {
  private _dark: string;
  private _light: string;
  private _hue: string;
  private _interpolation: InterpolationMode;
  private _format: ColorFormat = 'hex';

  constructor(dark: string, light: string, hue: string) {
    validateSameFormat([dark, light, hue]);
    // Normalize to hex for internal computation
    this._dark = chroma(dark).hex();
    this._light = chroma(light).hex();
    this._hue = chroma(hue).hex();
    this._interpolation = 'oklch';
  }

  interpolation(mode: InterpolationMode): this {
    this._interpolation = mode;
    return this;
  }

  format(fmt: ColorFormat): this {
    this._format = fmt;
    return this;
  }

  size(stepsPerAxis: number): PlaneColorSpaceResult {
    const palette = generatePlaneSpace(
      this._dark,
      this._light,
      this._hue,
      stepsPerAxis,
      this._interpolation
    );

    const fmt = this._format;

    const lookup = (saturation: number, lightness: number): ColorAccessor => {
      const sx = Math.max(0, Math.min(stepsPerAxis - 1, saturation));
      const ly = Math.max(0, Math.min(stepsPerAxis - 1, lightness));
      const idx = sx * stepsPerAxis + ly;
      return createColorAccessor(palette[idx], fmt);
    };

    const result = lookup as PlaneColorSpaceResult;
    Object.defineProperties(result, {
      palette: { value: palette, enumerable: true },
      size: { value: stepsPerAxis, enumerable: true },
    });

    return result;
  }
}
