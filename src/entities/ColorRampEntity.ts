import { BlendMode } from './BlendModeEntity';
import { ColorSwatch } from './ColorSwatchEntity';

export type ColorFormat = 'hex' | 'hsl' | 'oklch';

export interface ColorRampConfig {
  id: string;
  name: string;
  baseColor: string;
  colorFormat: ColorFormat;
  totalSteps: number;
  lightnessStart: number;
  lightnessEnd: number;
  chromaStart: number;
  chromaEnd: number;
  saturationStart: number;
  saturationEnd: number;
  tintColor?: string;
  tintOpacity?: number;
  tintBlendMode?: BlendMode;
  swatches: ColorSwatch[];
  lightnessScaleType?: string;
  hueScaleType?: string;
  saturationScaleType?: string;
} 