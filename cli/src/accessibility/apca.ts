import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';

export interface ApcaLevel {
  id: string;
  name: string;
  minLc: number;
}

export const APCA_LEVELS: ApcaLevel[] = [
  { id: 'preferred-body', name: 'Preferred body text', minLc: 90 },
  { id: 'body', name: 'Body text', minLc: 75 },
  { id: 'large', name: 'Large text', minLc: 60 },
  { id: 'large-bold', name: 'Large/bold text', minLc: 45 },
  { id: 'min-text', name: 'Minimum text', minLc: 30 },
  { id: 'non-text', name: 'Non-text', minLc: 15 },
];

// Compute APCA Lc contrast. Positive = dark text on light bg, negative = light text on dark bg.
export function computeApca(fgHex: string, bgHex: string): number {
  const [fgR, fgG, fgB] = chroma(fgHex).rgb();
  const [bgR, bgG, bgB] = chroma(bgHex).rgb();
  return APCAcontrast(sRGBtoY([fgR, fgG, fgB]), sRGBtoY([bgR, bgG, bgB])) as number;
}

// Return all APCA levels that this contrast value passes (using absolute value).
export function getPassingLevels(lc: number): ApcaLevel[] {
  const absLc = Math.abs(lc);
  return APCA_LEVELS.filter(level => absLc >= level.minLc);
}
