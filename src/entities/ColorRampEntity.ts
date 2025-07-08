import { BlendMode } from './BlendModeEntity';
import { ColorSwatch } from './ColorSwatchEntity';

export type ColorFormat = 'hex' | 'hsl' | 'oklch';

export interface ColorRampConfig {
  id: string;
  name: string;
  baseColor: string;
  colorFormat: ColorFormat; // Make required, not optional
  totalSteps: number;
  lightnessRange: number;
  lightnessStart?: number;
  lightnessEnd?: number;
  lightnessAdvanced?: boolean;
  chromaRange: number;
  chromaStart?: number;
  chromaEnd?: number;
  chromaAdvanced?: boolean;
  saturationRange: number;
  saturationStart?: number;
  saturationEnd?: number;
  saturationAdvanced?: boolean;
  tintColor?: string;
  tintOpacity?: number;
  tintBlendMode?: BlendMode;
  swatches: ColorSwatch[];
  lightnessScaleType?: string;
  hueScaleType?: string;
  saturationScaleType?: string;
} 