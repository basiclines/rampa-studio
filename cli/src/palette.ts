#!/usr/bin/env node
/**
 * rampa palette — Extract color palettes from images
 *
 * Usage:
 *   rampa palette photo.jpg
 *   rampa palette photo.jpg --count 5
 *   rampa palette photo.jpg --ansi
 *   rampa palette photo.jpg --raw --tolerance 3
 *   rampa palette photo.jpg --output json
 */

import { palette, type GroupOptions } from '../../sdk/src/palette';
import { getDefaultBuckets, type GroupBucket, type GroupByProperty } from '../../src/engine/PaletteEngine';
import { coloredSquare } from './utils/terminal-colors';

const reset = '\x1b[0m';
const dim = '\x1b[2m';
const bold = '\x1b[1m';
const cyan = '\x1b[36m';
const yellow = '\x1b[33m';
const green = '\x1b[32m';

function showHelp(): void {
  console.log(`
${bold}rampa palette${reset} — Extract color palettes from images

${bold}Usage:${reset}
  rampa palette <file>                    ${dim}Top 10 dominant colors${reset}
  rampa palette <file> --count 5          ${dim}Top 5 dominant colors${reset}
  rampa palette <file> --raw              ${dim}All unique colors${reset}
  rampa palette <file> --ansi             ${dim}ANSI-classified palette${reset}

${bold}Flags:${reset}
  ${cyan}<file>${reset}                              ${dim}Image file path (PNG or JPEG)${reset}
  ${cyan}--count <n>${reset}                         ${dim}Number of dominant colors (default: 10)${reset}
  ${cyan}--tolerance <n>${reset}                     ${dim}DeltaE clustering radius (default: 4)${reset}
  ${cyan}--raw${reset}                               ${dim}Show raw palette (all unique colors)${reset}
  ${cyan}--raw-tolerance <n>${reset}                 ${dim}DeltaE threshold for raw dedup (default: 2)${reset}
  ${cyan}--max-colors <n>${reset}                    ${dim}Max colors for raw output (default: 1000)${reset}
  ${cyan}--ansi${reset}                              ${dim}Classify into ANSI color categories${reset}
  ${cyan}--group <L|C|H>${reset}                    ${dim}Group by lightness, chroma, or hue${reset}
  ${cyan}--l-buckets <n>${reset}                     ${dim}Number of lightness buckets (default: 5)${reset}
  ${cyan}--c-buckets <n>${reset}                     ${dim}Number of chroma buckets (default: 4)${reset}
  ${cyan}--h-buckets <n>${reset}                     ${dim}Number of hue buckets (default: 8)${reset}
  ${cyan}--average${reset}                           ${dim}Show average color only${reset}
  ${cyan}--temperature${reset}                       ${dim}Show color temperature only${reset}
  ${cyan}--sample-size <n>${reset}                   ${dim}Pixels to sample (default: 50000)${reset}
  ${cyan}--sort <frequency|L|C|H>${reset}          ${dim}Sort order (default: frequency)${reset}
  ${cyan}--output <text|json|css>${reset}   ${dim}-O${reset}     ${dim}Output format (default: text)${reset}
  ${cyan}--prefix <name>${reset}                     ${dim}CSS variable prefix (default: palette)${reset}
  ${cyan}--help${reset}                     ${dim}-h${reset}     ${dim}Show this help${reset}
`);
}

type SortField = 'frequency' | 'L' | 'C' | 'H';

interface PaletteArgs {
  filePath: string;
  mode: 'dominant' | 'raw' | 'ansi' | 'group' | 'average' | 'temperature';
  count: number;
  tolerance: number;
  rawTolerance: number;
  maxColors: number;
  sampleSize: number;
  sort: SortField;
  groupBy: 'L' | 'C' | 'H';
  lBuckets: number;
  cBuckets: number;
  hBuckets: number;
  output: 'text' | 'json' | 'css';
  prefix: string;
}

function sortEntries<T extends { color: { oklch: { l: number; c: number; h: number } }; frequency: number }>(
  entries: T[],
  field: SortField
): T[] {
  const sorted = [...entries];
  switch (field) {
    case 'L': return sorted.sort((a, b) => a.color.oklch.l - b.color.oklch.l);
    case 'C': return sorted.sort((a, b) => a.color.oklch.c - b.color.oklch.c);
    case 'H': return sorted.sort((a, b) => a.color.oklch.h - b.color.oklch.h);
    default: return sorted; // already sorted by frequency
  }
}

