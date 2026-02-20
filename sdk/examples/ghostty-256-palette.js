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
 *   node ghostty-256-palette.js --theme "Catppuccin Mocha"
 *   node ghostty-256-palette.js --table
 *   node ghostty-256-palette.js --interactive
 *   node ghostty-256-palette.js --list
 *
 * Output: Ghostty-compatible palette config lines
 *         With --table: renders a 2D color grid to the terminal
 */

import { rampa } from '@basiclines/rampa-sdk';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// ── Theme Loading ──────────────────────────────────────────────────────

const GHOSTTY_THEMES_DIR = '/Applications/Ghostty.app/Contents/Resources/ghostty/themes';

function parseGhosttyTheme(content) {
  const lines = content.split('\n');
  const base16 = new Array(16).fill(null);
  let bg = null, fg = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();

    if (key === 'background') bg = value;
    else if (key === 'foreground') fg = value;
    else if (key === 'palette') {
      const eqIdx2 = value.indexOf('=');
      if (eqIdx2 === -1) continue;
      const idx = parseInt(value.slice(0, eqIdx2).trim());
      const color = value.slice(eqIdx2 + 1).trim();
      if (idx >= 0 && idx < 16) base16[idx] = color;
    }
  }

  if (!bg || !fg || base16.some(c => c === null)) return null;
  return { bg, fg, base16 };
}

function loadThemes() {
  const themes = {};
  try {
    const files = readdirSync(GHOSTTY_THEMES_DIR);
    for (const file of files) {
      const content = readFileSync(join(GHOSTTY_THEMES_DIR, file), 'utf-8');
      const theme = parseGhosttyTheme(content);
      if (theme) themes[file] = theme;
    }
  } catch (e) {
    console.error(`Could not read themes from ${GHOSTTY_THEMES_DIR}`);
    console.error('Make sure Ghostty is installed.');
    process.exit(1);
  }
  return themes;
}

const themes = loadThemes();

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
 * Access base16 normal colors (indices 0–7).
 * base('red') or base('r') → index 1
 */
const baseMap = { k: 0, r: 1, g: 2, y: 3, b: 4, m: 5, c: 6, w: 7,
  black: 0, red: 1, green: 2, yellow: 3, blue: 4, magenta: 5, cyan: 6, white: 7 };
function base(name) { return baseMap[name]; }

/**
 * Access base16 bright colors (indices 8–15).
 * bright('red') or bright('r') → index 9
 */
function bright(name) { return baseMap[name] + 8; }

/**
 * Semantic color lookup using ANSI color names.
 * Like HSL but for the 256-color cube — uses theme-relative names
 * instead of abstract r,g,b coordinates.
 *
 * Single hue:
 *   tint('red', 2)              → subtle red (cube(2,0,0))
 *   tint('blue', 4)             → strong blue (cube(0,0,4))
 *   tint('black', 3)            → mid surface (cube(0,0,0) region)
 *   tint('white', 5)            → full white/fg
 *
 * Two-hue blend:
 *   tint('red', 'blue', 3)      → purple (cube(3,0,3))
 *   tint('green', 'cyan', 4)    → teal (cube(0,4,4))
 *   tint('red', 'green', 2)     → olive (cube(2,2,0))
 *
 * @param {string} hue1 - ANSI color name
 * @param {string|number} hue2OrIntensity - second hue name, or intensity (0–5)
 * @param {number} [intensity] - intensity when two hues (0–5)
 * @returns {number} Palette index (16–231)
 */
function tint(opts) {
  // Shorthand prefix → axis mapping
  // k=black, r=red, g=green, y=yellow, b=blue, m=magenta, c=cyan, w=white
  const axes = {
    k: { r: 0, g: 0, b: 0 },
    r: { r: 1, g: 0, b: 0 },
    g: { r: 0, g: 1, b: 0 },
    y: { r: 1, g: 1, b: 0 },
    b: { r: 0, g: 0, b: 1 },
    m: { r: 1, g: 0, b: 1 },
    c: { r: 0, g: 1, b: 1 },
    w: { r: 1, g: 1, b: 1 },
  };

  let cr = 0, cg = 0, cb = 0;

  for (const [key, n] of Object.entries(opts)) {
    const ax = axes[key];
    if (!ax) continue;
    cr = Math.max(cr, ax.r * n);
    cg = Math.max(cg, ax.g * n);
    cb = Math.max(cb, ax.b * n);
  }

  return cube(cr, cg, cb);
}

/**
 * Access grayscale colors (indices 232–255).
 * neutral(n) where n ∈ 1–24 (1 = darkest, 24 = lightest)
 */
