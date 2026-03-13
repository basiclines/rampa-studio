#!/usr/bin/env node
/**
 * rampa color — Inspect a single color in all supported formats
 *
 * Usage:
 *   rampa color '#fe0000'
 *   rampa color '#fe0000' --output json
 *   rampa color 'rgb(255, 102, 0)' --output css --prefix brand
 */

import { color } from '../../sdk/src/index';

// ── ANSI helpers ─────────────────────────────────────────────────────

const cyan   = '\x1b[36m';
const dim    = '\x1b[2m';
const reset  = '\x1b[0m';

// ── Argument Parsing ─────────────────────────────────────────────────

interface ColorArgs {
  color: string;
  output: 'text' | 'json' | 'css';
  prefix?: string;
}

function showColorHelp(): void {
  const help = `
rampa color
Inspect a color in all supported formats

USAGE
  ${cyan}rampa color <color> [options]${reset}

OPTIONS
  ${cyan}<color>${reset}                          ${dim}Color to inspect (positional or -c)${reset}
  ${cyan}-c, --color <color>${reset}             ${dim}Color to inspect (flag form)${reset}
  ${cyan}--output, -O <text|json|css>${reset}    ${dim}Output format (default: text)${reset}
  ${cyan}--prefix <name>${reset}                 ${dim}Prefix for CSS variable names (default: color)${reset}
  ${cyan}--help, -h${reset}                      ${dim}Show this help${reset}

EXAMPLES
  ${cyan}rampa color '#ff6600'${reset}
  ${cyan}rampa color 'rgb(100, 200, 50)' --output json${reset}
  ${cyan}rampa color '#1e1e2e' -O css --prefix brand${reset}
`;
  console.log(help.trim());
  process.exit(0);
}

export function parseColorArgs(args: string[]): ColorArgs {
  if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('help')) {
    showColorHelp();
  }

  let colorStr = '';
  let output: 'text' | 'json' | 'css' = 'text';
  let prefix: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if ((arg === '-c' || arg === '--color') && next) {
      colorStr = next; i++;
    } else if ((arg === '--output' || arg === '-O') && next) {
      const o = next.toLowerCase();
      if (o !== 'text' && o !== 'json' && o !== 'css') {
        console.error(`Error: Invalid output "${next}". Use 'text', 'json', or 'css'.`);
        process.exit(1);
      }
      output = o as 'text' | 'json' | 'css'; i++;
    } else if (arg === '--prefix' && next) {
      prefix = next; i++;
    } else if (!arg.startsWith('-') && !colorStr) {
      colorStr = arg;
    }
  }

  if (!colorStr) {
    console.error('Error: A color argument is required.');
    process.exit(1);
  }

  return { color: colorStr, output, prefix };
}

// ── Output Formatters ────────────────────────────────────────────────

function formatText(c: ReturnType<typeof color>): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('Color');
  lines.push('');
  lines.push(`  ${cyan}hex:${reset}    ${c.hex}`);
  lines.push(`  ${cyan}rgb:${reset}    ${c.format('rgb')}`);
  lines.push(`  ${cyan}hsl:${reset}    ${c.format('hsl')}`);
  lines.push(`  ${cyan}oklch:${reset}  ${c.format('oklch')}`);
  lines.push('');
  return lines.join('\n');
}

// ── Entry Point ──────────────────────────────────────────────────────

export function runColor(args: string[]): void {
  const parsed = parseColorArgs(args);

  let c: ReturnType<typeof color>;
  try {
    c = color(parsed.color);
  } catch {
    console.error(`Error: Invalid color "${parsed.color}".`);
    process.exit(1);
  }

  switch (parsed.output) {
    case 'json':
      console.log(c.output('json'));
      break;
    case 'css':
      console.log(c.output('css', parsed.prefix));
      break;
    default:
      console.log(formatText(c));
      break;
  }
}
