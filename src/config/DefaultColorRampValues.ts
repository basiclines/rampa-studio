import { ColorFormat } from '@/entities/ColorRampEntity';

export const DEFAULT_COLOR_RAMP_VALUES = {
  baseColor: '#3b82f6',
  colorFormat: 'hex' as ColorFormat,
  totalSteps: 10,
  lightnessStart: 0,
  lightnessEnd: 100,
  chromaStart: 0,
  chromaEnd: 0,
  saturationStart: 100,
  saturationEnd: 0,
} as const;

export const DEFAULT_NEW_RAMP_VALUES = {
  baseColor: '#6366f1',
  colorFormat: 'hex' as ColorFormat,
  totalSteps: 10,
  lightnessStart: 0,
  lightnessEnd: 100,
  chromaStart: 0,
  chromaEnd: 0,
  saturationStart: 100,
  saturationEnd: 0,
} as const; 