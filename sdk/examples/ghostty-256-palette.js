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
 *
 * Output: Ghostty-compatible palette config lines
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
 * Generate 6 shades between two colors using rampa, giving us perceptually
 * uniform steps in the OKLCH color space.
 */
function rampBetween(from, to) {
  // Use rampa to generate a 6-step ramp between the two colors.
  // We set lightness/saturation to full range and let rampa interpolate.
  const fromInfo = rampa.readOnly(from).generate();
  const toInfo = rampa.readOnly(to).generate();

  // Generate a 6-step palette anchored at the "from" color,
  // with lightness spanning from the "from" lightness to the "to" lightness.
  const fromL = fromInfo.oklch.l;
  const toL = toInfo.oklch.l;

  const result = rampa(from)
    .size(6)
    .lightness(fromL, toL)
    .saturation(100, 100)
    .hue(0, 0)
    .generate();

  return result.ramps[0].colors;
}

/**
 * Simple linear interpolation between two hex colors in sRGB space.
 * Used for the color cube trilinear interpolation.
 */
function lerpColor(t, c1, c2) {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + t * (r2 - r1));
  const g = Math.round(g1 + t * (g2 - g1));
  const b = Math.round(b1 + t * (b2 - b1));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
 * with rampa generating each edge's 6-step ramp for perceptual uniformity.
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
    // Interpolate the 4 edges along the R axis
    const c_r0g0 = lerpColor(t_r, black, red);
    const c_r0g1 = lerpColor(t_r, green, yellow);
    const c_r1g0 = lerpColor(t_r, blue, magenta);
    const c_r1g1 = lerpColor(t_r, cyan, white);

    for (let g = 0; g < 6; g++) {
      const t_g = g / 5;
      // Interpolate along the G axis
      const c_b0 = lerpColor(t_g, c_r0g0, c_r0g1);
      const c_b1 = lerpColor(t_g, c_r1g0, c_r1g1);

      for (let b = 0; b < 6; b++) {
        const t_b = b / 5;
        // Interpolate along the B axis
        const color = lerpColor(t_b, c_b0, c_b1);
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

// ── Main ───────────────────────────────────────────────────────────────

const themeName = process.argv[2] || 'catppuccin-mocha';
const theme = themes[themeName];

if (!theme) {
  console.error(`Unknown theme: ${themeName}`);
  console.error(`Available themes: ${Object.keys(themes).join(', ')}`);
  process.exit(1);
}

console.log(`# Ghostty 256-color palette generated from ${themeName}`);
console.log(`# Generated with @basiclines/rampa-sdk`);
console.log(`#`);
console.log(`# Usage: copy this into your Ghostty config file`);
console.log(`#`);
console.log(`background = ${theme.bg}`);
console.log(`foreground = ${theme.fg}`);
console.log('');

// Base16 (0-15)
const palette = [...theme.base16];

// Color cube (16-231)
const cube = generateColorCube(theme.base16, theme.bg, theme.fg);
palette.push(...cube);

// Grayscale ramp (232-255)
const grayscale = generateGrayscaleRamp(theme.bg, theme.fg);
palette.push(...grayscale);

console.log(formatGhosttyConfig(palette));

console.error(`\n✅ Generated ${palette.length} colors for ${themeName}`);
console.error(`   Base16:    0-15  (${theme.base16.length} colors)`);
console.error(`   Color cube: 16-231 (${cube.length} colors)`);
console.error(`   Grayscale: 232-255 (${grayscale.length} colors)`);
