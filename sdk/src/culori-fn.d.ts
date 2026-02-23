declare module 'culori/fn' {
  export interface Oklch { mode: 'oklch'; l: number; c: number; h?: number; alpha?: number; }
  export interface Rgb { mode: 'rgb'; r: number; g: number; b: number; alpha?: number; }
  export function useMode(mode: any): (color: any) => any;
  export const modeOklch: any;
  export const modeRgb: any;
  export function formatHex(color: any): string;
  export function formatRgb(color: any): string;
  export function parse(color: string): any;
  export function inGamut(mode: string): (color: any) => boolean;
  export function toGamut(mode: string, jnd?: number | string): (color: any) => any;
}
