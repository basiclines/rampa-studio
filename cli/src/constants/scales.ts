export const SCALE_TYPES = [
  'linear',
  'geometric',
  'fibonacci',
  'golden-ratio',
  'logarithmic',
  'powers-of-2',
  'musical-ratio',
  'cielab-uniform',
  'ease-in',
  'ease-out',
  'ease-in-out',
] as const;

export type ScaleType = (typeof SCALE_TYPES)[number];

export function isValidScaleType(value: string): value is ScaleType {
  return SCALE_TYPES.includes(value as ScaleType);
}

export function getScaleTypesHelp(): string {
  return SCALE_TYPES.join(', ');
}
