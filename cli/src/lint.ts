#!/usr/bin/env node
/**
 * rampa lint — Contrast compliance checking
 *
 * Usage:
 *   rampa lint --foreground '#fff' --background '#000'
 *   rampa lint --foreground '#fff' --background '#000' --mode wcag
 *   rampa lint --foreground '#fff' --background '#000' --output json
 */

import chroma from 'chroma-js';
import { contrast } from '../../sdk/src/contrast';
import type { ContrastMode, ContrastResult } from '../../sdk/src/types';

// ── ANSI helpers ─────────────────────────────────────────────────────

const green  = '\x1b[32m';
const red    = '\x1b[31m';
const yellow = '\x1b[33m';
const cyan   = '\x1b[36m';
const dim    = '\x1b[2m';
const reset  = '\x1b[0m';

// ── Argument Parsing ─────────────────────────────────────────────────

interface LintArgs {
  foreground: string;
  background: string;
  mode: ContrastMode;
  output: 'text' | 'json' | 'css';
}

function showLintHelp(): void {
  const help = `
rampa lint
Contrast compliance checking between foreground and background colors

USAGE
  ${cyan}rampa lint --foreground <color> --background <color> [options]${reset}

OPTIONS
  ${cyan}--foreground, --fg <color>${reset}     ${dim}Foreground (text) color${reset}
  ${cyan}--background, --bg <color>${reset}     ${dim}Background color${reset}
  ${cyan}--mode <apca|wcag>${reset}             ${dim}Contrast algorithm (default: apca)${reset}
  ${cyan}--output, -O <text|json|css>${reset}   ${dim}Output format (default: text)${reset}
  ${cyan}--help, -h${reset}                     ${dim}Show this help${reset}

EXAMPLES
  ${cyan}rampa lint --foreground '#fff' --background '#1e1e2e'${reset}
  ${cyan}rampa lint --fg '#777' --bg '#fff' --mode wcag${reset}
  ${cyan}rampa lint --fg '#000' --bg '#fff' --output json${reset}
`;
  console.log(help.trim());
  process.exit(0);
}

export function parseLintArgs(args: string[]): LintArgs {
  if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('help')) {
    showLintHelp();
  }

  let foreground = '';
  let background = '';
  let mode: ContrastMode = 'apca';
  let output: 'text' | 'json' | 'css' = 'text';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if ((arg === '--foreground' || arg === '--fg') && next) {
      foreground = next; i++;
    } else if ((arg === '--background' || arg === '--bg') && next) {
      background = next; i++;
    } else if (arg === '--mode' && next) {
      const m = next.toLowerCase();
      if (m !== 'apca' && m !== 'wcag') {
        console.error(`Error: Invalid mode "${next}". Use 'apca' or 'wcag'.`);
        process.exit(1);
      }
      mode = m as ContrastMode; i++;
    } else if ((arg === '--output' || arg === '-O') && next) {
      const o = next.toLowerCase();
      if (o !== 'text' && o !== 'json' && o !== 'css') {
        console.error(`Error: Invalid output "${next}". Use 'text', 'json', or 'css'.`);
        process.exit(1);
      }
      output = o as 'text' | 'json' | 'css'; i++;
    }
  }

  if (!foreground) {
    console.error('Error: --foreground (or --fg) is required.');
    process.exit(1);
  }
  if (!background) {
    console.error('Error: --background (or --bg) is required.');
    process.exit(1);
  }

  // Validate colors
  try { chroma(foreground); } catch {
    console.error(`Error: Invalid foreground color "${foreground}".`);
    process.exit(1);
  }
  try { chroma(background); } catch {
    console.error(`Error: Invalid background color "${background}".`);
    process.exit(1);
  }

  return { foreground, background, mode, output };
}

// ── Output Formatters ────────────────────────────────────────────────

function formatText(result: ContrastResult): string {
  const modeLabel = result.mode === 'wcag' ? 'WCAG 2.x' : 'APCA';
  const scoreLabel = result.mode === 'wcag' ? 'Ratio' : 'APCA Lc';
  const scoreValue = result.mode === 'wcag' ? `${result.score}:1` : `${result.score}`;

  const lines: string[] = [];
  lines.push('');
  lines.push(`Contrast Lint (${modeLabel})`);
  lines.push('');
  lines.push(`  ${cyan}Foreground:${reset}  ${result.foreground}`);
  lines.push(`  ${cyan}Background:${reset}  ${result.background}`);
  lines.push(`  ${cyan}${scoreLabel}:${reset}${' '.repeat(Math.max(1, 12 - scoreLabel.length))}${scoreValue}`);
  lines.push('');

  for (const level of result.levels) {
    const icon = level.pass ? `${green}●${reset}` : `${red}✗${reset}`;
    const label = level.pass ? `${green}Pass${reset}` : `${red}Fail${reset}`;
    const thresholdStr = result.mode === 'wcag'
      ? `(>= ${level.threshold}:1)`
      : `(Lc >= ${level.threshold})`;
    lines.push(`  ${icon} ${label}  ${level.name}  ${dim}${thresholdStr}${reset}`);
  }

  if (result.warnings.length > 0) {
    lines.push('');
    for (const w of result.warnings) {
      lines.push(`  ${yellow}▲${reset} ${yellow}Warning${reset}  ${w}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function formatJson(result: ContrastResult): string {
  return JSON.stringify(result, null, 2);
}

function formatCss(result: ContrastResult): string {
  const modeLabel = result.mode === 'wcag' ? 'WCAG 2.x' : 'APCA';
  const scoreStr = result.mode === 'wcag' ? `${result.score}:1` : `Lc ${result.score}`;
  const passStr = result.pass
    ? `Passes: ${result.levels.filter(l => l.pass).map(l => l.name).join(', ')}`
    : 'Fails all levels';

  const lines: string[] = [];
  lines.push(`/* Contrast Lint (${modeLabel}): ${scoreStr} — ${passStr} */`);

  for (const w of result.warnings) {
    lines.push(`/* ▲ ${w} */`);
  }

  lines.push(`--lint-foreground: ${result.foreground};`);
  lines.push(`--lint-background: ${result.background};`);

  return lines.join('\n');
}

// ── Entry Point ──────────────────────────────────────────────────────

export function runLint(args: string[]): void {
  const parsed = parseLintArgs(args);
  let builder = contrast(parsed.foreground, parsed.background);
  if (parsed.mode !== 'apca') {
    builder = builder.mode(parsed.mode);
  }
  const result = builder.toJSON();

  switch (parsed.output) {
    case 'json':
      console.log(formatJson(result));
      break;
    case 'css':
      console.log(formatCss(result));
      break;
    default:
      console.log(formatText(result));
      break;
  }
}
