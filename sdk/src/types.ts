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

/**
 * OKLCH values for absolute color setting via .set().
 */
export interface OklchSetValues {
  /** Lightness (0-1) */
  lightness?: number;
  /** Chroma (0-0.4) */
  chroma?: number;
  /** Hue (0-360) */
  hue?: number;
}

/**
 * A color primitive with all format representations and export support.
 * Returned by the standalone `color()` function.
 *
 * All transforms are OKLCH-based and return a new immutable Color.
 */
export interface Color {
  /** Hex color string */
  hex: string;
  /** RGB components (r: 0-255, g: 0-255, b: 0-255) */
  rgb: { r: number; g: number; b: number };
  /** HSL components (h: 0-360, s: 0-1, l: 0-1) */
  hsl: { h: number; s: number; l: number };
  /** OKLCH components (l: 0-1, c: 0-0.4, h: 0-360) */
  oklch: { l: number; c: number; h: number };
  /** Perceptual luminance (0-1), same as oklch.l */
  luminance: number;

  // ── Transforms (OKLCH, return new Color) ──────────────

  /** Increase OKLCH lightness by delta (0-1 scale). Returns new Color. */
  lighten(delta: number): Color;
  /** Decrease OKLCH lightness by delta (0-1 scale). Sugar for lighten(-delta). Returns new Color. */
  darken(delta: number): Color;
  /** Increase OKLCH chroma by delta (0-0.4 scale). Returns new Color. */
  saturate(delta: number): Color;
  /** Decrease OKLCH chroma by delta (0-0.4 scale). Sugar for saturate(-delta). Returns new Color. */
  desaturate(delta: number): Color;
  /** Rotate OKLCH hue by degrees. Returns new Color. */
  rotate(degrees: number): Color;
  /** Set absolute OKLCH values. Returns new Color. */
  set(values: OklchSetValues): Color;
  /** Mix with another color via color space interpolation. Returns new Color. */
  mix(target: string, ratio: number, space?: InterpolationMode): Color;
  /** Blend with another color using a compositing mode. Returns new Color. */
  blend(target: string, opacity: number, mode: BlendMode): Color;

  // ── Format & Output ───────────────────────────────────

  /** Format the color as a string in the given format */
  format(fmt: ColorFormat): string;
  /** Export as css, json, or text. Optional prefix for CSS variable names. */
  output(format: RampaOutputFormat, prefix?: string): string;
  /** String coercion returns hex */
  toString(): string;
}

// ── Color Space Types ──────────────────────────────────────────────────

export type InterpolationMode = 'oklch' | 'lab' | 'rgb' | 'srgb';

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

export type OutputMode = 'css' | 'json';

export type RampaOutputFormat = 'css' | 'json' | 'text';

/**
 * Callable palette returned by `rampa()`.
 * Call with a 1-based index to get a color, or use builder methods to configure.
 * All builder methods return the same callable for chaining in any order.
 */
export interface RampaFn {
  /** Access a color by 1-based index from the base ramp */
  (index: number): ColorAccessor;
  /** Number of colors in the palette (2-100, default: 10) */
  size(steps: number): RampaFn;
  /** Color format for output: hex, hsl, rgb, oklch (default: hex) */
  format(fmt: ColorFormat): RampaFn;
  /** Lightness range 0-100 (default: 0, 100) */
  lightness(start: number, end: number): RampaFn;
  /** Saturation range 0-100 (default: 100, 0) */
  saturation(start: number, end: number): RampaFn;
  /** Hue shift in degrees (default: -10, 10) */
  hue(start: number, end: number): RampaFn;
  /** Lightness distribution curve */
  lightnessDistribution(scale: ScaleType): RampaFn;
  /** Saturation distribution curve */
  saturationDistribution(scale: ScaleType): RampaFn;
  /** Hue distribution curve */
  hueDistribution(scale: ScaleType): RampaFn;
  /** Apply a tint color over the palette */
  tint(color: string, opacity: number, blend?: BlendMode): RampaFn;
  /** Add a harmony ramp */
  add(type: HarmonyType): RampaFn;
  add(type: 'shift', degrees: number): RampaFn;
  /** Export as css, json, or text. Optional prefix for variable names. */
  output(format: RampaOutputFormat, prefix?: string): string;
  /** Colors of the base ramp */
  palette: string[];
  /** All ramps (base + harmonies) */
  ramps: RampResult[];
}

/**
 * The function signature returned by LinearColorSpace.
 * Call it with a 1-based index to get a color.
 */
export interface LinearColorSpaceFn {
  (index: number): ColorAccessor;
  palette: string[];
  size: number;
  /** Export as css, json, or text. Optional prefix for variable names. */
  output(format: RampaOutputFormat, prefix?: string): string;
  /** Get a Color at a 0-based index. Returns a full Color with transforms. */
  at(index: number): Color;
  /** Get all colors as Color objects. */
  colors(): Color[];
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
  /** Export as css, json, or text. Optional prefix for variable names. */
  output(format: RampaOutputFormat, prefix?: string): string;
  /** Get a Color at 3D coordinates (0-based). Returns a full Color with transforms. */
  at(x: number, y: number, z: number): Color;
  /** Get all colors as Color objects. */
  colors(): Color[];
  /** Per-corner shortcut functions, keyed by constructor key names */
  [key: string]: ((index: number) => ColorAccessor) | string[] | number | ((query: Record<string, number>) => ColorAccessor) | ((x: number, y: number, z: number) => ColorAccessor) | ((x: number, y: number, z: number) => Color) | ((format: RampaOutputFormat, prefix?: string) => string) | (() => Color[]);
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
  /** Export as css, json, or text. Optional prefix for variable names. */
  output(format: RampaOutputFormat, prefix?: string): string;
  /** Get a Color at 2D coordinates (0-based). Returns a full Color with transforms. */
  at(saturation: number, lightness: number): Color;
  /** Get all colors as Color objects. */
  colors(): Color[];
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

/**
 * The lint primitive interface with chainable mode and output support.
 */
export interface LintResult {
  /** Normalized foreground hex */
  foreground: string;
  /** Normalized background hex */
  background: string;
  /** Contrast score (APCA Lc or WCAG ratio) */
  score: number;
  /** Whether at least one level passes */
  pass: boolean;
  /** Per-level pass/fail details */
  levels: ContrastLevelResult[];
  /** Lint warnings (near-identical, low contrast, pure B/W) */
  warnings: string[];
  /** Switch contrast algorithm. Returns a new LintResult. */
  mode(m: ContrastMode): LintResult;
  /** Export as css, json, or text */
  output(format: RampaOutputFormat): string;
  /** Return the raw ContrastResult for serialization */
  toJSON(): ContrastResult;
}
