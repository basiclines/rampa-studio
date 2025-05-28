
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
  lockedColors: { [index: number]: string };
}
