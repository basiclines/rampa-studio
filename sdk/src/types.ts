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
 * RGB components (0-255).
 */
export interface RgbComponents {
  r: number;
  g: number;
  b: number;
}

/**
 * A color result that acts as a hex string but supports format chaining.
 */
export interface ColorResult {
  /** Hex color string */
  hex: string;
  /** RGB components (0-255) */
  rgb: RgbComponents;
  /** Perceptual luminance (0-1) using OKLCH lightness */
  luminance: number;
  /** Format the color as hsl, rgb, oklch, or hex */
  format(fmt: ColorFormat): string;
  /** String coercion returns hex */
  toString(): string;
}

/**
 * A color accessor returned by color space functions.
 * Acts as a string via toString()/valueOf() in the color space's output format.
 * Has .hex(), .hsl(), .rgb(), .oklch() methods for format conversion.
 */
export interface ColorAccessor {
  /** Convert to hex string */
  hex(): string;
  /** Convert to hsl string */
  hsl(): string;
  /** Convert to rgb string */
  rgb(): string;
  /** Convert to oklch string */
  oklch(): string;
  /** Perceptual luminance (0-1) using OKLCH lightness */
  luminance: number;
  /** String coercion returns color in the space's output format */
  toString(): string;
  /** Primitive coercion returns the formatted string */
  valueOf(): string;
}

/**
 * The function signature returned by LinearColorSpace.
 * Call it with a 1-based index to get a color.
 */
export interface LinearColorSpaceFn {
  (index: number): ColorAccessor;
  palette: string[];
  size: number;
}

/**
 * The result object returned by CubeColorSpace.size().
 * Provides multiple ways to access colors:
 * - Per-corner shortcut functions (e.g. r(3), w(5))
 * - tint() for multi-axis lookups
 * - cube() for raw 3D coordinate access
 * - palette for the full color array
 */
export interface CubeColorSpaceResult {
  /** Multi-axis lookup: tint({ r: 3, b: 2 }) */
  tint(query: Record<string, number>): ColorAccessor;
  /** Raw 3D coordinate lookup: cube(x, y, z) */
  cube(x: number, y: number, z: number): ColorAccessor;
  /** Full palette array */
  palette: string[];
  /** Steps per axis */
  size: number;
  /** Per-corner shortcut functions, keyed by constructor key names */
  [key: string]: ((index: number) => ColorAccessor) | string[] | number | ((query: Record<string, number>) => ColorAccessor) | ((x: number, y: number, z: number) => ColorAccessor);
}

/**
 * The result returned by PlaneColorSpace.size().
 * Callable with (saturation, lightness) to look up colors on the 2D plane.
 */
export interface PlaneColorSpaceResult {
  /** Look up a color by 2D coordinates (both 0-based, clamped to size-1) */
  (saturation: number, lightness: number): ColorAccessor;
  /** Full palette array (length = size²) */
  palette: string[];
  /** Steps per axis */
  size: number;
}

// ── Contrast / Lint Types ──────────────────────────────────────────────

export type ContrastMode = 'wcag' | 'apca';

export interface ContrastLevelResult {
  name: string;
  threshold: number;
  pass: boolean;
}

export interface ContrastResult {
  foreground: string;
  background: string;
  mode: ContrastMode;
  /** WCAG ratio (e.g. 4.5) or APCA Lc value (e.g. -104.3) */
  score: number;
  /** Whether at least one level passes */
  pass: boolean;
  /** Per-level pass/fail */
  levels: ContrastLevelResult[];
  /** Warnings from lint rules */
  warnings: string[];
}
