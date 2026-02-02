export const BLEND_MODES = [
  'normal',
  'darken',
  'multiply',
  'plus-darker',
  'color-burn',
  'lighten',
  'screen',
  'plus-lighter',
  'color-dodge',
  'overlay',
  'soft-light',
  'hard-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
] as const;

export type BlendMode = (typeof BLEND_MODES)[number];

export function isValidBlendMode(value: string): value is BlendMode {
  return BLEND_MODES.includes(value as BlendMode);
}

export function getBlendModesHelp(): string {
  return BLEND_MODES.join(', ');
}