function neutral(n) {
  return 231 + Math.max(1, Math.min(24, n));
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
  const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
  const lines = [];

  // Reverse map: cube coords → tint({ prefix: n }) syntax
  function cubeToTint(cr, cg, cb) {
    if (cr === 0 && cg === 0 && cb === 0) return `tint({ k: 0 })`;

    // Check if expressible with a single prefix
    const rActive = cr > 0, gActive = cg > 0, bActive = cb > 0;
    const vals = [cr, cg, cb].filter(v => v > 0);
    const allSame = vals.every(v => v === vals[0]);
    const n = vals[0];

    if (allSame) {
      const key = `${rActive ? 1 : 0}${gActive ? 1 : 0}${bActive ? 1 : 0}`;
      const prefixMap = {
        '100': 'r', '010': 'g', '001': 'b',
        '110': 'y', '101': 'm', '011': 'c', '111': 'w',
      };
      const p = prefixMap[key];
      if (p) return `tint({ ${p}: ${n} })`;
    }

    // Multi-intensity: decompose into minimal prefix set
    const parts = [];
    if (cr > 0) parts.push(`r: ${cr}`);
    if (cg > 0) parts.push(`g: ${cg}`);
    if (cb > 0) parts.push(`b: ${cb}`);
    return `tint({ ${parts.join(', ')} })`;
  }

  // Base16 tint equivalents

  for (let i = 0; i < palette.length; i++) {
    const hex = palette[i];
    const { r, g, b } = hexToRgb(hex);
    const block = `\x1b[48;2;${r};${g};${b}m  ${RST}`;

    let label = '';
    if (i < 8) {
      const abbr = ['k','r','g','y','b','m','c','w'][i];
      label = `  ${names[i].padEnd(10)} → base('${abbr}')`;
    } else if (i < 16) {
      const abbr = ['k','r','g','y','b','m','c','w'][i - 8];
      label = `  bright ${names[i - 8].padEnd(5)} → bright('${abbr}')`;
    } else if (i <= 231) {
      const ci = i - 16;
      const cr = Math.floor(ci / 36);
      const cg = Math.floor((ci % 36) / 6);
      const cb = ci % 6;
      label = `  ${cubeToTint(cr, cg, cb)}`;
    } else {
      const step = i - 232 + 1;
      label = `  neutral(${String(step).padStart(2)})     → bg [${'█'.repeat(step)}${'·'.repeat(24 - step)}] fg`;
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
  console.log(`  ${DIM}base16  base(prefix) / bright(prefix)${RST}`);
  console.log('');

  const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
  const abbrs = ['k', 'r', 'g', 'y', 'b', 'm', 'c', 'w'];

  // Normal (0–7) with hex
  let row = `  ${DIM}base()  ${RST}  `;
  for (let i = 0; i < 8; i++) row += `${swatch(palette[i], ` ${palette[i]} `)} `;
  console.log(row);

  // Bright (8–15) with hex
  row = `  ${DIM}bright()${RST}  `;
  for (let i = 8; i < 16; i++) row += `${swatch(palette[i], ` ${palette[i]} `)} `;
  console.log(row);

  // Prefix legend
  row = '              ';
  for (let i = 0; i < 8; i++) row += `${DIM}  ${abbrs[i]}=${names[i].slice(0, 3)}  ${RST}`;
  console.log(row);

  // ── Color Cube — all 216 colors ──
  // 6 slices by r value, each is a 6×6 grid of g (rows) × b (columns)
  console.log('');
  console.log(`  ${DIM}color cube  216 colors  tint({ r, g, b })  values ∈ 0–5${RST}`);

  for (let cr = 0; cr < 6; cr++) {
    console.log('');
    console.log(`  ${DIM}r: ${cr}${RST}`);

    // b-axis header
    let header = `  ${DIM}${''.padEnd(10)}${RST}`;
    for (let cb = 0; cb < 6; cb++) header += `${DIM} b:${cb}    ${RST}`;
    console.log(header);

    for (let cg = 0; cg < 6; cg++) {
      let line = `  ${DIM}g: ${cg}${RST}       `;
      for (let cb = 0; cb < 6; cb++) {
        const idx = cube(cr, cg, cb);
        line += `${swatch(palette[idx], ` ${palette[idx]} `)} `;
      }
      console.log(line);
    }
  }

  // ── Grayscale ──
  console.log('');
  console.log(`  ${DIM}grayscale  24 colors  neutral(1–24)${RST}`);
  console.log('');

  // Show in rows of 6 with hex codes, matching cube layout
  for (let row = 0; row < 4; row++) {
    let line = '  ';
    for (let col = 0; col < 6; col++) {
      const n = row * 6 + col + 1;
      const i = neutral(n);
      line += `${swatch(palette[i], ` ${palette[i]} `)} `;
    }
    console.log(line);
  }

  // ── Background / Foreground ──
  console.log('');
  const bgSwatch = `${bg(theme.bg)}${contrastFg(theme.bg)}  bg ${theme.bg}  ${RST}`;
  const fgSwatch = `${bg(theme.fg)}${contrastFg(theme.fg)}  fg ${theme.fg}  ${RST}`;
  console.log(`  ${bgSwatch}  ${fgSwatch}`);
  console.log('');
}

// ── Interactive Mode ────────────────────────────────────────────────────

function generatePalette(theme) {
  const palette = [...theme.base16];
  palette.push(...generateColorCube(theme.base16, theme.bg, theme.fg));
  palette.push(...generateGrayscaleRamp(theme.bg, theme.fg));
  return palette;
}

function renderTuiDemo(palette, themeName) {
  const DIM = '\x1b[2m';
  const BOLD = '\x1b[1m';
  const swatch = (hex, label) =>
    `${bg(hex)}${contrastFg(hex)}${label}${RST}`;

  const p = (idx) => palette[idx];

  console.log('');
  console.log(`  ${DIM}TUI Preview — ${themeName}${RST}`);
  console.log('');

  // Surface colors
  const surfaceBg = p(tint({ k: 0 }));    // darkest surface
  const surface1 = p(tint({ w: 1 }));      // slightly lifted
  const selectedBg = p(tint({ b: 1 }));    // selected item
  const borderColor = p(neutral(4));
  const mutedText = p(neutral(12));
  const dimText = p(neutral(18));

  const W = 56;
  const pad = (s, w) => s + ' '.repeat(Math.max(0, w - s.length));

  const B = `${fg(borderColor)}${bg(surfaceBg)}`;

  // Variable legend
  console.log(`  ${DIM}surfaceBg  = tint({ k: 0 })   ${surfaceBg}${RST}`);
  console.log(`  ${DIM}surface1   = tint({ w: 1 })   ${surface1}${RST}`);
  console.log(`  ${DIM}selectedBg = tint({ b: 1 })   ${selectedBg}${RST}`);
  console.log(`  ${DIM}border     = neutral(4)        ${borderColor}${RST}`);
  console.log(`  ${DIM}mutedText  = neutral(12)       ${mutedText}${RST}`);
  console.log(`  ${DIM}dimText    = neutral(18)       ${dimText}${RST}`);
  console.log('');

  // Top border
  console.log(`  ${B}┌${'─'.repeat(W)}┐${RST}`);

  // Title bar
  console.log(`  ${B}│${RST}${bg(surface1)}${contrastFg(surface1)}${BOLD}  My App${RST}${bg(surface1)}${' '.repeat(W - 8)}${RST}${B}│${RST}  ${DIM}base('w') on surface1${RST}`);

  // Empty line on surface
  console.log(`  ${B}│${RST}${bg(surfaceBg)}${' '.repeat(W)}${RST}${B}│${RST}  ${DIM}surfaceBg${RST}`);

  // Status messages
  const msgs = [
    [p(base('g')), '✓ Task completed', "base('g')  success"],
    [p(base('y')), '⚠ Warning: disk space low', "base('y')  warning"],
    [p(base('r')), '✗ Connection failed', "base('r')  error"],
  ];
  for (const [color, text, fn] of msgs) {
    const content = `  ${fg(color)}${text}${RST}`;
    const visLen = text.length + 2;
    console.log(`  ${B}│${RST}${bg(surfaceBg)}${content}${bg(surfaceBg)}${' '.repeat(W - visLen)}${RST}${B}│${RST}  ${DIM}${fn}${RST}`);
  }

  // Empty line
  console.log(`  ${B}│${RST}${bg(surfaceBg)}${' '.repeat(W)}${RST}${B}│${RST}`);

  // Selected item
  const selInner = `  item-one.txt`;
  console.log(`  ${B}│${RST}${bg(surfaceBg)}  ${bg(selectedBg)}${contrastFg(selectedBg)}${selInner}${' '.repeat(W - selInner.length - 4)}${RST}${bg(surfaceBg)}  ${RST}${B}│${RST}  ${DIM}selectedBg${RST}`);

  // Normal items
  const items = ['item-two.txt', 'item-three.txt'];
  for (const item of items) {
    const content = `    ${fg(dimText)}${item}${RST}`;
    const visLen = item.length + 4;
    console.log(`  ${B}│${RST}${bg(surfaceBg)}${content}${bg(surfaceBg)}${' '.repeat(W - visLen)}${RST}${B}│${RST}  ${DIM}dimText${RST}`);
  }

  // Empty line
  console.log(`  ${B}│${RST}${bg(surfaceBg)}${' '.repeat(W)}${RST}${B}│${RST}`);

  // Buttons
  const btnBg = p(tint({ b: 3 }));
  const btnSave = `${bg(btnBg)}${contrastFg(btnBg)} Save ${RST}`;
  const btnCancel = `${bg(p(neutral(6)))}${contrastFg(p(neutral(6)))} Cancel ${RST}`;
  const btnVisLen = 2 + 6 + 1 + 8; // '  ' + ' Save ' + ' ' + ' Cancel '
  console.log(`  ${B}│${RST}${bg(surfaceBg)}  ${btnSave}${bg(surfaceBg)} ${btnCancel}${bg(surfaceBg)}${' '.repeat(W - btnVisLen)}${RST}${B}│${RST}  ${DIM}tint({ b: 3 }), neutral(6)${RST}`);

  // Empty line
  console.log(`  ${B}│${RST}${bg(surfaceBg)}${' '.repeat(W)}${RST}${B}│${RST}`);

  // Separator
  console.log(`  ${B}├${fg(p(neutral(6)))}${bg(surfaceBg)}${'─'.repeat(W)}${RST}${B}┤${RST}  ${DIM}border${RST}`);

  // Status bar
  const statusText = `  Status: connected`;
  console.log(`  ${B}│${RST}${bg(surfaceBg)}  ${fg(mutedText)}${statusText}${RST}${bg(surfaceBg)}${' '.repeat(W - statusText.length - 2)}${RST}${B}│${RST}  ${DIM}mutedText${RST}`);

  // Bottom border
  console.log(`  ${B}└${'─'.repeat(W)}┘${RST}`);
  console.log('');
}

async function runInteractive() {
  const themeNames = Object.keys(themes);
  let currentIdx = 0;
  let showTable = false;

  const CLEAR = '\x1b[2J\x1b[H';
  const HIDE_CURSOR = '\x1b[?25l';
  const SHOW_CURSOR = '\x1b[?25h';
  const DIM = '\x1b[2m';

  function render() {
    const themeName = themeNames[currentIdx];
    const theme = themes[themeName];
    const palette = generatePalette(theme);

    process.stdout.write(CLEAR);

    console.log('');
    console.log(`  ${DIM}← →  switch theme    t  toggle table    q  quit${RST}`);
    console.log(`  ${DIM}theme ${currentIdx + 1}/${themeNames.length}:${RST}  ${bg(theme.bg)}${contrastFg(theme.bg)} ${themeName} ${RST}`);

    // TUI demo
    renderTuiDemo(palette, themeName);

    // Color table (toggled)
    if (showTable) {
      renderPreview(palette, theme, themeName);
    }
  }

  // Setup raw mode and alternate screen
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdout.write(HIDE_CURSOR);

  render();

  process.stdin.on('data', (key) => {
    if (key === 'q' || key === '\x03') {
      process.stdout.write(SHOW_CURSOR);
      process.exit(0);
    }
    if (key === 't') {
      showTable = !showTable;
      render();
    }
    if (key === '\x1b[C' || key === 'l') {
      currentIdx = (currentIdx + 1) % themeNames.length;
      render();
    }
    if (key === '\x1b[D' || key === 'h') {
      currentIdx = (currentIdx - 1 + themeNames.length) % themeNames.length;
      render();
    }
  });
}

// ── Main ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const tableMode = args.includes('--table');
const interactiveMode = args.includes('--interactive');
const listMode = args.includes('--list');
const themeIdx = args.indexOf('--theme');
const themeName = themeIdx !== -1 && args[themeIdx + 1] ? args[themeIdx + 1] : (
  args.find(a => !a.startsWith('--')) || 'Catppuccin Mocha'
);

if (listMode) {
  const names = Object.keys(themes).sort();
  console.log(`${names.length} themes available:\n`);
  for (const name of names) console.log(`  ${name}`);
} else if (interactiveMode) {
  runInteractive();
} else {
  const theme = themes[themeName];

  if (!theme) {
    console.error(`Unknown theme: ${themeName}`);
    console.error(`Available themes: ${Object.keys(themes).join(', ')}`);
    process.exit(1);
  }

  const palette = generatePalette(theme);
  const cubeColors = palette.slice(16, 232);
  const grayscale = palette.slice(232);

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

  console.error(`\n✅ Generated ${palette.length} colors for ${themeName}`);
  console.error(`   Base16:    0-15  (${theme.base16.length} colors)`);
  console.error(`   Color cube: 16-231 (${cubeColors.length} colors)`);
  console.error(`   Grayscale: 232-255 (${grayscale.length} colors)`);
}
