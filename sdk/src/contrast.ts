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

function evaluate(fgHex: string, bgHex: string, mode: ContrastMode): ContrastResult {
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

/**
 * A chainable contrast builder. Call `.mode('wcag')` to switch algorithm,
 * then read properties directly — evaluation is lazy.
 *
 * @example
 * ```ts
 * const r = contrast('#fff', '#1e1e2e');              // APCA default
 * const r = contrast('#777', '#fff').mode('wcag');     // WCAG 2.x
 * r.score      // -104.3 or 4.48
 * r.pass       // true/false
 * r.levels     // [{ name, threshold, pass }]
 * r.warnings   // lint warnings
 * ```
 */
export class ContrastBuilder {
  private _fg: string;
  private _bg: string;
  private _mode: ContrastMode = 'apca';
  private _result: ContrastResult | null = null;

  constructor(foreground: string, background: string) {
    try { this._fg = chroma(foreground).hex(); } catch {
      throw new Error(`Invalid foreground color: "${foreground}"`);
    }
    try { this._bg = chroma(background).hex(); } catch {
      throw new Error(`Invalid background color: "${background}"`);
    }
  }

  /** Set the contrast algorithm. Returns a new builder so chaining is immutable. */
  mode(m: ContrastMode): ContrastBuilder {
    const b = new ContrastBuilder(this._fg, this._bg);
    b._mode = m;
    return b;
  }

  private _evaluate(): ContrastResult {
    if (!this._result) {
      this._result = evaluate(this._fg, this._bg, this._mode);
    }
    return this._result;
  }

  get foreground(): string { return this._evaluate().foreground; }
  get background(): string { return this._evaluate().background; }
  get score(): number { return this._evaluate().score; }
  get pass(): boolean { return this._evaluate().pass; }
  get levels(): ContrastLevelResult[] { return this._evaluate().levels; }
  get warnings(): string[] { return this._evaluate().warnings; }

  /** Return the full result object (useful for JSON serialization). */
  toJSON(): ContrastResult { return this._evaluate(); }
}

/**
 * Evaluate contrast between foreground and background colors.
 * Returns a chainable builder — call `.mode('wcag')` to switch algorithm.
 *
 * @example
 * ```ts
 * const result = contrast('#ffffff', '#1e1e2e');             // APCA
 * const result = contrast('#777', '#fff').mode('wcag');       // WCAG
 * ```
 */
export function contrast(foreground: string, background: string): ContrastBuilder {
  return new ContrastBuilder(foreground, background);
}
