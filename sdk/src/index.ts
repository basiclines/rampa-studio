import { RampaBuilder, createRampaFn } from './builder';
import { LinearColorSpace } from './linear-color-space';
import { CubeColorSpace } from './cube-color-space';
import { PlaneColorSpace } from './plane-color-space';
import { createColor } from './color-result';
import { lint, LintBuilder } from './lint';
import { mixColors } from '../../src/usecases/MixColors';
import type {
  ColorFormat,
  OutputMode,
  ScaleType,
  BlendMode,
  HarmonyType,
  RampResult,
  RampaResult,
  RampaFn,
  RampaOutputFormat,
  ColorInfo,
  InterpolationMode,
  Color,
  ColorAccessor,
  RgbComponents,
  LinearColorSpaceFn,
  CubeColorSpaceResult,
  PlaneColorSpaceResult,
  ColorSpaceOptions,
  ContrastMode,
  ContrastLevelResult,
  ContrastResult,
  LintResult,
  OklchSetValues,
} from './types';

/**
 * Create a new color ramp from a base color.
 * Returns a callable palette — use `palette(n)` to access colors by 1-based index.
 * All methods are chainable in any order.
 *
 * @example
 * ```ts
 * import { rampa } from '@basiclines/rampa-sdk';
 *
 * const palette = rampa('#3b82f6').size(10).lightness(10, 90);
 * palette(1)           // first color (ColorAccessor)
 * palette(5).oklch()   // format conversion
 * palette.palette      // all colors as string[]
 *
 * // Backward compatible
 * const palette = rampa('#3b82f6').size(5);
 * ```
 */
export function rampa(baseColor: string): RampaFn {
  return createRampaFn(new RampaBuilder(baseColor));
}

/**
 * Convert a color string to a different format.
 */
rampa.convert = function convert(colorStr: string, format: ColorFormat): string {
  return createColor(colorStr).format(format);
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

/**
 * Inspect a single color — get all format representations, format conversion, and export.
 *
 * @example
 * ```ts
 * import { color } from '@basiclines/rampa-sdk';
 *
 * const c = color('#fe0000');
 * c.hex              // '#fe0000'
 * c.rgb              // { r: 254, g: 0, b: 0 }
 * c.hsl              // { h: 0, s: 100, l: 50 }
 * c.oklch            // { l: 62.8, c: 0.258, h: 29 }
 * c.luminance        // 0.628
 * c.format('hsl')    // 'hsl(0, 100%, 50%)'
 * c.output('json')   // JSON with all formats
 * c.output('css', 'brand')  // CSS custom properties
 * `${c}`             // '#fe0000'
 * ```
 */
export function color(input: string): Color {
  return createColor(input);
}

export { lint, RampaBuilder, createRampaFn, LintBuilder, LinearColorSpace, CubeColorSpace, PlaneColorSpace };
export { palette } from './palette';
export type { PaletteEntry, PaletteResult, PaletteOptions, RawOptions, DominantOptions, AnsiOptions } from './palette';
export type {
  ColorFormat,
  OutputMode,
  ScaleType,
  BlendMode,
  HarmonyType,
  RampResult,
  RampaResult,
  RampaFn,
  RampaOutputFormat,
  ColorInfo,
  InterpolationMode,
  Color,
  ColorAccessor,
  RgbComponents,
  LinearColorSpaceFn,
  CubeColorSpaceResult,
  PlaneColorSpaceResult,
  ColorSpaceOptions,
  ContrastMode,
  ContrastLevelResult,
  ContrastResult,
  LintResult,
  OklchSetValues,
};
