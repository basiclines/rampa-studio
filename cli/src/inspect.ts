#!/usr/bin/env node
/**
 * rampa inspect — Color format inspection
 *
 * Usage:
 *   rampa inspect -c '#ff6600'
 *   rampa inspect -c '#ff6600' --output json
 *   rampa inspect -c 'rgb(255, 102, 0)' --output css
 */

import chroma from 'chroma-js';

// ── ANSI helpers ─────────────────────────────────────────────────────

const cyan   = '\x1b[36m';
const dim    = '\x1b[2m';
const reset  = '\x1b[0m';

// ── Argument Parsing ─────────────────────────────────────────────────

interface InspectArgs {
  color: string;
  output: 'text' | 'json' | 'css';
}

function showInspectHelp(): void {
  const help = `
rampa inspect
Inspect a color in all supported formats

USAGE
  ${cyan}rampa inspect -c <color> [options]${reset}

OPTIONS
  ${cyan}-c, --color <color>${reset}             ${dim}Color to inspect (required)${reset}
  ${cyan}--output, -O <text|json|css>${reset}    ${dim}Output format (default: text)${reset}
  ${cyan}--help, -h${reset}                      ${dim}Show this help${reset}

EXAMPLES
  ${cyan}rampa inspect -c '#ff6600'${reset}
  ${cyan}rampa inspect -c 'rgb(100, 200, 50)' --output json${reset}
  ${cyan}rampa inspect -c '#1e1e2e' -O css${reset}
`;
  console.log(help.trim());
  process.exit(0);
}

export function parseInspectArgs(args: string[]): InspectArgs {
  if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('help')) {
    showInspectHelp();
  }

  let color = '';
  let output: 'text' | 'json' | 'css' = 'text';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if ((arg === '-c' || arg === '--color') && next) {
      color = next; i++;
    } else if ((arg === '--output' || arg === '-O') && next) {
      const o = next.toLowerCase();
      if (o !== 'text' && o !== 'json' && o !== 'css') {
        console.error(`Error: Invalid output "${next}". Use 'text', 'json', or 'css'.`);
        process.exit(1);
      }
      output = o as 'text' | 'json' | 'css'; i++;
    }
  }

  if (!color) {
    console.error('Error: -c or --color is required.');
    process.exit(1);
  }

  try { chroma(color); } catch {
    console.error(`Error: Invalid color "${color}".`);
    process.exit(1);
  }

  return { color, output };
}

// ── Color formatting ─────────────────────────────────────────────────

interface ColorFormats {
  hex: string;
  rgb: { raw: string; r: number; g: number; b: number };
  hsl: { raw: string; h: number; s: number; l: number };
  oklch: { raw: string; l: number; c: number; h: number };
}

function getColorFormats(input: string): ColorFormats {
  const c = chroma(input);
  const [r, g, b] = c.rgb();
  const [h, s, l] = c.hsl();
  const [ol, oc, oh] = c.oklch();

  return {
    hex: c.hex(),
    rgb: {
      raw: `rgb(${r}, ${g}, ${b})`,
      r, g, b,
    },
    hsl: {
      raw: `hsl(${Math.round(h || 0)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
      h: Math.round(h || 0),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    },
    oklch: {
      raw: `oklch(${(ol * 100).toFixed(1)}% ${oc.toFixed(3)} ${Math.round(oh || 0)})`,
      l: parseFloat((ol * 100).toFixed(1)),
      c: parseFloat(oc.toFixed(3)),
      h: Math.round(oh || 0),
    },
  };
}

// ── Output Formatters ────────────────────────────────────────────────

function formatText(formats: ColorFormats): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('Color Inspect');
  lines.push('');
  lines.push(`  ${cyan}hex:${reset}    ${formats.hex}`);
  lines.push(`  ${cyan}rgb:${reset}    ${formats.rgb.raw}`);
  lines.push(`  ${cyan}hsl:${reset}    ${formats.hsl.raw}`);
  lines.push(`  ${cyan}oklch:${reset}  ${formats.oklch.raw}`);
  lines.push('');
  return lines.join('\n');
}

function formatJson(formats: ColorFormats): string {
  return JSON.stringify(formats, null, 2);
}

function formatCss(formats: ColorFormats): string {
  const lines: string[] = [];
  lines.push(`--color-hex: ${formats.hex};`);
  lines.push(`--color-rgb: ${formats.rgb.raw};`);
  lines.push(`--color-hsl: ${formats.hsl.raw};`);
  lines.push(`--color-oklch: ${formats.oklch.raw};`);
  return lines.join('\n');
}

// ── Entry Point ──────────────────────────────────────────────────────

export function runInspect(args: string[]): void {
  const parsed = parseInspectArgs(args);
  const formats = getColorFormats(parsed.color);

  switch (parsed.output) {
    case 'json':
      console.log(formatJson(formats));
      break;
    case 'css':
      console.log(formatCss(formats));
      break;
    default:
      console.log(formatText(formats));
      break;
  }
}