function parseArgs(args: string[]): PaletteArgs | null {
  const result: PaletteArgs = {
    filePath: '',
    mode: 'dominant',
    count: 10,
    tolerance: 4,
    rawTolerance: 2,
    maxColors: 1000,
    sampleSize: 50000,
    sort: 'frequency',
    groupBy: 'L',
    lBuckets: 5,
    cBuckets: 4,
    hBuckets: 8,
    output: 'text',
    prefix: 'palette',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      showHelp();
      return null;
    }
    if (arg === '--raw') { result.mode = 'raw'; continue; }
    if (arg === '--ansi') { result.mode = 'ansi'; continue; }
    if (arg === '--group' && args[i + 1]) { result.mode = 'group'; result.groupBy = args[++i] as any; continue; }
    if (arg === '--average') { result.mode = 'average'; continue; }
    if (arg === '--temperature') { result.mode = 'temperature'; continue; }

    if (arg === '--count' && args[i + 1]) { result.count = parseInt(args[++i]); continue; }
    if (arg === '--tolerance' && args[i + 1]) { result.tolerance = parseFloat(args[++i]); continue; }
    if (arg === '--raw-tolerance' && args[i + 1]) { result.rawTolerance = parseFloat(args[++i]); continue; }
    if (arg === '--max-colors' && args[i + 1]) { result.maxColors = parseInt(args[++i]); continue; }
    if (arg === '--sample-size' && args[i + 1]) { result.sampleSize = parseInt(args[++i]); continue; }
    if (arg === '--sort' && args[i + 1]) { result.sort = args[++i] as SortField; continue; }
    if (arg === '--l-buckets' && args[i + 1]) { result.lBuckets = parseInt(args[++i]); continue; }
    if (arg === '--c-buckets' && args[i + 1]) { result.cBuckets = parseInt(args[++i]); continue; }
    if (arg === '--h-buckets' && args[i + 1]) { result.hBuckets = parseInt(args[++i]); continue; }
    if ((arg === '--output' || arg === '-O') && args[i + 1]) {
      result.output = args[++i] as any;
      continue;
    }
    if (arg === '--prefix' && args[i + 1]) { result.prefix = args[++i]; continue; }

    // Positional: file path
    if (!arg.startsWith('-') && !result.filePath) {
      result.filePath = arg;
      continue;
    }
  }

  if (!result.filePath) {
    console.error('Error: No image file specified. Usage: rampa palette <file>');
    return null;
  }

  return result;
}

