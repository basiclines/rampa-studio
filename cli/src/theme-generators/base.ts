import type { ThemeYAML, ThemeColors } from '../theme-schema';

export interface ThemeGenerator {
  name: string;
  generate(theme: ThemeYAML): string;
  installPath(os: 'darwin' | 'linux' | 'win32'): string | null;
  fileExtension(): string;
  /** Optional note shown when there is no installPath (e.g. manual paste required). */
  hint?: string;
}

export function themeFileName(theme: ThemeYAML, ext: string): string {
  return theme.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + ext;
}

/** Hex to [r, g, b] 0-255 */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Hex to [r, g, b] 0.0-1.0 */
export function hexToRgbFloat(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return [r / 255, g / 255, b / 255];
}

/** All ANSI colors as ordered array [black..brightWhite] */
export function ansiArray(c: ThemeColors): string[] {
  return [
    c.black, c.red, c.green, c.yellow, c.blue, c.magenta, c.cyan, c.white,
    c.brightBlack, c.brightRed, c.brightGreen, c.brightYellow,
    c.brightBlue, c.brightMagenta, c.brightCyan, c.brightWhite,
  ];
}
