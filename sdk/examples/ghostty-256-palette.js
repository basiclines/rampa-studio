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

import { rampa, LinearColorSpace, CubeColorSpace, colorTable } from '@basiclines/rampa-sdk';
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

// ── Color Space Construction ───────────────────────────────────────────

const ANSI_NAMES = ['k', 'r', 'g', 'y', 'b', 'm', 'c', 'w'];
const baseMap = { k: 0, r: 1, g: 2, y: 3, b: 4, m: 5, c: 6, w: 7,
  black: 0, red: 1, green: 2, yellow: 3, blue: 4, magenta: 5, cyan: 6, white: 7 };

/**
 * Build color space functions for a given theme.
 * Returns tint, neutral, base, bright — all returning hex directly.
 */
function buildColorSpace(theme) {
  const tint = new CubeColorSpace({
    k: theme.bg,
    r: theme.base16[1],
    g: theme.base16[2],
    b: theme.base16[4],
    y: theme.base16[3],
    m: theme.base16[5],
    c: theme.base16[6],
    w: theme.fg,
  }).size(6);

  const neutral = new LinearColorSpace(theme.bg, theme.fg).size(24);

  // Plain lookup tables — no interpolation
  // Wrap with name→index mapping for base('r'), bright('r') syntax
  const baseTable   = colorTable(theme.base16.slice(0, 8));
  const brightTable = colorTable(theme.base16.slice(8, 16));
  const base   = (name) => baseTable(baseMap[name] + 1);
  const bright = (name) => brightTable(baseMap[name] + 1);
  base.palette   = baseTable.palette;
  bright.palette = brightTable.palette;

  // Build full 256-color palette for Ghostty config output
  const palette = [
    ...base.palette,      // 0-7
    ...bright.palette,    // 8-15
    ...tint.palette,      // 16-231
    ...neutral.palette,   // 232-255
  ];

  return { tint, neutral, base, bright, palette };
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

  // Index helpers for rendering the table
  const cube = (r, g, b) => 16 + 36 * r + 6 * g + b;
  const neutralIdx = (n) => 231 + Math.max(1, Math.min(24, n));

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
      const i = neutralIdx(n);
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
  const cs = buildColorSpace(theme);
  return cs;
}

