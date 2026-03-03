/**
 * ApcaEngine — Clean-room APCA implementation from the W3C specification.
 *
 * Implements the Accessible Perceptual Contrast Algorithm (APCA) version
 * 0.0.98G-4g as documented in the W3C Silver Task Force wiki and the
 * SAPC-APCA LaTeX specification.
 *
 * References:
 *   - W3C Silver Wiki — APCA Model:
 *     https://www.w3.org/WAI/GL/task-forces/silver/wiki/User:Myndex/APCA_model
 *   - SAPC-APCA LaTeX formula (0.0.98G-4g):
 *     https://github.com/Myndex/SAPC-APCA/blob/master/documentation/APCA-W3-LaTeX.md
 */

// ── Constants (0.0.98G-4g-sRGB) ──────────────────────────────────────

const S_TRC = 2.4;

// sRGB luminance coefficients
const S_R = 0.2126729;
const S_G = 0.7151522;
const S_B = 0.0721750;

// Black soft-clamp
const B_THRSH = 0.022;
const B_CLIP = 1.414;

// Polarity exponents — normal (dark text on light bg)
const N_TX = 0.57;
const N_BG = 0.56;

// Polarity exponents — reverse (light text on dark bg)
const R_TX = 0.62;
const R_BG = 0.65;

// Output scaling
const W_SCALE = 1.14;
const W_OFFSET = 0.027;
const W_CLAMP = 0.1;

// ── sRGB to estimated screen luminance (Y) ───────────────────────────

/**
 * Convert sRGB channel values (0–255) to estimated screen luminance Y.
 * Linearizes via the simple gamma model (^2.4) and applies ITU coefficients.
 */
export function sRGBtoY(r: number, g: number, b: number): number {
  return (
    Math.pow(r / 255, S_TRC) * S_R +
    Math.pow(g / 255, S_TRC) * S_G +
    Math.pow(b / 255, S_TRC) * S_B
  );
}

// ── Black soft-clamp ─────────────────────────────────────────────────

/**
 * Soft-clamp near-black luminance values. Prevents divide-by-zero and
 * perceptual-floor artifacts in the APCA power curves.
 */
function softClamp(y: number): number {
  if (y < 0) return 0;
  if (y < B_THRSH) return y + Math.pow(B_THRSH - y, B_CLIP);
  return y;
}

// ── APCA Lc contrast ─────────────────────────────────────────────────

/**
 * Compute the APCA Lightness-contrast (Lc) value between a text color
 * and a background color, given their estimated luminance values.
 *
 * Positive Lc → dark text on light background (normal polarity).
 * Negative Lc → light text on dark background (reverse polarity).
 */
export function apcaContrastFromY(textY: number, bgY: number): number {
  const yTxt = softClamp(textY);
  const yBg = softClamp(bgY);

  let sapc: number;

  if (yBg > yTxt) {
    // Normal polarity: dark text on light background
    sapc = (Math.pow(yBg, N_BG) - Math.pow(yTxt, N_TX)) * W_SCALE;
  } else {
    // Reverse polarity: light text on dark background
    sapc = (Math.pow(yBg, R_BG) - Math.pow(yTxt, R_TX)) * W_SCALE;
  }

  // Clamp near-zero contrast to 0
  if (Math.abs(sapc) < W_CLAMP) return 0;

  // Apply offset and scale to percentage
  if (sapc > 0) {
    return (sapc - W_OFFSET) * 100;
  } else {
    return (sapc + W_OFFSET) * 100;
  }
}

// ── Hex convenience wrapper ──────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace(/^#/, '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Compute APCA Lc contrast between two hex colors.
 * Uses chroma-js for robust color parsing when available, falls back to
 * simple hex parsing.
 */
export function computeApcaLc(fgHex: string, bgHex: string): number {
  const [fR, fG, fB] = hexToRgb(fgHex);
  const [bR, bG, bB] = hexToRgb(bgHex);
  return apcaContrastFromY(sRGBtoY(fR, fG, fB), sRGBtoY(bR, bG, bB));
}
