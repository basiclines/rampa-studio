import { RampaBuilder, createRampaFn } from './builder';
import { ReadOnlyBuilder } from './read-only';
import { LinearColorSpace } from './linear-color-space';
import { CubeColorSpace } from './cube-color-space';
import { PlaneColorSpace } from './plane-color-space';
import { createColorResult } from './color-result';
import { contrast, ContrastBuilder } from './contrast';
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
  ColorResult,
  ColorAccessor,
  RgbComponents,
  LinearColorSpaceFn,
  CubeColorSpaceResult,
  PlaneColorSpaceResult,
  ColorSpaceOptions,
  ContrastMode,
  ContrastLevelResult,
  ContrastResult,
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
rampa.convert = function convert(color: string, format: ColorFormat): string {
  return createColorResult(color).format(format);
};

/**
 * Read a color without generating a ramp (equivalent to --read-only in the CLI).
 *
 * @example
 * ```ts
 * rampa.readOnly('#fe0000')              // ColorInfo with all formats
 * rampa.readOnly('#fe0000', 'hsl')       // 'hsl(0, 100%, 50%)'
 * ```
 */
rampa.readOnly = function readOnly(color: string, format?: ColorFormat): ColorInfo | string {
  const builder = new ReadOnlyBuilder(color);
  if (format) builder.format(format);
  return builder.value;
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
 * Evaluate contrast between foreground and background colors.
 * Supports APCA Lc (default) and WCAG 2.x ratio modes.
 *
 * @example
 * ```ts
 * const result = rampa.contrast('#777', '#fff');                    // APCA (default)
 * const result = rampa.contrast('#ffffff', '#1e1e2e').mode('wcag'); // WCAG 2.x
 * result.score    // -104.3 (APCA Lc) or 4.48 (WCAG ratio)
 * result.pass     // true if at least one level passes
 * result.levels   // [{ name, threshold, pass }, ...]
 * result.warnings // lint warnings
 * ```
 */
rampa.contrast = contrast;

/**
 * Create a ColorResult from any hex color string.
 * Provides .hex, .rgb, .luminance, .format() for color inspection.
 *
 * @example
 * ```ts
 * import { color } from '@basiclines/rampa-sdk';
 * const c = color('#ff0000');
 * c.rgb        // { r: 255, g: 0, b: 0 }
 * c.luminance  // 0.627 (OKLCH perceptual lightness)
 * c.format('hsl') // 'hsl(0, 100%, 50%)'
 * ```
 */
export function color(hex: string): ColorResult {
  return createColorResult(hex);
}

export { RampaBuilder, createRampaFn, ReadOnlyBuilder, LinearColorSpace, CubeColorSpace, PlaneColorSpace, ContrastBuilder };
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
  ColorResult,
  ColorAccessor,
  RgbComponents,
  LinearColorSpaceFn,
  CubeColorSpaceResult,
  PlaneColorSpaceResult,
  ColorSpaceOptions,
  ContrastMode,
  ContrastLevelResult,
  ContrastResult,
};
