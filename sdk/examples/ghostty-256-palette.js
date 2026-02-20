#!/usr/bin/env node

/**
 * Ghostty 256-Color Palette Generator
 *
 * Generates a Ghostty terminal theme config with all 256 colors derived
 * from a base16 color scheme using rampa-sdk.
 *
 * The 256-color palette layout:
 *   0-15:    Base16 colors (user-provided)
 *   16-231:  6×6×6 color cube (216 colors, generated with rampa ramps)
 *   232-255: 24-step grayscale ramp (generated with rampa)
 *
 * Usage:
 *   node ghostty-256-palette.js
 *   node ghostty-256-palette.js --theme solarized-dark
 *   node ghostty-256-palette.js --preview
 *   node ghostty-256-palette.js --theme tokyo-night --preview
 *
 * Output: Ghostty-compatible palette config lines
 *         With --preview: renders a 2D color grid to the terminal
 */

import { rampa } from '@basiclines/rampa-sdk';

// ── Base16 Themes ──────────────────────────────────────────────────────

const themes = {
  'catppuccin-mocha': {
    bg: '#1e1e2e',
    fg: '#cdd6f4',
    base16: [
      '#45475a', // 0  black
      '#f38ba8', // 1  red
      '#a6e3a1', // 2  green
      '#f9e2af', // 3  yellow
      '#89b4fa', // 4  blue
      '#f5c2e7', // 5  magenta
      '#94e2d5', // 6  cyan
      '#bac2de', // 7  white
      '#585b70', // 8  bright black
      '#f38ba8', // 9  bright red
      '#a6e3a1', // 10 bright green
      '#f9e2af', // 11 bright yellow
      '#89b4fa', // 12 bright blue
      '#f5c2e7', // 13 bright magenta
      '#94e2d5', // 14 bright cyan
      '#a6adc8', // 15 bright white
    ],
  },
  'solarized-dark': {
    bg: '#002b36',
    fg: '#839496',
    base16: [
      '#073642', '#dc322f', '#859900', '#b58900',
      '#268bd2', '#d33682', '#2aa198', '#eee8d5',
      '#002b36', '#cb4b16', '#586e75', '#657b83',
      '#839496', '#6c71c4', '#93a1a1', '#fdf6e3',
    ],
  },
  'tokyo-night': {
    bg: '#1a1b26',
    fg: '#c0caf5',
    base16: [
      '#15161e', '#f7768e', '#9ece6a', '#e0af68',
      '#7aa2f7', '#bb9af7', '#7dcfff', '#a9b1d6',
      '#414868', '#f7768e', '#9ece6a', '#e0af68',
      '#7aa2f7', '#bb9af7', '#7dcfff', '#c0caf5',
    ],
  },
  'gruvbox-dark': {
    bg: '#282828',
    fg: '#ebdbb2',
    base16: [
      '#282828', '#cc241d', '#98971a', '#d79921',
      '#458588', '#b16286', '#689d6a', '#a89984',
      '#928374', '#fb4934', '#b8bb26', '#fabd2f',
      '#83a598', '#d3869b', '#8ec07c', '#ebdbb2',
    ],
  },
};

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
function generateColorCube(base16, bg, fg) {
  const black = bg;
  const red = base16[1];
  const green = base16[2];
  const yellow = base16[3];
  const blue = base16[4];
  const magenta = base16[5];
  const cyan = base16[6];
  const white = fg;

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
function generateGrayscaleRamp(bg, fg) {
  // 24 steps between bg and fg (excluding pure bg and fg themselves)
  const result = rampa(bg)
    .size(26)
    .saturation(0, 0)
    .hue(0, 0)
    .lightness(
      rampa.readOnly(bg).generate().oklch.l,
      rampa.readOnly(fg).generate().oklch.l
    )
    .generate();

  // Skip first and last (bg and fg are already in base16)
  return result.ramps[0].colors.slice(1, 25);
}

// ── Output Formatting ──────────────────────────────────────────────────

function formatGhosttyConfig(palette) {
  const lines = [];
  for (let i = 0; i < palette.length; i++) {
    lines.push(`palette = ${i}=${palette[i]}`);
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
const previewMode = args.includes('--preview');
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

// Base16 (0-15)
const palette = [...theme.base16];

// Color cube (16-231)
const cubeColors = generateColorCube(theme.base16, theme.bg, theme.fg);
palette.push(...cubeColors);

// Grayscale ramp (232-255)
const grayscale = generateGrayscaleRamp(theme.bg, theme.fg);
palette.push(...grayscale);

if (previewMode) {
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

console.error(`\n✅ Generated ${palette.length} colors for ${themeName}`);
console.error(`   Base16:    0-15  (${theme.base16.length} colors)`);
console.error(`   Color cube: 16-231 (${cubeColors.length} colors)`);
console.error(`   Grayscale: 232-255 (${grayscale.length} colors)`);
