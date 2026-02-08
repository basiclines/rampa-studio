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

export interface AccessibilityFilter {
  min: number;
  max: number;
  raw: string; // original input for error messages
}

// Resolve a single value (number or label) to an Lc threshold
function resolveValue(val: string): number | null {
  const num = parseFloat(val);
  if (!isNaN(num) && num >= 0) return num;
  const label = val.toLowerCase().trim();
  if (label in LEVEL_ALIASES) return LEVEL_ALIASES[label];
  return null;
}

// Parse the --accessibility value into a filter range.
// Accepts: nothing (all), a number, a label, or a range (15:30, nontext:bold).
export function parseAccessibilityFilter(value: string | undefined): AccessibilityFilter {
  const raw = value ?? '';
  if (!value || value === '' || value === 'true') return { min: 0, max: Infinity, raw };

  // Range syntax: "15:30", "nontext:bold"
  if (value.includes(':')) {
    const [startStr, endStr] = value.split(':');
    const start = resolveValue(startStr);
    const end = resolveValue(endStr);
    if (start === null || end === null) {
      const validLabels = Object.keys(LEVEL_ALIASES).join(', ');
      console.error(`Error: Invalid accessibility range "${value}". Use Lc numbers or labels: ${validLabels}`);
      process.exit(1);
    }
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    return { min: lo, max: hi, raw: value };
  }

  // Single value: treat as minimum threshold (no max)
  const resolved = resolveValue(value);
  if (resolved !== null) return { min: resolved, max: Infinity, raw: value };

  const validLabels = Object.keys(LEVEL_ALIASES).join(', ');
  console.error(`Error: Invalid accessibility filter "${value}". Use a Lc number, label, or range (e.g. 15:30). Labels: ${validLabels}`);
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
