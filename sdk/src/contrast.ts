/**
 * contrast() — Evaluate contrast between foreground and background colors.
 *
 * Supports WCAG 2.x ratio and APCA Lc modes.
 * Includes lint warnings for near-identical, low-contrast, and pure B/W.
 */

import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import {
  wcagContrastRatio,
  getWcagPassingLevels,
  WCAG_LEVELS,
  colorDeltaE,
  round2,
} from '../../src/engine/ContrastEngine';
import type { ContrastMode, ContrastResult, ContrastLevelResult } from './types';

// ── APCA levels (mirrored from CLI for standalone SDK use) ───────────

const APCA_LEVELS = [
  { name: 'Preferred body text', threshold: 90 },
  { name: 'Body text',          threshold: 75 },
  { name: 'Large text',         threshold: 60 },
  { name: 'Large/bold text',    threshold: 45 },
  { name: 'Minimum text',       threshold: 30 },
  { name: 'Non-text',           threshold: 15 },
];

// ── Core computation ─────────────────────────────────────────────────

function computeApca(fgHex: string, bgHex: string): number {
  const [fgR, fgG, fgB] = chroma(fgHex).rgb();
  const [bgR, bgG, bgB] = chroma(bgHex).rgb();
  return APCAcontrast(sRGBtoY([fgR, fgG, fgB]), sRGBtoY([bgR, bgG, bgB])) as number;
}

// ── Lint warnings ────────────────────────────────────────────────────

function collectWarnings(fgHex: string, bgHex: string, mode: ContrastMode, score: number): string[] {
  const warnings: string[] = [];

  // Near-identical colors
  const de = colorDeltaE(fgHex, bgHex);
  if (de < 3) {
    warnings.push(`Colors are nearly identical (deltaE: ${round2(de)})`);
  }

  // Low contrast
  if (mode === 'apca' && Math.abs(score) < 15) {
    warnings.push('Contrast is below minimum usable threshold');
  } else if (mode === 'wcag' && score < 1.5) {
    warnings.push('Contrast is below minimum usable threshold');
  }

  // Pure black/white
  const fg = fgHex.toLowerCase();
  const bg = bgHex.toLowerCase();
  if (fg === '#000000') warnings.push('Pure #000000 detected — consider #111111 for screens');
  if (fg === '#ffffff') warnings.push('Pure #ffffff detected — consider #eeeeee for screens');
  if (bg === '#000000') warnings.push('Pure #000000 detected — consider #111111 for screens');
  if (bg === '#ffffff') warnings.push('Pure #ffffff detected — consider #eeeeee for screens');

  return warnings;
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Evaluate contrast between foreground and background colors.
 *
 * @param foreground - Foreground color (any CSS color string)
 * @param background - Background color (any CSS color string)
 * @param mode - Contrast algorithm: 'apca' (default) or 'wcag'
 * @returns ContrastResult with score, pass/fail levels, and warnings
 *
 * @example
 * ```ts
 * const result = contrast('#ffffff', '#1e1e2e');        // APCA
 * const result = contrast('#777', '#fff', 'wcag');      // WCAG
 * ```
 */
export function contrast(foreground: string, background: string, mode: ContrastMode = 'apca'): ContrastResult {
  const fgHex = chroma(foreground).hex();
  const bgHex = chroma(background).hex();

  let score: number;
  let levels: ContrastLevelResult[];

  if (mode === 'wcag') {
    score = round2(wcagContrastRatio(fgHex, bgHex));
    const passing = getWcagPassingLevels(score);
    levels = WCAG_LEVELS.map(l => ({
      name: l.name,
      threshold: l.minRatio,
      pass: passing.some(p => p.id === l.id),
    }));
  } else {
    score = round2(computeApca(fgHex, bgHex));
    const absScore = Math.abs(score);
    levels = APCA_LEVELS.map(l => ({
      name: l.name,
      threshold: l.threshold,
      pass: absScore >= l.threshold,
    }));
  }

  const pass = levels.some(l => l.pass);
  const warnings = collectWarnings(fgHex, bgHex, mode, score);

  return { foreground: fgHex, background: bgHex, mode, score, pass, levels, warnings };
}
