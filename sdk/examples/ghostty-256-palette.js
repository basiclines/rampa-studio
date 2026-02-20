#!/usr/bin/env node

/**
 * Ghostty 256-Color Palette Generator
 *
 * Generates a Ghostty terminal theme config with all 256 colors derived
 * from a base16 color scheme using rampa-sdk.
 *
 * The 256-color palette layout:
 *   0-7:     Normal base16 (the 8 input colors: bg, hues, fg)
 *   8-15:    Bright base16 (derived via rampa.mix toward fg)
 *   16-231:  6×6×6 color cube (216 colors, OKLCH trilinear interpolation)
 *   232-255: 24-step grayscale ramp (OKLCH perceptual lightness)
 *
 * Usage:
 *   node ghostty-256-palette.js
 *   node ghostty-256-palette.js --theme solarized-dark
 *   node ghostty-256-palette.js --table
 *   node ghostty-256-palette.js --theme tokyo-night --table
 *
 * Output: Ghostty-compatible palette config lines
 *         With --table: renders a 2D color grid to the terminal
 */

import { rampa } from '@basiclines/rampa-sdk';

// ── Themes ──────────────────────────────────────────────────────────────
// Only 8 colors needed: bg, fg, and 6 hues (red, green, yellow, blue, magenta, cyan).
// Everything else — base16 normals, brights, 216-color cube, grayscale — is derived.

const themes = {
  'catppuccin-mocha': {
    bg: '#1e1e2e',
    fg: '#cdd6f4',
    red: '#f38ba8',
    green: '#a6e3a1',
    yellow: '#f9e2af',
    blue: '#89b4fa',
    magenta: '#f5c2e7',
    cyan: '#94e2d5',
  },
  'solarized-dark': {
    bg: '#002b36',
    fg: '#eee8d5',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
  },
  'tokyo-night': {
    bg: '#1a1b26',
    fg: '#c0caf5',
    red: '#f7768e',
    green: '#9ece6a',
    yellow: '#e0af68',
    blue: '#7aa2f7',
    magenta: '#bb9af7',
    cyan: '#7dcfff',
  },
  'gruvbox-dark': {
    bg: '#282828',
    fg: '#ebdbb2',
    red: '#cc241d',
    green: '#98971a',
    yellow: '#d79921',
    blue: '#458588',
    magenta: '#b16286',
    cyan: '#689d6a',
  },
  'github-dark': {
    bg: '#24292e',
    fg: '#c9d1d9',
    red: '#f85149',
    green: '#56d364',
    yellow: '#e3b341',
    blue: '#58a6ff',
    magenta: '#bc8cff',
    cyan: '#39c5cf',
  },
  'github-light': {
    bg: '#ffffff',
    fg: '#24292f',
    red: '#cf222e',
    green: '#116329',
    yellow: '#4d2d00',
    blue: '#0969da',
    magenta: '#8250df',
    cyan: '#1b7c83',
  },
};

// ── Base16 Generation ──────────────────────────────────────────────────

/**
 * Generate the 16 base colors from just 8 inputs.
 *
 * Normal (0–7):  bg, red, green, yellow, blue, magenta, cyan, fg
 * Bright (8–15): derived by mixing each normal color toward fg (30%)
 *                bright black mixes bg toward fg
 *                bright white mixes fg toward bg (lighter feel)
 */
function generateBase16(theme) {
  const normals = [
    theme.bg,      // 0  black
    theme.red,     // 1  red
    theme.green,   // 2  green
    theme.yellow,  // 3  yellow
    theme.blue,    // 4  blue
    theme.magenta, // 5  magenta
    theme.cyan,    // 6  cyan
    theme.fg,      // 7  white
  ];

  const brights = [
    rampa.mix(theme.bg, theme.fg, 0.2),       // 8  bright black
    rampa.mix(theme.red, theme.fg, 0.25),     // 9  bright red
    rampa.mix(theme.green, theme.fg, 0.25),   // 10 bright green
    rampa.mix(theme.yellow, theme.fg, 0.25),  // 11 bright yellow
    rampa.mix(theme.blue, theme.fg, 0.25),    // 12 bright blue
    rampa.mix(theme.magenta, theme.fg, 0.25), // 13 bright magenta
    rampa.mix(theme.cyan, theme.fg, 0.25),    // 14 bright cyan
    rampa.mix(theme.fg, theme.bg, 0.1),       // 15 bright white
  ];

  return [...normals, ...brights];
}

