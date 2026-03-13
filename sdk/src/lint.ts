/**
 * lint() — Evaluate contrast between foreground and background colors.
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
import { computeApcaLc } from '../../src/engine/ApcaEngine';
import type { ContrastMode, ContrastResult, ContrastLevelResult, LintResult, RampaOutputFormat } from './types';

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
  const fg = chroma(fgHex).hex();
  const bg = chroma(bgHex).hex();
  return computeApcaLc(fg, bg);
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

// ── Evaluation ───────────────────────────────────────────────────────

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

// ── Output formatters ────────────────────────────────────────────────

function formatLintText(result: ContrastResult): string {
  const lines: string[] = [];
  lines.push(`Mode: ${result.mode.toUpperCase()}`);
  lines.push(`Score: ${result.score}`);
  lines.push(`Pass: ${result.pass ? 'yes' : 'no'}`);
  lines.push('');
  lines.push('Levels:');
  for (const level of result.levels) {
    const icon = level.pass ? '✓' : '✗';
    lines.push(`  ${icon} ${level.name} (${level.threshold})`);
  }
  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const w of result.warnings) {
      lines.push(`  ⚠ ${w}`);
    }
  }
  return lines.join('\n');
}

function formatLintCss(result: ContrastResult): string {
  const lines: string[] = [':root {'];
  lines.push(`  --lint-foreground: ${result.foreground};`);
  lines.push(`  --lint-background: ${result.background};`);
  lines.push(`  --lint-score: ${result.score};`);
  lines.push(`  --lint-pass: ${result.pass ? '1' : '0'};`);
  lines.push('}');
  return lines.join('\n');
}

// ── LintBuilder ──────────────────────────────────────────────────────

export class LintBuilder implements LintResult {
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
  mode(m: ContrastMode): LintBuilder {
    const b = new LintBuilder(this._fg, this._bg);
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

  /** Export as css, json, or text */
  output(format: RampaOutputFormat): string {
    const result = this._evaluate();
    switch (format) {
      case 'json':
        return JSON.stringify(result, null, 2);
      case 'css':
        return formatLintCss(result);
      case 'text':
      default:
        return formatLintText(result);
    }
  }

  /** Return the full result object (useful for JSON serialization). */
  toJSON(): ContrastResult { return this._evaluate(); }
}

/**
 * Evaluate contrast between foreground and background colors.
 * Returns a chainable builder — call `.mode('wcag')` to use WCAG 2.x.
 * Default: APCA.
 *
 * @example
 * ```ts
 * const result = lint('#777', '#fff');                    // APCA (default)
 * const result = lint('#ffffff', '#1e1e2e').mode('wcag'); // WCAG 2.x
 * result.score      // -104.3 (APCA Lc) or 4.48 (WCAG ratio)
 * result.pass       // true/false
 * result.levels     // [{ name, threshold, pass }]
 * result.warnings   // lint warnings
 * result.output('json')  // JSON export
 * ```
 */
export function lint(foreground: string, background: string): LintBuilder {
  return new LintBuilder(foreground, background);
}
