export interface RampConfig {
  size: number;
  lightness: { start: number; end: number };
  saturation: { start: number; end: number };
  hue: { start: number; end: number };
  scales: {
    lightness: string;
    saturation: string;
    hue: string;
  };
  tint: {
    color: string;
    opacity: number;
    blend: string;
  } | null;
}

export interface RampOutput {
  name: string;
  baseColor: string;
  config: RampConfig;
  colors: string[];
  rawColors?: string[];
}