// ── Color Cube Generation ──────────────────────────────────────────────

/**
 * Look up a cube color by its (r, g, b) coordinates.
 * Each value ranges from 0 to 5 — like rgb() but for 216 colors.
 *
 *   cube(0, 0, 0)  → index 16  (black/bg)
 *   cube(5, 0, 0)  → index 196 (red)
 *   cube(0, 5, 0)  → index 46  (green)
 *   cube(0, 0, 5)  → index 21  (blue)
 *   cube(5, 5, 5)  → index 231 (white/fg)
 *   cube(3, 0, 2)  → index 124
 *
 * @param {number} r - Red axis (0–5)
 * @param {number} g - Green axis (0–5)
 * @param {number} b - Blue axis (0–5)
 * @returns {number} Palette index (16–231)
 */
function cube(r, g, b) {
  return 16 + 36 * r + 6 * g + b;
}

/**
 * Generate the 216-color cube (indices 16-231).
 *
 * The 8 corners of the RGB cube map to base16 colors:
 *   (0,0,0) = bg (black)      (1,0,0) = red
 *   (0,1,0) = green           (1,1,0) = yellow
 *   (0,0,1) = blue            (1,0,1) = magenta
 *   (0,1,1) = cyan            (1,1,1) = fg (white)
 *
 * We use trilinear interpolation between these 8 corners,
 * with rampa.mix() performing OKLCH interpolation for perceptual uniformity.
 */
function generateColorCube(theme) {
  const black = theme.bg;
  const red = theme.red;
  const green = theme.green;
  const yellow = theme.yellow;
  const blue = theme.blue;
  const magenta = theme.magenta;
  const cyan = theme.cyan;
  const white = theme.fg;

  const cube = [];

  for (let r = 0; r < 6; r++) {
    const t_r = r / 5;
    // Interpolate the 4 edges along the R axis in OKLCH space
    const c_r0g0 = rampa.mix(black, red, t_r);
    const c_r0g1 = rampa.mix(green, yellow, t_r);
    const c_r1g0 = rampa.mix(blue, magenta, t_r);
    const c_r1g1 = rampa.mix(cyan, white, t_r);

    for (let g = 0; g < 6; g++) {
      const t_g = g / 5;
      // Interpolate along the G axis
      const c_b0 = rampa.mix(c_r0g0, c_r0g1, t_g);
      const c_b1 = rampa.mix(c_r1g0, c_r1g1, t_g);

      for (let b = 0; b < 6; b++) {
        const t_b = b / 5;
        // Interpolate along the B axis
        const color = rampa.mix(c_b0, c_b1, t_b);
        cube.push(color);
      }
    }
  }

  return cube;
}

/**
 * Generate the 24-step grayscale ramp (indices 232-255)
 * using rampa for perceptually uniform lightness steps.
 */
function generateGrayscaleRamp(theme) {
  // 24 steps between bg and fg (excluding pure bg and fg themselves)
  const result = rampa(theme.bg)
    .size(26)
    .saturation(0, 0)
    .hue(0, 0)
    .lightness(
      rampa.readOnly(theme.bg).generate().oklch.l,
      rampa.readOnly(theme.fg).generate().oklch.l
    )
    .generate();

  // Skip first and last (bg and fg are already in base16)
  return result.ramps[0].colors.slice(1, 25);
}

// ── Output Formatting ──────────────────────────────────────────────────

