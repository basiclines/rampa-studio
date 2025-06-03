import { BlendMode } from './BlendMode';
import { ColorSwatch } from './ColorSwatch';

export interface ColorRampConfig {
  id: string;
  name: string;
  baseColor: string;
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
  colorFormat?: 'hex' | 'hsl';
} 