function renderTuiDemo(cs, themeName) {
  const { tint, neutral, base, bright } = cs;
  const DIM = '\x1b[2m';
  const BOLD = '\x1b[1m';
  const swatch = (hex, label) =>
    `${bg(hex)}${contrastFg(hex)}${label}${RST}`;

  console.log('');
  console.log(`  ${DIM}TUI Preview — ${themeName}${RST}`);
  console.log('');

  // Design tokens — functions return hex directly via ColorResult
  const backgroundPrimary   = tint({ k: 0 }).hex;
  const backgroundSecondary = tint({ w: 1 }).hex;
  const surfacePrimary      = tint({ b: 1 }).hex;
  const textPrimary         = base('w').hex;
  const textSecondary       = neutral(18).hex;
  const textTertiary        = neutral(12).hex;
  const statusSuccess       = base('g').hex;
  const statusWarning       = base('y').hex;
  const statusDanger        = base('r').hex;
  const statusInfo          = base('b').hex;
  const selected            = tint({ b: 2 }).hex;
  const border              = neutral(4).hex;

  const W = 56;
  const B = `${fg(border)}${bg(backgroundPrimary)}`;

  // Token legend with swatches
  const tokens = [
    ['backgroundPrimary  ', 'tint({ k: 0 })', backgroundPrimary],
    ['backgroundSecondary', 'tint({ w: 1 })', backgroundSecondary],
    ['surfacePrimary     ', 'tint({ b: 1 })', surfacePrimary],
    ['textPrimary        ', "base('w')     ", textPrimary],
    ['textSecondary      ', 'neutral(18)   ', textSecondary],
    ['textTertiary       ', 'neutral(12)   ', textTertiary],
    ['statusSuccess      ', "base('g')     ", statusSuccess],
    ['statusWarning      ', "base('y')     ", statusWarning],
    ['statusDanger       ', "base('r')     ", statusDanger],
    ['statusInfo         ', "base('b')     ", statusInfo],
    ['selected           ', 'tint({ b: 2 })', selected],
    ['border             ', 'neutral(4)    ', border],
  ];
  for (const [name, fn, hex] of tokens) {
    const { r, g, b: bl } = hexToRgb(hex);
    const swatch = `\x1b[48;2;${r};${g};${bl}m    ${RST}`;
    console.log(`  ${swatch} ${DIM}${name} = ${fn}  ${hex}${RST}`);
  }
  console.log('');

  // ── TUI ──
  // Top border
  console.log(`  ${B}┌${'─'.repeat(W)}┐${RST}`);

  // Title bar
  console.log(`  ${B}│${RST}${bg(backgroundSecondary)}${fg(textPrimary)}${BOLD}  My App${RST}${bg(backgroundSecondary)}${' '.repeat(W - 8)}${RST}${B}│${RST}  ${DIM}backgroundSecondary + textPrimary${RST}`);

  // Empty line
  console.log(`  ${B}│${RST}${bg(backgroundPrimary)}${' '.repeat(W)}${RST}${B}│${RST}`);

  // Status messages
  const msgs = [
    [statusSuccess, '✓ Task completed',          'statusSuccess'],
    [statusWarning, '⚠ Warning: disk space low', 'statusWarning'],
    [statusDanger,  '✗ Connection failed',        'statusDanger'],
    [statusInfo,    'ℹ 3 updates available',      'statusInfo'],
  ];
  for (const [color, text, token] of msgs) {
    const content = `  ${fg(color)}${text}${RST}`;
    const visLen = text.length + 2;
    console.log(`  ${B}│${RST}${bg(backgroundPrimary)}${content}${bg(backgroundPrimary)}${' '.repeat(W - visLen)}${RST}${B}│${RST}  ${DIM}${token}${RST}`);
  }

  // Empty line
  console.log(`  ${B}│${RST}${bg(backgroundPrimary)}${' '.repeat(W)}${RST}${B}│${RST}`);

  // Section header
  const sectionText = '  Files';
  console.log(`  ${B}│${RST}${bg(backgroundPrimary)}${fg(textTertiary)}${sectionText}${RST}${bg(backgroundPrimary)}${' '.repeat(W - sectionText.length)}${RST}${B}│${RST}  ${DIM}textTertiary${RST}`);

  // Selected item
  const selInner = '  item-one.txt';
  console.log(`  ${B}│${RST}${bg(backgroundPrimary)}  ${bg(selected)}${contrastFg(selected)}${selInner}${' '.repeat(W - selInner.length - 4)}${RST}${bg(backgroundPrimary)}  ${RST}${B}│${RST}  ${DIM}selected${RST}`);

  // Normal items
  const items = [
    ['item-two.txt', 'textPrimary'],
    ['item-three.txt', 'textSecondary'],
  ];
  for (const [item, token] of items) {
    const textColor = token === 'textPrimary' ? textPrimary : textSecondary;
    const content = `    ${fg(textColor)}${item}${RST}`;
    const visLen = item.length + 4;
    console.log(`  ${B}│${RST}${bg(backgroundPrimary)}${content}${bg(backgroundPrimary)}${' '.repeat(W - visLen)}${RST}${B}│${RST}  ${DIM}${token}${RST}`);
  }

  // Empty line
  console.log(`  ${B}│${RST}${bg(backgroundPrimary)}${' '.repeat(W)}${RST}${B}│${RST}`);

  // Buttons on surface
  const btnPrimary = `${bg(tint({ b: 3 }).hex)}${contrastFg(tint({ b: 3 }).hex)} Save ${RST}`;
  const btnSecondary = `${bg(surfacePrimary)}${contrastFg(surfacePrimary)} Cancel ${RST}`;
  const btnVisLen = 2 + 6 + 1 + 8;
  console.log(`  ${B}│${RST}${bg(backgroundPrimary)}  ${btnPrimary}${bg(backgroundPrimary)} ${btnSecondary}${bg(backgroundPrimary)}${' '.repeat(W - btnVisLen)}${RST}${B}│${RST}  ${DIM}surfacePrimary${RST}`);

  // Empty line
  console.log(`  ${B}│${RST}${bg(backgroundPrimary)}${' '.repeat(W)}${RST}${B}│${RST}`);

  // Separator
  console.log(`  ${B}├${'─'.repeat(W)}┤${RST}  ${DIM}border${RST}`);

  // Status bar
  const statusText = '  Status: connected';
  console.log(`  ${B}│${RST}${bg(backgroundPrimary)}  ${fg(textTertiary)}${statusText}${RST}${bg(backgroundPrimary)}${' '.repeat(W - statusText.length - 2)}${RST}${B}│${RST}  ${DIM}textTertiary${RST}`);

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
    const cs = generatePalette(theme);

    process.stdout.write(CLEAR);

    console.log('');
    console.log(`  ${DIM}← →  switch theme    t  toggle table    q  quit${RST}`);
    console.log(`  ${DIM}theme ${currentIdx + 1}/${themeNames.length}:${RST}  ${bg(theme.bg)}${contrastFg(theme.bg)} ${themeName} ${RST}`);

    // TUI demo
    renderTuiDemo(cs, themeName);

    // Color table (toggled)
    if (showTable) {
      renderPreview(cs.palette, theme, themeName);
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

  const cs = generatePalette(theme);
  const { palette } = cs;
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
