#!/usr/bin/env node
/**
 * rampa color — Inspect and transform a single color
 *
 * Usage:
 *   rampa color '#fe0000'
 *   rampa color '#fe0000' --output json
 *   rampa color '#66b172' --lighten 0.1 --desaturate 0.05
 *   rampa color '#f85149' --mix '#0000ff' --ratio 0.5
 *   rampa color '#f85149' --blend '#000000' --ratio 0.2 --mode multiply
 */

import { color } from '../../sdk/src/index';
import type { Color, InterpolationMode, BlendMode } from '../../sdk/src/types';

// ── ANSI helpers ─────────────────────────────────────────────────────

const cyan   = '\x1b[36m';
const dim    = '\x1b[2m';
const reset  = '\x1b[0m';

// ── Argument Parsing ─────────────────────────────────────────────────

interface ColorArgs {
  color: string;
  output: 'text' | 'json' | 'css';
  prefix?: string;
  transforms: TransformOp[];
}

type TransformOp =
  | { type: 'lighten'; value: number }
  | { type: 'darken'; value: number }
  | { type: 'saturate'; value: number }
  | { type: 'desaturate'; value: number }
  | { type: 'rotate'; value: number }
  | { type: 'set-lightness'; value: number }
  | { type: 'set-chroma'; value: number }
  | { type: 'set-hue'; value: number }
  | { type: 'mix'; target: string; ratio: number; space: InterpolationMode }
  | { type: 'blend'; target: string; ratio: number; mode: BlendMode };

function showColorHelp(): void {
  const help = `
rampa color
Inspect and transform a color

USAGE
  ${cyan}rampa color <color> [transforms] [options]${reset}

COLOR
  ${cyan}<color>${reset}                          ${dim}Color to inspect (positional or -c)${reset}
  ${cyan}-c, --color <color>${reset}             ${dim}Color to inspect (flag form)${reset}

TRANSFORMS ${dim}(applied left to right, all OKLCH-based)${reset}
  ${cyan}--lighten <delta>${reset}               ${dim}Increase lightness (0-1 scale)${reset}
  ${cyan}--darken <delta>${reset}                ${dim}Decrease lightness (0-1 scale)${reset}
  ${cyan}--saturate <delta>${reset}              ${dim}Increase chroma (0-0.4 scale)${reset}
  ${cyan}--desaturate <delta>${reset}            ${dim}Decrease chroma (0-0.4 scale)${reset}
  ${cyan}--rotate <degrees>${reset}              ${dim}Rotate hue (degrees)${reset}
  ${cyan}--set-lightness <value>${reset}         ${dim}Set absolute lightness (0-1)${reset}
  ${cyan}--set-chroma <value>${reset}            ${dim}Set absolute chroma (0-0.4)${reset}
  ${cyan}--set-hue <value>${reset}               ${dim}Set absolute hue (0-360)${reset}

MIXING
  ${cyan}--mix <color>${reset}                   ${dim}Mix with color (use --ratio and --space)${reset}
  ${cyan}--blend <color>${reset}                 ${dim}Blend with color (use --ratio and --mode)${reset}
  ${cyan}--ratio <0-1>${reset}                   ${dim}Mix/blend ratio (default: 0.5)${reset}
  ${cyan}--space <oklch|lab|srgb>${reset}        ${dim}Color space for --mix (default: oklch)${reset}
  ${cyan}--mode <blend-mode>${reset}             ${dim}Blend mode for --blend (e.g. multiply, screen)${reset}

OUTPUT
  ${cyan}--output, -O <text|json|css>${reset}    ${dim}Output format (default: text)${reset}
  ${cyan}--prefix <name>${reset}                 ${dim}Prefix for CSS variable names (default: color)${reset}
  ${cyan}--help, -h${reset}                      ${dim}Show this help${reset}

EXAMPLES
  ${cyan}rampa color '#ff6600'${reset}
  ${cyan}rampa color '#66b172' --lighten 0.1 --desaturate 0.05${reset}
  ${cyan}rampa color '#f85149' --set-lightness 0.48${reset}
  ${cyan}rampa color '#f85149' --mix '#0000ff' --ratio 0.5${reset}
  ${cyan}rampa color '#f85149' --blend '#000' --ratio 0.2 --mode multiply${reset}
  ${cyan}rampa color '#66b172' --lighten 0.1 -O css --prefix brand${reset}
`;
  console.log(help.trim());
  process.exit(0);
}

const VALID_BLEND_MODES = [
  'normal', 'darken', 'multiply', 'plus-darker', 'color-burn',
  'lighten', 'screen', 'plus-lighter', 'color-dodge',
  'overlay', 'soft-light', 'hard-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
];

