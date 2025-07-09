import { ColorFormat } from '@/entities/ColorRampEntity';

export const DEFAULT_COLOR_RAMP_VALUES = {
  baseColor: '#3b82f6',
  colorFormat: 'hex' as ColorFormat,
  totalSteps: 10,
  lightnessRange: 100,
  chromaRange: 0,
  saturationRange: 100,
} as const;

export const DEFAULT_NEW_RAMP_VALUES = {
  baseColor: '#6366f1',
  colorFormat: 'hex' as ColorFormat,
  totalSteps: 10,
  lightnessRange: 100,
  chromaRange: 0,
  saturationRange: 100,
} as const; 