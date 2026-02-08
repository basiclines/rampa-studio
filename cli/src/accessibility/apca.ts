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

// Short label aliases for --accessibility filter
export const LEVEL_ALIASES: Record<string, number> = {
  'preferred': 90,
  'body': 75,
  'large': 60,
  'bold': 45,
  'minimum': 30,
  'nontext': 15,
};

// Parse the --accessibility value into a minimum Lc threshold.
// Accepts a number (Lc value) or a label name. Returns 0 for "show all".
export function parseAccessibilityFilter(value: string | undefined): number {
  if (!value || value === '' || value === 'true') return 0;

  const num = parseFloat(value);
  if (!isNaN(num) && num > 0) return num;

  const label = value.toLowerCase().trim();
  if (label in LEVEL_ALIASES) return LEVEL_ALIASES[label];

  const validLabels = Object.keys(LEVEL_ALIASES).join(', ');
  console.error(`Error: Invalid accessibility filter "${value}". Use a Lc number or: ${validLabels}`);
  process.exit(1);
}
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
