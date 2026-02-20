export type ColorFormat = 'hex' | 'hsl' | 'rgb' | 'oklch';

export type ScaleType =
  | 'linear'
  | 'geometric'
  | 'fibonacci'
  | 'golden-ratio'
  | 'logarithmic'
  | 'powers-of-2'
  | 'musical-ratio'
  | 'cielab-uniform'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';

export type BlendMode =
  | 'normal'
  | 'darken'
  | 'multiply'
  | 'plus-darker'
  | 'color-burn'
  | 'lighten'
  | 'screen'
  | 'plus-lighter'
  | 'color-dodge'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type HarmonyType =
  | 'complementary'
  | 'triadic'
  | 'analogous'
  | 'split-complementary'
  | 'square'
  | 'compound';

export interface RampResult {
  name: string;
  baseColor: string;
  colors: string[];
}

export interface RampaResult {
  ramps: RampResult[];
}

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  oklch: { l: number; c: number; h: number };
}

// ── Color Space Types ──────────────────────────────────────────────────

export type InterpolationMode = 'oklch' | 'lab' | 'rgb';

export interface ColorSpaceOptions {
  interpolation?: InterpolationMode;
}

/**
 * A color result that acts as a hex string but supports format chaining.
 */
export interface ColorResult {
  /** Hex color string */
  hex: string;
  /** Format the color as hsl, rgb, oklch, or hex */
  format(fmt: ColorFormat): string;
  /** String coercion returns hex */
  toString(): string;
}

/**
 * The function signature returned by LinearColorSpace.
 * Call it with a 1-based index to get a color.
 */
export interface LinearColorSpaceFn {
  (index: number): ColorResult;
  palette: string[];
  size: number;
}

/**
 * The function signature returned by CubeColorSpace.
 * Call it with an object of { alias: intensity } to get a color.
 */
export interface CubeColorSpaceFn {
  (query: Record<string, number>): ColorResult;
  palette: string[];
  size: number;
}
