/**
 * contrast() — Evaluate contrast between foreground and background colors.
 *
 * Supports WCAG 2.x ratio and APCA Lc modes.
 * Includes lint warnings for near-identical, low-contrast, and pure B/W.
 */

import chroma from 'chroma-js';
import {
  wcagContrastRatio,
  getWcagPassingLevels,
  WCAG_LEVELS,
  colorDeltaE,
  round2,
} from '../../src/engine/ContrastEngine';
import type { ContrastMode, ContrastResult, ContrastLevelResult } from './types';

// ── Optional APCA loading ────────────────────────────────────────────
// apca-w3 is an optional peer dependency. It is loaded lazily on first
// use of APCA mode and cached for subsequent calls. Consumers that
// bundle apca-w3 statically (e.g. the CLI) can call registerApca()
// to pre-register the module before any contrast evaluation.

type ApcaModule = {
  APCAcontrast: (txY: number, bgY: number) => number;
  sRGBtoY: (rgb: [number, number, number]) => number;
};

let _apcaModule: ApcaModule | null | undefined;

function getApcaModule(): ApcaModule | null {
  if (_apcaModule === undefined) {
    try {
      // Dynamic require — kept as a variable reference so the bundler
      // does not attempt to resolve the module at build time.
      const id = 'apca-w3';
      _apcaModule = require(id) as ApcaModule;
    } catch {
      _apcaModule = null;
    }
  }
  return _apcaModule;
}

/**
 * Pre-register the APCA module for use in contrast calculations.
 * Call this when `apca-w3` is statically bundled (e.g. in a compiled CLI)
 * and dynamic `require()` would not resolve it at runtime.
 */
export function registerApca(mod: ApcaModule): void {
  _apcaModule = mod;
}

/** Returns true when the optional `apca-w3` package is installed. */
export function isApcaAvailable(): boolean {
  return getApcaModule() !== null;
}

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
  const apca = getApcaModule();
  if (!apca) {
    throw new Error(
      'APCA contrast requires the "apca-w3" package. Install it with:\n' +
      '  npm install apca-w3\n' +
      'Note: apca-w3 has its own licensing terms. Review them before use.'
    );
  }
  const [fgR, fgG, fgB] = chroma(fgHex).rgb();
  const [bgR, bgG, bgB] = chroma(bgHex).rgb();
  return apca.APCAcontrast(apca.sRGBtoY([fgR, fgG, fgB]), apca.sRGBtoY([bgR, bgG, bgB])) as number;
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

  return Array.from(new Set(warnings));
}

// ── Public API ───────────────────────────────────────────────────────

function evaluate(fgHex: string, bgHex: string, mode: ContrastMode): ContrastResult {
  let rawScore: number;
  let levels: ContrastLevelResult[];

  if (mode === 'wcag') {
    rawScore = wcagContrastRatio(fgHex, bgHex);
    const passing = getWcagPassingLevels(rawScore);
    levels = WCAG_LEVELS.map(l => ({
      name: l.name,
      threshold: l.minRatio,
      pass: passing.some(p => p.id === l.id),
    }));
  } else {
    rawScore = computeApca(fgHex, bgHex);
    const absScore = Math.abs(rawScore);
    levels = APCA_LEVELS.map(l => ({
      name: l.name,
      threshold: l.threshold,
      pass: absScore >= l.threshold,
    }));
  }

  const pass = levels.some(l => l.pass);
  const warnings = collectWarnings(fgHex, bgHex, mode, rawScore);
  const score = round2(rawScore);

  return { foreground: fgHex, background: bgHex, mode, score, pass, levels, warnings };
}

/**
 * A chainable contrast builder. Call `.mode('apca')` to switch algorithm
 * (requires the optional `apca-w3` package). Default: WCAG.
 *
 * @example
 * ```ts
 * const r = contrast('#777', '#fff');                 // WCAG default
 * const r = contrast('#fff', '#1e1e2e').mode('apca'); // APCA (needs apca-w3)
 * r.score      // 4.48 or -104.3
 * r.pass       // true/false
 * r.levels     // [{ name, threshold, pass }]
 * r.warnings   // lint warnings
 * ```
 */
export class ContrastBuilder {
  private _fg: string;
  private _bg: string;
  private _mode: ContrastMode = 'wcag';
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
 * Returns a chainable builder — call `.mode('apca')` to use APCA
 * (requires the optional `apca-w3` package). Default: WCAG.
 *
 * @example
 * ```ts
 * const result = contrast('#777', '#fff');                 // WCAG (default)
 * const result = contrast('#ffffff', '#1e1e2e').mode('apca'); // APCA
 * ```
 */
export function contrast(foreground: string, background: string): ContrastBuilder {
  return new ContrastBuilder(foreground, background);
}