function buildCustomBuckets(property: GroupByProperty, count: number): GroupBucket[] | undefined {
  const defaults = getDefaultBuckets(property);
  if (count === defaults.length) return undefined; // use defaults

  // Generate evenly-spaced buckets
  const ranges: Record<GroupByProperty, { max: number; names: (i: number, n: number) => string }> = {
    L: { max: 1, names: (i, n) => {
      if (n <= 3) return ['dark', 'mid', 'light'][i];
      if (n <= 5) return ['darkest', 'dark', 'mid', 'light', 'lightest'][i] || `L${i}`;
      return `L${i}`;
    }},
    C: { max: 0.2, names: (i, n) => {
      if (n <= 4) return ['gray', 'muted', 'saturated', 'vivid'][i] || `C${i}`;
      return `C${i}`;
    }},
    H: { max: 360, names: (i, n) => {
      if (n <= 8) return ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'][i] || `H${i}`;
      return `H${i}`;
    }},
  };

  const { max, names } = ranges[property];
  const step = max / count;
  return Array.from({ length: count }, (_, i) => ({
    name: names(i, count),
    min: i * step,
    max: i === count - 1 ? (property === 'C' ? Infinity : max) : (i + 1) * step,
  }));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function swatch(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return coloredSquare(r, g, b);
}

function padRight(s: string, len: number): string {
  return s + ' '.repeat(Math.max(0, len - s.length));
}

export async function runPalette(args: string[]): Promise<void> {
  const parsed = parseArgs(args);
  if (!parsed) return;

  try {
    const p = await palette(parsed.filePath, { sampleSize: parsed.sampleSize });

    // JSON/CSS output delegates to SDK
    if (parsed.output === 'json' && parsed.mode === 'dominant') {
      console.log(p.output('json'));
      return;
    }
    if (parsed.output === 'css') {
      console.log(p.output('css', parsed.prefix));
      return;
    }

    switch (parsed.mode) {
      case 'dominant': {
        const dom = sortEntries(p.dominant({ count: parsed.count, tolerance: parsed.tolerance }), parsed.sort);
        if (parsed.output === 'json') {
          console.log(JSON.stringify(dom.map(d => ({
            hex: d.color.hex, frequency: Math.round(d.frequency * 10000) / 10000,
            oklch: d.color.oklch,
          })), null, 2));
          return;
        }
        console.log(`\n${bold}Dominant colors${reset} ${dim}(${dom.length})${reset}\n`);
        for (let i = 0; i < dom.length; i++) {
          const d = dom[i];
          const pct = (d.frequency * 100).toFixed(1);
          console.log(`  ${swatch(d.color.hex)} ${padRight(d.color.hex, 9)} ${dim}${padRight(pct + '%', 7)}${reset} ${dim}L=${d.color.oklch.l.toFixed(2)} C=${d.color.oklch.c.toFixed(3)} H=${Math.round(d.color.oklch.h)}°${reset}`);
        }
        console.log(`\n  ${dim}Average:${reset} ${swatch(p.average().hex)} ${p.average().hex}`);
        console.log(`  ${dim}Temperature:${reset} ${p.temperature()}\n`);
        break;
      }

      case 'raw': {
        const raw = sortEntries(p.raw({ tolerance: parsed.rawTolerance, maxColors: parsed.maxColors }), parsed.sort);
        if (parsed.output === 'json') {
          console.log(JSON.stringify(raw.map(r => ({
            hex: r.color.hex, frequency: Math.round(r.frequency * 10000) / 10000,
          })), null, 2));
          return;
        }
        console.log(`\n${bold}Raw palette${reset} ${dim}(${raw.length} colors)${reset}\n`);
        for (const r of raw.slice(0, 50)) { // limit text display
          const pct = (r.frequency * 100).toFixed(2);
          console.log(`  ${swatch(r.color.hex)} ${padRight(r.color.hex, 9)} ${dim}${padRight(pct + '%', 7)}${reset} ${dim}L=${r.color.oklch.l.toFixed(2)} C=${r.color.oklch.c.toFixed(3)} H=${Math.round(r.color.oklch.h)}°${reset}`);
        }
        if (raw.length > 50) console.log(`  ${dim}... and ${raw.length - 50} more (use --output json for full list)${reset}`);
        console.log('');
        break;
      }

      case 'ansi': {
        const ansi = p.ansi({ count: parsed.count, tolerance: parsed.tolerance });
        if (parsed.output === 'json') {
          console.log(JSON.stringify(Object.fromEntries(
            Object.entries(ansi).map(([name, entries]) => [
              name, entries.map(e => ({ hex: e.color.hex, frequency: Math.round(e.frequency * 10000) / 10000 })),
            ])
          ), null, 2));
          return;
        }
        console.log(`\n${bold}ANSI palette${reset}\n`);
        const names: string[] = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
        for (const name of names) {
          const entries = (ansi as any)[name] || [];
          if (entries.length === 0) {
            console.log(`  ${padRight(name, 9)} ${dim}(none)${reset}`);
          } else {
          const sorted = sortEntries(entries, parsed.sort);
            const swatches = sorted.map((e: any) => `${swatch(e.color.hex)} ${e.color.hex}`).join('  ');
            console.log(`  ${padRight(name, 9)} ${swatches}`);
          }
        }
        console.log('');
        break;
      }

      case 'group': {
        const bucketCount = { L: parsed.lBuckets, C: parsed.cBuckets, H: parsed.hBuckets }[parsed.groupBy];
        const customBuckets = buildCustomBuckets(parsed.groupBy, bucketCount);
        const groupOpts: GroupOptions = {
          by: parsed.groupBy,
          count: parsed.count,
          tolerance: parsed.tolerance,
          ...(customBuckets ? { buckets: customBuckets } : {}),
        };
        const grouped = p.group(groupOpts);
        if (parsed.output === 'json') {
          console.log(JSON.stringify(Object.fromEntries(
            Object.entries(grouped).map(([name, entries]) => [
              name, entries.map(e => ({ hex: e.color.hex, frequency: Math.round(e.frequency * 10000) / 10000 })),
            ])
          ), null, 2));
          return;
        }
        console.log(`\n${bold}Group by ${parsed.groupBy}${reset}\n`);
        for (const [name, entries] of Object.entries(grouped)) {
          if (entries.length === 0) {
            console.log(`  ${padRight(name, 11)} ${dim}(none)${reset}`);
          } else {
            const sorted = sortEntries(entries, parsed.sort);
            const swatches = sorted.map((e: any) => `${swatch(e.color.hex)} ${e.color.hex}`).join('  ');
            console.log(`  ${padRight(name, 11)} ${swatches}`);
          }
        }
        console.log('');
        break;
      }

      case 'average': {
        const avg = p.average();
        if (parsed.output === 'json') {
          console.log(JSON.stringify({ hex: avg.hex, oklch: avg.oklch }));
          return;
        }
        console.log(`\n  ${swatch(avg.hex)} ${bold}${avg.hex}${reset} ${dim}oklch(${avg.oklch.l.toFixed(2)} ${avg.oklch.c.toFixed(3)} ${avg.oklch.h})${reset}\n`);
        break;
      }

      case 'temperature': {
        const temp = p.temperature();
        if (parsed.output === 'json') {
          console.log(JSON.stringify({ temperature: temp }));
          return;
        }
        console.log(`\n  Temperature: ${bold}${temp}${reset}\n`);
        break;
      }
    }
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
