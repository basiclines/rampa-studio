#!/usr/bin/env node
/**
 * rampa colorspace — CLI for color space queries
 *
 * Usage:
 *   rampa colorspace --cube k=#1e1e2e r=#f38ba8 ... --size 6 --tint r:4,b:2
 *   rampa colorspace --linear '#fff' '#000' --size 24 --at 12
 *   rampa colorspace --config space.json --tint r:4,b:2
 */

import { generateLinearSpace, generateCubeSpace, generatePlaneSpace, type InterpolationMode } from '../../src/engine/ColorSpaceEngine';
import { readFileSync } from 'node:fs';
import chroma from 'chroma-js';

// ── Argument Parsing ───────────────────────────────────────────────────

interface ColorSpaceArgs {
  mode: 'cube' | 'linear' | 'plane' | 'config';
  // Cube mode
  corners?: Record<string, string>;
  // Linear mode
  colors?: string[];
  // Plane mode
  dark?: string;
  light?: string;
  hue?: string;
  // Config mode
  configPath?: string;
  // Shared
  size: number;
  interpolation: InterpolationMode | false;
  // Query
  tint?: Record<string, number>;
  at?: number;
  xy?: [number, number];
  // Output
  format: 'hex' | 'hsl' | 'rgb' | 'oklch';
  output: 'text' | 'json' | 'css';
}

function showColorspaceHelp(): void {
  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';

  const help = `
rampa colorspace
Query colors from a color space defined by anchor colors

USAGE
  ${cyan}rampa colorspace --cube key=color ... [options]${reset}
  ${cyan}rampa colorspace --linear color ... [options]${reset}
  ${cyan}rampa colorspace --plane dark light hue [options]${reset}
  ${cyan}rampa colorspace --config file.json [options]${reset}

COLOR SPACE DEFINITION
  ${cyan}--cube key=color ...${reset}          ${dim}Define a CubeColorSpace with 8 key=color pairs${reset}
                                  ${dim}Keys become alias names for --tint queries${reset}

  ${cyan}--linear color ...${reset}            ${dim}Define a LinearColorSpace from 2+ colors${reset}
                                  ${dim}Interpolates between first and last color${reset}

  ${cyan}--plane dark light hue${reset}        ${dim}Define a PlaneColorSpace (2D saturation×lightness)${reset}
                                  ${dim}dark=origin, light=achromatic anchor, hue=chromatic corner${reset}

  ${cyan}--config file.json${reset}            ${dim}Load color space from a JSON config file${reset}

OPTIONS
  ${cyan}--size N${reset}                      ${dim}Steps per axis (cube) or total steps (linear)${reset}
                                  ${dim}Default: 6 for cube, 24 for linear${reset}

  ${cyan}--interpolation mode${reset}          ${dim}Interpolation: oklch (default), lab, rgb, false${reset}

QUERIES ${dim}(omit to output full palette)${reset}
  ${cyan}--tint key:n,...${reset}              ${dim}Query CubeColorSpace by alias:intensity${reset}
                                  ${dim}Example: --tint r:4,b:2${reset}

  ${cyan}--at N${reset}                        ${dim}Query LinearColorSpace by 1-based index${reset}
                                  ${dim}Example: --at 12${reset}

  ${cyan}--xy sat,light${reset}                ${dim}Query PlaneColorSpace by saturation,lightness${reset}
                                  ${dim}Example: --xy 3,5${reset}

OUTPUT
  ${cyan}--format type${reset}                 ${dim}Color format: hex (default), hsl, rgb, oklch${reset}
  ${cyan}--output type${reset}                 ${dim}Full palette format: text (default), json${reset}

EXAMPLES
  ${dim}# Get a single cube color${reset}
  rampa colorspace --cube k=#1e1e2e r=#f38ba8 g=#a6e3a1 b=#89b4fa \\
                          y=#f9e2af m=#cba6f7 c=#94e2d5 w=#cdd6f4 \\
                   --size 6 --tint r:4,b:2

  ${dim}# Get a grayscale step${reset}
  rampa colorspace --linear '#ffffff' '#000000' --size 24 --at 12

  ${dim}# Output full cube palette as JSON${reset}
  rampa colorspace --cube k=#000 r=#f00 g=#0f0 b=#00f \\
                          y=#ff0 m=#f0f c=#0ff w=#fff \\
                   --size 6 --output json

  ${dim}# Lookup table (no interpolation)${reset}
  rampa colorspace --linear '#f00' '#0f0' '#00f' '#ff0' \\
                   --interpolation false --at 2

  ${dim}# Plane: 2D saturation×lightness for a single hue${reset}
  rampa colorspace --plane '#1e1e2e' '#cdd6f4' '#f38ba8' --size 6 --xy 3,5

  ${dim}# Query from config file${reset}
  rampa colorspace --config catppuccin.json --tint r:4,b:2
`;
  console.log(help);
  process.exit(0);
}

// ── Corner order for cube ──────────────────────────────────────────────