function formatGhosttyConfig(palette) {
  const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
  const lines = [];

  // Base16 → cube corner mapping (index → cube coordinates)
  const base16ToCube = {
    0: '0,0,0', // black = bg corner
    1: '5,0,0', // red
    2: '0,5,0', // green
    3: '5,5,0', // yellow
    4: '0,0,5', // blue
    5: '5,0,5', // magenta
    6: '0,5,5', // cyan
    7: '5,5,5', // white = fg corner
  };

  for (let i = 0; i < palette.length; i++) {
    const hex = palette[i];
    const { r, g, b } = hexToRgb(hex);
    const block = `\x1b[48;2;${r};${g};${b}m  ${RST}`;

    let label = '';
    if (i < 8) {
      label = `  ${names[i].padEnd(10)} → cube(${base16ToCube[i]})`;
    } else if (i < 16) {
      const mixLabel = i === 8 ? 'mix(bg, fg, 0.2)' :
                       i === 15 ? 'mix(fg, bg, 0.1)' :
                       `mix(${names[i - 8]}, fg, 0.25)`;
      label = `  bright ${names[i - 8].padEnd(10)} → ${mixLabel}`;
    } else if (i <= 231) {
      const ci = i - 16;
      const cr = Math.floor(ci / 36);
      const cg = Math.floor((ci % 36) / 6);
      const cb = ci % 6;
      label = `  cube(${cr},${cg},${cb})`;
    } else {
      const step = i - 232 + 1;
      label = `  gray ${String(step).padStart(2)}/24     → bg [${'█'.repeat(step)}${'·'.repeat(24 - step)}] fg`;
    }

    lines.push(`${block} ${String(i).padStart(3)}  ${hex}${label}`);
  }

  return lines.join('\n');
}

// ── Terminal Preview ───────────────────────────────────────────────────

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function luminance({ r, g, b }) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function bg(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `\x1b[48;2;${r};${g};${b}m`;
}

function fg(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `\x1b[38;2;${r};${g};${b}m`;
}

const RST = '\x1b[0m';

function contrastFg(hex) {
  return luminance(hexToRgb(hex)) > 128 ? fg('#000000') : fg('#ffffff');
}

/**
 * Render the 256-color palette as named color ramps.
 *
 * Layout:
 *   1. Base16 — normal (0–7) and bright (8–15) as labeled rows
 *   2. Color cube — 12 edge ramps between the 8 corner colors,
 *      grouped by origin (from black, from red, etc.)
 *   3. Grayscale ramp (232–255)
 *   4. Background / foreground swatches
 */
