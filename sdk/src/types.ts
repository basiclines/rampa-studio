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
