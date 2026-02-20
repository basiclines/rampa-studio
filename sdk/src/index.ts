import chroma from 'chroma-js';
import { RampaBuilder } from './builder';
import { ReadOnlyBuilder } from './read-only';
import { LinearColorSpace, colorTable } from './linear-color-space';
import { CubeColorSpace } from './cube-color-space';
import { mixColors } from '../../src/usecases/MixColors';
import type {
  ColorFormat,
  ScaleType,
  BlendMode,
  HarmonyType,
  RampResult,
  RampaResult,
  ColorInfo,
  InterpolationMode,
  ColorResult,
  LinearColorSpaceFn,
  CubeColorSpaceFn,
  ColorSpaceOptions,
} from './types';

/**
 * Create a new color ramp builder from a base color.
 *
 * @example
 * ```ts
 * import { rampa } from '@basiclines/rampa-sdk';
 *
 * const result = rampa('#3b82f6').size(10).generate();
 * const css = rampa('#3b82f6').add('complementary').toCSS();
 * ```
 */
export function rampa(baseColor: string): RampaBuilder {
  return new RampaBuilder(baseColor);
}

/**
 * Convert a color string to a different format.
 */
rampa.convert = function convert(color: string, format: ColorFormat): string {
  const c = chroma(color);
  switch (format) {
    case 'hsl': {
      const [h, s, l] = c.hsl();
      return `hsl(${Math.round(h || 0)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }
    case 'rgb': {
      const [r, g, b] = c.rgb();
      return `rgb(${r}, ${g}, ${b})`;
    }
    case 'oklch': {
      const [l, ch, h] = c.oklch();
      return `oklch(${(l * 100).toFixed(1)}% ${ch.toFixed(3)} ${Math.round(h || 0)})`;
    }
    default:
      return c.hex();
  }
};

/**
 * Read a color without generating a ramp (equivalent to --read-only in the CLI).
 *
 * @example
 * ```ts
 * rampa.readOnly('#fe0000').generate();              // ColorInfo with all formats
 * rampa.readOnly('#fe0000').format('hsl').generate(); // 'hsl(0, 100%, 50%)'
 * ```
 */
rampa.readOnly = function readOnly(color: string): ReadOnlyBuilder {
  return new ReadOnlyBuilder(color);
};

/**
 * Mix two colors in OKLCH space at a given ratio.
 * Produces perceptually uniform transitions — hues travel the color wheel,
 * lightness steps look even, chroma stays vivid.
 *
 * @param color1 - Start color (any CSS color string)
 * @param color2 - End color (any CSS color string)
 * @param t - Mix ratio from 0 (100% color1) to 1 (100% color2)
 * @returns Hex color string
 *
 * @example
 * ```ts
 * rampa.mix('#ff0000', '#0000ff', 0.5);  // midpoint between red and blue
 * rampa.mix('#000000', '#ffffff', 0.25); // 25% toward white
 * ```
 */
rampa.mix = function mix(color1: string, color2: string, t: number): string {
  return mixColors(color1, color2, t);
};

export { RampaBuilder, ReadOnlyBuilder, LinearColorSpace, CubeColorSpace, colorTable };
export type {
  ColorFormat,
  ScaleType,
  BlendMode,
  HarmonyType,
  RampResult,
  RampaResult,
  ColorInfo,
  InterpolationMode,
  ColorResult,
  LinearColorSpaceFn,
  CubeColorSpaceFn,
  ColorSpaceOptions,
};