export function parseColorArgs(args: string[]): ColorArgs {
  if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('help')) {
    showColorHelp();
  }

  let colorStr = '';
  let output: 'text' | 'json' | 'css' = 'text';
  let prefix: string | undefined;
  const transforms: TransformOp[] = [];

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
    } else if (arg === '--lighten' && next) {
      transforms.push({ type: 'lighten', value: parseFloat(next) }); i++;
    } else if (arg === '--darken' && next) {
      transforms.push({ type: 'darken', value: parseFloat(next) }); i++;
    } else if (arg === '--saturate' && next) {
      transforms.push({ type: 'saturate', value: parseFloat(next) }); i++;
    } else if (arg === '--desaturate' && next) {
      transforms.push({ type: 'desaturate', value: parseFloat(next) }); i++;
    } else if (arg === '--rotate' && next) {
      transforms.push({ type: 'rotate', value: parseFloat(next) }); i++;
    } else if (arg === '--set-lightness' && next) {
      transforms.push({ type: 'set-lightness', value: parseFloat(next) }); i++;
    } else if (arg === '--set-chroma' && next) {
      transforms.push({ type: 'set-chroma', value: parseFloat(next) }); i++;
    } else if (arg === '--set-hue' && next) {
      transforms.push({ type: 'set-hue', value: parseFloat(next) }); i++;
    } else if (arg === '--mix' && next) {
      // Parse optional --ratio and --space that follow --mix
      let ratio = 0.5;
      let space: InterpolationMode = 'oklch';
      const target = next; i++;
      while (i + 1 < args.length) {
        if (args[i + 1] === '--ratio' && args[i + 2]) {
          const r = parseFloat(args[i + 2]);
          if (!Number.isFinite(r) || r < 0 || r > 1) {
            console.error(`Error: --ratio must be a number between 0 and 1, got "${args[i + 2]}".`);
            process.exit(1);
          }
          ratio = r; i += 2;
        } else if (args[i + 1] === '--space' && args[i + 2]) {
          const s = args[i + 2].toLowerCase();
          if (s !== 'oklch' && s !== 'lab' && s !== 'srgb' && s !== 'rgb') {
            console.error(`Error: Invalid space "${args[i + 2]}". Use 'oklch', 'lab', or 'srgb'.`);
            process.exit(1);
          }
          space = (s === 'srgb' ? 'rgb' : s) as InterpolationMode; i += 2;
        } else {
          break;
        }
      }
      transforms.push({ type: 'mix', target, ratio, space });
    } else if (arg === '--blend' && next) {
      // Parse optional --ratio and --mode that follow --blend
      let ratio = 0.5;
      let blendMode: BlendMode | null = null;
      const target = next; i++;
      while (i + 1 < args.length) {
        if (args[i + 1] === '--ratio' && args[i + 2]) {
          const r = parseFloat(args[i + 2]);
          if (!Number.isFinite(r) || r < 0 || r > 1) {
            console.error(`Error: --ratio must be a number between 0 and 1, got "${args[i + 2]}".`);
            process.exit(1);
          }
          ratio = r; i += 2;
        } else if (args[i + 1] === '--mode' && args[i + 2]) {
          if (!VALID_BLEND_MODES.includes(args[i + 2].toLowerCase())) {
            console.error(`Error: Invalid blend mode "${args[i + 2]}". Valid modes: ${VALID_BLEND_MODES.join(', ')}`);
            process.exit(1);
          }
          blendMode = args[i + 2].toLowerCase() as BlendMode; i += 2;
        } else {
          break;
        }
      }
      if (!blendMode) {
        console.error('Error: --blend requires --mode <blend-mode>.');
        process.exit(1);
      }
      transforms.push({ type: 'blend', target, ratio, mode: blendMode });
    } else if (!arg.startsWith('-') && !colorStr) {
      colorStr = arg;
    }
  }

  if (!colorStr) {
    console.error('Error: A color argument is required.');
    process.exit(1);
  }

  return { color: colorStr, output, prefix, transforms };
}

// ── Transform Application ────────────────────────────────────────────

function applyTransforms(c: Color, transforms: TransformOp[]): Color {
  let result = c;
  for (const op of transforms) {
    switch (op.type) {
      case 'lighten': result = result.lighten(op.value); break;
      case 'darken': result = result.darken(op.value); break;
      case 'saturate': result = result.saturate(op.value); break;
      case 'desaturate': result = result.desaturate(op.value); break;
      case 'rotate': result = result.rotate(op.value); break;
      case 'set-lightness': result = result.set({ lightness: op.value }); break;
      case 'set-chroma': result = result.set({ chroma: op.value }); break;
      case 'set-hue': result = result.set({ hue: op.value }); break;
      case 'mix': result = result.mix(op.target, op.ratio, op.space); break;
      case 'blend': result = result.blend(op.target, op.ratio, op.mode); break;
    }
  }
  return result;
}

// ── Output Formatters ────────────────────────────────────────────────

function formatText(c: Color): string {
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

  let c: Color;
  try {
    c = color(parsed.color);
  } catch {
    console.error(`Error: Invalid color "${parsed.color}".`);
    process.exit(1);
  }

  if (parsed.transforms.length > 0) {
    c = applyTransforms(c, parsed.transforms);
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