const CORNER_MASKS: { x: number; y: number; z: number }[] = [
  { x: 0, y: 0, z: 0 }, // 1st = origin
  { x: 1, y: 0, z: 0 }, // 2nd = x
  { x: 0, y: 1, z: 0 }, // 3rd = y
  { x: 0, y: 0, z: 1 }, // 4th = z
  { x: 1, y: 1, z: 0 }, // 5th = xy
  { x: 1, y: 0, z: 1 }, // 6th = xz
  { x: 0, y: 1, z: 1 }, // 7th = yz
  { x: 1, y: 1, z: 1 }, // 8th = xyz
];

// ── Parse arguments ────────────────────────────────────────────────────

export function parseColorspaceArgs(argv: string[]): ColorSpaceArgs {
  const args: ColorSpaceArgs = {
    mode: 'linear',
    size: 0, // 0 = auto-detect default
    interpolation: 'oklch',
    format: 'hex',
    output: 'text',
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      showColorspaceHelp();
    }

    if (arg === '--cube') {
      args.mode = 'cube';
      args.corners = {};
      i++;
      // Consume all key=color pairs
      while (i < argv.length && !argv[i].startsWith('--')) {
        const pair = argv[i];
        const eqIdx = pair.indexOf('=');
        if (eqIdx === -1) {
          console.error(`Invalid cube corner: "${pair}" — expected key=color`);
          process.exit(1);
        }
        const key = pair.slice(0, eqIdx);
        const color = pair.slice(eqIdx + 1);
        try { chroma(color); } catch {
          console.error(`Invalid color for corner "${key}": ${color}`);
          process.exit(1);
        }
        args.corners[key] = color;
        i++;
      }
      continue;
    }

    if (arg === '--linear') {
      args.mode = 'linear';
      args.colors = [];
      i++;
      while (i < argv.length && !argv[i].startsWith('--')) {
        const color = argv[i];
        try { chroma(color); } catch {
          console.error(`Invalid color: ${color}`);
          process.exit(1);
        }
        args.colors.push(color);
        i++;
      }
      continue;
    }

    if (arg === '--plane') {
      args.mode = 'plane';
      i++;
      const planeColors: string[] = [];
      while (i < argv.length && !argv[i].startsWith('--')) {
        const color = argv[i];
        try { chroma(color); } catch {
          console.error(`Invalid color: ${color}`);
          process.exit(1);
        }
        planeColors.push(color);
        i++;
      }
      if (planeColors.length !== 3) {
        console.error('PlaneColorSpace requires exactly 3 colors: dark light hue');
        process.exit(1);
      }
      args.dark = planeColors[0];
      args.light = planeColors[1];
      args.hue = planeColors[2];
      continue;
    }

    if (arg === '--config') {
      args.mode = 'config';
      args.configPath = argv[++i];
      i++;
      continue;
    }

    if (arg === '--size') {
      args.size = parseInt(argv[++i]);
      i++;
      continue;
    }

    if (arg === '--interpolation') {
      const val = argv[++i];
      args.interpolation = val === 'false' ? false : val as InterpolationMode;
      i++;
      continue;
    }

    if (arg === '--tint') {
      args.tint = {};
      const parts = argv[++i].split(',');
      for (const part of parts) {
        const [key, val] = part.split(':');
        args.tint[key] = parseFloat(val);
      }
      i++;
      continue;
    }

    if (arg === '--at') {
      args.at = parseInt(argv[++i]);
      i++;
      continue;
    }

    if (arg === '--xy') {
      const parts = argv[++i].split(',');
      args.xy = [parseInt(parts[0]), parseInt(parts[1])];
      i++;
      continue;
    }

    if (arg === '--format') {
      args.format = argv[++i] as any;
      i++;
      continue;
    }

    if (arg === '--output') {
      args.output = argv[++i] as any;
      i++;
      continue;
    }

    i++;
  }

  return args;
}

// ── Load config file ───────────────────────────────────────────────────

function loadConfig(path: string): ColorSpaceArgs {
  try {
    const content = readFileSync(path, 'utf-8');
    const config = JSON.parse(content);

    const args: ColorSpaceArgs = {
      mode: config.type || 'cube',
      size: config.size || 0,
      interpolation: config.interpolation ?? 'oklch',
      format: 'hex',
      output: 'text',
    };

    if (config.type === 'linear' || config.colors) {
      args.mode = 'linear';
      args.colors = config.colors;
    } else if (config.type === 'plane') {
      args.mode = 'plane';
      args.dark = config.dark;
      args.light = config.light;
      args.hue = config.hue;
    } else {
      args.mode = 'cube';
      args.corners = config.corners;
    }

    return args;
  } catch (e: any) {
    console.error(`Failed to load config: ${e.message}`);
    process.exit(1);
  }
}

// ── Format color ───────────────────────────────────────────────────────

