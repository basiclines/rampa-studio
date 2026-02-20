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
 * Render a 2D color grid preview to the terminal.
 *
 * Layout (16 columns × 16 rows = 256 cells):
 *   Row 0:      colors 0–15   (base16)
 *   Rows 1–12:  colors 16–207 (first 12 rows of 6×6×6 cube, 16 per row)
 *   Row 13:     colors 208–223 (remaining cube 208–231 + grayscale 232–235)
 *   Row 14:     colors 224–239 (grayscale continued)
 *   Row 15:     colors 240–255 (grayscale end)
 *
 * On the right: base16 legend showing normal/bright pairs.
 * Below: background and foreground swatches.
 */
function renderPreview(palette, theme, themeName) {
  const COLS = 16;
  const ROWS = Math.ceil(palette.length / COLS); // 16

  // Base16 legend pairs: [normal, bright]
  const pairs = [
    [0, 8, 'black'],
    [1, 9, 'red'],
    [2, 10, 'green'],
    [3, 11, 'yellow'],
    [4, 12, 'blue'],
    [5, 13, 'magenta'],
    [6, 14, 'cyan'],
    [7, 15, 'white'],
  ];

  console.log('');
  console.log(`  ${themeName}`);
  console.log('');

  for (let row = 0; row < ROWS; row++) {
    let line = '  ';

    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      if (idx < palette.length) {
        const hex = palette[idx];
        const label = idx.toString(16).padStart(2, '0');
        line += `${bg(hex)}${contrastFg(hex)} ${label} ${RST}`;
      }
    }

    // Right-side legend (base16 pairs)
    if (row >= 1 && row <= 8) {
      const pair = pairs[row - 1];
      const [norm, bright, name] = pair;
      line += `  ${bg(palette[norm])}${contrastFg(palette[norm])} ${norm.toString(16)} ${RST}`;
      line += `${bg(palette[bright])}${contrastFg(palette[bright])} ${bright.toString(16)} ${RST}`;
      line += `  ${name}`;
    }

    console.log(line);
  }

  // Background / foreground swatches
  console.log('');
  const bgSwatch = `${bg(theme.bg)}${contrastFg(theme.bg)}  bg ${theme.bg}  ${RST}`;
  const fgSwatch = `${bg(theme.fg)}${contrastFg(theme.fg)}  fg ${theme.fg}  ${RST}`;
  console.log(`  ${bgSwatch}  ${fgSwatch}`);

  // Grayscale ramp as a continuous bar
  const grayStart = 232;
  const grayEnd = 255;
  let grayBar = '  ';
  for (let i = grayStart; i <= grayEnd; i++) {
    grayBar += `${bg(palette[i])}  ${RST}`;
  }
  console.log(`  grayscale ${grayStart}–${grayEnd}`);
  console.log(grayBar);
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
const cube = generateColorCube(theme.base16, theme.bg, theme.fg);
palette.push(...cube);

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
console.error(`   Color cube: 16-231 (${cube.length} colors)`);
console.error(`   Grayscale: 232-255 (${grayscale.length} colors)`);
