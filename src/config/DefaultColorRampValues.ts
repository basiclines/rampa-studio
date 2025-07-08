import { ColorFormat } from '@/entities/ColorRampEntity';

export const DEFAULT_COLOR_RAMP_VALUES = {
  baseColor: '#3b82f6',
  colorFormat: 'hex' as ColorFormat,
  totalSteps: 10,
  lightnessRange: 100,
  lightnessAdvanced: false,
  chromaRange: 0,
  chromaAdvanced: false,
  saturationRange: 100,
  saturationAdvanced: false,
} as const;

export const DEFAULT_NEW_RAMP_VALUES = {
  baseColor: '#6366f1',
  colorFormat: 'hex' as ColorFormat,
  totalSteps: 10,
  lightnessRange: 100,
  lightnessAdvanced: false,
  chromaRange: 0,
  chromaAdvanced: false,
  saturationRange: 100,
  saturationAdvanced: false,
} as const; 