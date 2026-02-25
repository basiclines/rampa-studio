/**
 * ContrastEngine — WCAG 2.x and APCA contrast calculations.
 *
 * WCAG uses relative luminance and a simple ratio formula.
 * APCA uses the apca-w3 library for perceptual contrast (Lc values).
 */

import chroma from 'chroma-js';

// ── WCAG 2.x ─────────────────────────────────────────────────────────

export interface WcagLevel {
  id: string;
  name: string;
  minRatio: number;
}

export const WCAG_LEVELS: WcagLevel[] = [
  { id: 'aaa-normal', name: 'AAA Normal text', minRatio: 7 },
  { id: 'aaa-large',  name: 'AAA Large text',  minRatio: 4.5 },
  { id: 'aa-normal',  name: 'AA Normal text',   minRatio: 4.5 },
  { id: 'aa-large',   name: 'AA Large text',    minRatio: 3 },
];

/**
 * Compute WCAG 2.x relative luminance from linear RGB (0-255).
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Compute WCAG 2.x contrast ratio between two colors.
 * Returns a value >= 1 (always lighter/darker, order-independent).
 */
export function wcagContrastRatio(fgHex: string, bgHex: string): number {
  const [fgR, fgG, fgB] = chroma(fgHex).rgb();
  const [bgR, bgG, bgB] = chroma(bgHex).rgb();
  const l1 = relativeLuminance(fgR, fgG, fgB);
  const l2 = relativeLuminance(bgR, bgG, bgB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Return all WCAG levels that this contrast ratio passes.
 */
export function getWcagPassingLevels(ratio: number): WcagLevel[] {
  return WCAG_LEVELS.filter(level => ratio >= level.minRatio);
}

// ── Shared utilities ─────────────────────────────────────────────────

/**
 * Compute perceptual color difference (CIE deltaE 2000).
 */
export function colorDeltaE(colorA: string, colorB: string): number {
  return chroma.deltaE(colorA, colorB);
}

/**
 * Round a number to 2 decimal places.
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