function renderPreview(palette, theme, themeName) {
  const DIM = '\x1b[2m';

  // Colored block with background showing the actual color
  const swatch = (hex, label) =>
    `${bg(hex)}${contrastFg(hex)}${label}${RST}`;

  console.log('');
  console.log(`  ${themeName}`);

  // ── Base16 ──
  console.log('');
  console.log(`  ${DIM}base16${RST}`);

  const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

  // Normal (0–7) with index labels
  let row = '  ';
  for (let i = 0; i < 8; i++) row += `${swatch(palette[i], ` ${String(i).padStart(2)} `)}`;
  console.log(row + `  ${DIM}normal${RST}`);

  // Bright (8–15) with index labels
  row = '  ';
  for (let i = 8; i < 16; i++) row += `${swatch(palette[i], ` ${String(i).padStart(2)} `)}`;
  console.log(row + `  ${DIM}bright${RST}`);

  // Names
  row = '  ';
  for (let i = 0; i < 8; i++) row += ` ${DIM}${names[i].slice(0, 3).padEnd(3)}${RST}`;
  console.log(row);

  // ── Color Cube ──
  // Show all 216 colors as 6 slices, one per r value
  // Each slice is a 6×6 grid: g (rows) × b (columns)
  // Labels show cube(r,g,b) coordinates
  console.log('');
  console.log(`  ${DIM}color cube  216 colors  cube(r, g, b)  r,g,b ∈ 0–5${RST}`);

  // 2 rows of 3 slices each
  for (let sliceRow = 0; sliceRow < 2; sliceRow++) {
    console.log('');

    // Slice headers with corner color names
    const cornerNames = [
      ['black', 'green'],    // r=0: black(0,0,0)→green(0,5,0)
      ['', ''],              // r=1
      ['', ''],              // r=2
      ['', ''],              // r=3
      ['', ''],              // r=4
      ['red', 'yellow'],     // r=5: red(5,0,0)→yellow(5,5,0)
    ];
    const sliceColors = [
      [names[0], names[4]],  // r=0: black corner, blue corner
      [], [],
      [], [],
      [names[1], names[5]],  // r=5: red corner, magenta corner
    ];

    let header = '  ';
    for (let s = 0; s < 3; s++) {
      const r = sliceRow * 3 + s;
      header += `${DIM}r=${r}${RST}                          `;
    }
    console.log(header);

    // b-axis labels
    let bLabels = '  ';
    for (let s = 0; s < 3; s++) {
      const r = sliceRow * 3 + s;
      for (let b = 0; b < 6; b++) {
        bLabels += `${DIM} b${b} ${RST}`;
      }
      bLabels += '  ';
    }
    console.log(bLabels);

    // 6 rows (g=0..5)
    for (let g = 0; g < 6; g++) {
      let line = '  ';
      for (let s = 0; s < 3; s++) {
        const r = sliceRow * 3 + s;
        for (let b = 0; b < 6; b++) {
          const idx = cube(r, g, b);
          line += `${swatch(palette[idx], `${r}${g}${b} `)}`;
        }
        line += '  ';
      }
      line += `${DIM}g=${g}${RST}`;
      console.log(line);
    }
  }

  // Corner legend
  console.log('');
  console.log(`  ${DIM}corners:  000=${names[0]}  500=${names[1]}  050=${names[2]}  550=${names[3]}${RST}`);
  console.log(`  ${DIM}          005=${names[4]}  505=${names[5]}  055=${names[6]}  555=${names[7]}${RST}`);

  // ── Grayscale ──
  console.log('');
  console.log(`  ${DIM}grayscale  232–255${RST}`);
  let grayBar = '  ';
  for (let i = 232; i <= 255; i++) {
    grayBar += `${swatch(palette[i], `${i} `)}`;
  }
  console.log(grayBar);

  // ── Background / Foreground ──
  console.log('');
  const bgSwatch = `${bg(theme.bg)}${contrastFg(theme.bg)}  bg ${theme.bg}  ${RST}`;
  const fgSwatch = `${bg(theme.fg)}${contrastFg(theme.fg)}  fg ${theme.fg}  ${RST}`;
  console.log(`  ${bgSwatch}  ${fgSwatch}`);
  console.log('');
}

// ── Main ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const tableMode = args.includes('--table');
const themeIdx = args.indexOf('--theme');
const themeName = themeIdx !== -1 && args[themeIdx + 1] ? args[themeIdx + 1] : (
  // Also accept bare theme name (first non-flag arg)
  args.find(a => !a.startsWith('--')) || 'catppuccin-mocha'
);
const theme = themes[themeName];

if (!theme) {
  console.error(`Unknown theme: ${themeName}`);
  console.error(`Available themes: ${Object.keys(themes).join(', ')}`);
  process.exit(1);
}

// Base16 (0-15) — derived from 8 input colors
const base16 = generateBase16(theme);
const palette = [...base16];

// Color cube (16-231)
const cubeColors = generateColorCube(theme);
palette.push(...cubeColors);

// Grayscale ramp (232-255)
const grayscale = generateGrayscaleRamp(theme);
palette.push(...grayscale);

if (tableMode) {
  renderPreview(palette, theme, themeName);
} else {
  console.log(`# Ghostty 256-color palette generated from ${themeName}`);
  console.log(`# Generated with @basiclines/rampa-sdk`);
  console.log(`#`);
  console.log(`# Usage: copy this into your Ghostty config file`);
  console.log(`#`);
  console.log(`background = ${theme.bg}`);
  console.log(`foreground = ${theme.fg}`);
  console.log('');
  console.log(formatGhosttyConfig(palette));
}

console.error(`\n✅ Generated ${palette.length} colors for ${themeName} from 8 input colors`);
console.error(`   Base16:    0-15  (${base16.length} colors, 8 input + 8 derived)`);
console.error(`   Color cube: 16-231 (${cubeColors.length} colors)`);
console.error(`   Grayscale: 232-255 (${grayscale.length} colors)`);