function formatColor(hex: string, format: string): string {
  const c = chroma(hex);
  switch (format) {
    case 'hsl': {
      const [h, s, l] = c.hsl();
      return `hsl(${Math.round(h || 0)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }
    case 'rgb': {
      const [r, g, b] = c.rgb();
      return `rgb(${r}, ${g}, ${b})`;
    }
    case 'oklch': {
      const [l, ch, h] = c.oklch();
      return `oklch(${(l * 100).toFixed(1)}% ${ch.toFixed(3)} ${Math.round(h || 0)})`;
    }
    default:
      return hex;
  }
}

// ── Execute ────────────────────────────────────────────────────────────

export function runColorspace(argv: string[]): void {
  let args = parseColorspaceArgs(argv);

  // Load config if needed
  if (args.mode === 'config' && args.configPath) {
    const config = loadConfig(args.configPath);
    // Merge: CLI flags override config
    args = {
      ...config,
      ...Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined && v !== 0)),
      mode: config.mode,
      corners: config.corners,
      colors: config.colors,
      dark: config.dark,
      light: config.light,
      hue: config.hue,
    };
  }

  // Set default size
  if (args.size === 0) {
    args.size = args.mode === 'linear' ? 24 : 6;
  }

  let palette: string[];
  let aliases: Record<string, { x: number; y: number; z: number }> | undefined;

  if (args.mode === 'cube') {
    if (!args.corners || Object.keys(args.corners).length !== 8) {
      console.error('CubeColorSpace requires exactly 8 corner colors (key=color)');
      process.exit(1);
    }

    const keys = Object.keys(args.corners);
    const cornerColors = keys.map(k => args.corners![k]) as
      [string, string, string, string, string, string, string, string];

    // Build alias masks from key order
    aliases = {};
    for (let i = 0; i < 8; i++) {
      aliases[keys[i]] = CORNER_MASKS[i];
    }

    if (args.interpolation === false) {
      palette = [...cornerColors];
    } else {
      palette = generateCubeSpace(cornerColors, args.size, args.interpolation as InterpolationMode);
    }
  } else if (args.mode === 'plane') {
    if (!args.dark || !args.light || !args.hue) {
      console.error('PlaneColorSpace requires 3 colors: dark light hue');
      process.exit(1);
    }
    palette = generatePlaneSpace(args.dark, args.light, args.hue, args.size, args.interpolation === false ? 'oklch' : args.interpolation as InterpolationMode);
  } else {
    // Linear
    if (!args.colors || args.colors.length < 2) {
      console.error('LinearColorSpace requires at least 2 colors');
      process.exit(1);
    }

    if (args.interpolation === false) {
      palette = [...args.colors];
    } else {
      palette = generateLinearSpace(
        args.colors[0],
        args.colors[args.colors.length - 1],
        args.size,
        args.interpolation as InterpolationMode
      );
    }
  }

  // ── Single-color query ──

  if (args.tint && aliases) {
    let cx = 0, cy = 0, cz = 0;
    const max = args.size - 1;

    for (const [key, intensity] of Object.entries(args.tint)) {
      const mask = aliases[key];
      if (!mask) {
        console.error(`Unknown alias: "${key}". Available: ${Object.keys(aliases).join(', ')}`);
        process.exit(1);
      }
      cx = Math.max(cx, mask.x * intensity);
      cy = Math.max(cy, mask.y * intensity);
      cz = Math.max(cz, mask.z * intensity);
    }

    cx = Math.max(0, Math.min(max, Math.round(cx)));
    cy = Math.max(0, Math.min(max, Math.round(cy)));
    cz = Math.max(0, Math.min(max, Math.round(cz)));

    const index = cx * args.size * args.size + cy * args.size + cz;
    console.log(formatColor(palette[index], args.format));
    return;
  }

  if (args.at !== undefined) {
    const i = Math.max(1, Math.min(palette.length, args.at)) - 1;
    console.log(formatColor(palette[i], args.format));
    return;
  }

  if (args.xy !== undefined) {
    const [sat, light] = args.xy;
    const sx = Math.max(0, Math.min(args.size - 1, sat));
    const ly = Math.max(0, Math.min(args.size - 1, light));
    const index = sx * args.size + ly;
    console.log(formatColor(palette[index], args.format));
    return;
  }

  // ── Full palette output ──

  if (args.output === 'json') {
    const formatted = palette.map(hex => formatColor(hex, args.format));
    console.log(JSON.stringify({ palette: formatted, size: palette.length }, null, 2));
    return;
  }

  // Text output with preview
  const canPreview = process.stdout.isTTY;
  for (let i = 0; i < palette.length; i++) {
    const hex = palette[i];
    const formatted = formatColor(hex, args.format);
    if (canPreview) {
      const { r, g, b } = hexToRgb(hex);
      const block = `\x1b[48;2;${r};${g};${b}m  \x1b[0m`;
      console.log(`${block} ${String(i).padStart(3)}  ${formatted}`);
    } else {
      console.log(formatted);
    }
  }
}

function hexToRgb(hex: string) {
  const c = chroma(hex);
  const [r, g, b] = c.rgb();
  return { r, g, b };
}
