/**
 * OklchMathEngine — Clean-room OKLCH ↔ sRGB conversions from public specs.
 *
 * Implements the full conversion pipeline:
 *   sRGB ↔ Linear RGB ↔ CIE XYZ (D65) ↔ OKLab ↔ OKLCH
 *
 * References:
 *   - Björn Ottosson, "A perceptual color space for image processing"
 *     https://bottosson.github.io/posts/oklab/
 *   - CSS Color Level 4 specification
 *     https://www.w3.org/TR/css-color-4/
 *   - IEC 61966-2-1 (sRGB gamma)
 *     https://www.w3.org/TR/css-color-4/#color-conversion-code
 */

// ── sRGB Gamma (IEC 61966-2-1) ───────────────────────────────────────

/** Remove sRGB gamma — convert a single channel (0–1) to linear light. */
export function linearize(c: number): number {
  if (c <= 0.04045) return c / 12.92;
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Apply sRGB gamma — convert a linear channel (0–1) to sRGB. */
export function delinearize(c: number): number {
  if (c <= 0.0031308) return c * 12.92;
  return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ── sRGB ↔ Linear RGB (convenience for 0–255 channels) ──────────────

export function srgbToLinear(r: number, g: number, b: number): [number, number, number] {
  return [linearize(r / 255), linearize(g / 255), linearize(b / 255)];
}

export function linearToSrgb(lr: number, lg: number, lb: number): [number, number, number] {
  return [
    Math.round(Math.max(0, Math.min(1, delinearize(lr))) * 255),
    Math.round(Math.max(0, Math.min(1, delinearize(lg))) * 255),
    Math.round(Math.max(0, Math.min(1, delinearize(lb))) * 255),
  ];
}

// ── OKLab conversion (Ottosson 2020) ─────────────────────────────────
// The OKLab color space is defined by two matrices (M1, M2) and a cube
// root non-linearity, applied to linear sRGB. The matrices below are the
// exact values from Ottosson's reference implementation.

/**
 * Convert linear sRGB to OKLab (L, a, b).
 * Based on Ottosson's optimised matrices that go directly from linear
 * sRGB to the intermediate LMS-like space, skipping the explicit XYZ step.
 */
export function linearSrgbToOklab(lr: number, lg: number, lb: number): [number, number, number] {
  // M1: linear sRGB → approximate cone responses (long, medium, short)
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // Cube root non-linearity
  const lc = Math.cbrt(l);
  const mc = Math.cbrt(m);
  const sc = Math.cbrt(s);

  // M2: cone responses → OKLab
  const L = 0.2104542553 * lc + 0.7936177850 * mc - 0.0040720468 * sc;
  const a = 1.9779984951 * lc - 2.4285922050 * mc + 0.4505937099 * sc;
  const b = 0.0259040371 * lc + 0.7827717662 * mc - 0.8086757660 * sc;

  return [L, a, b];
}

/**
 * Convert OKLab (L, a, b) to linear sRGB.
 */
export function oklabToLinearSrgb(L: number, a: number, b: number): [number, number, number] {
  // Inverse M2: OKLab → cube-root cone responses
  const lc = L + 0.3963377774 * a + 0.2158037573 * b;
  const mc = L - 0.1055613458 * a - 0.0638541728 * b;
  const sc = L - 0.0894841775 * a - 1.2914855480 * b;

  // Undo cube root
  const l = lc * lc * lc;
  const m = mc * mc * mc;
  const s = sc * sc * sc;

  // Inverse M1: cone responses → linear sRGB
  const lr =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return [lr, lg, lb];
}

// ── OKLab ↔ OKLCH (cartesian ↔ polar) ────────────────────────────────

export function oklabToOklch(L: number, a: number, b: number): [number, number, number] {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

export function oklchToOklab(L: number, C: number, H: number): [number, number, number] {
  const hRad = (H * Math.PI) / 180;
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

// ── High-level conversions ───────────────────────────────────────────

/** Convert a hex color string to OKLCH [L, C, H]. */
export function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgbTuple(hex);
  const [lr, lg, lb] = srgbToLinear(r, g, b);
  const [L, a, bLab] = linearSrgbToOklab(lr, lg, lb);
  return oklabToOklch(L, a, bLab);
}

/** Convert OKLCH [L, C, H] to a hex color string. Clamps to sRGB. */
export function oklchToHex(L: number, C: number, H: number): string {
  const [, a, b] = oklchToOklab(L, C, H);
  const [lr, lg, lb] = oklabToLinearSrgb(L, a, b);
  const [r, g, bVal] = linearToSrgb(lr, lg, lb);
  return rgbToHex(r, g, bVal);
}

/** Convert RGB values (0-255) to OKLCH [L, C, H]. */
export function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const [lr, lg, lb] = srgbToLinear(r, g, b);
  const [L, a, bLab] = linearSrgbToOklab(lr, lg, lb);
  return oklabToOklch(L, a, bLab);
}

/** Convert OKLCH [L, C, H] to sRGB values (0-255). */
export function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
  const [, a, b] = oklchToOklab(L, C, H);
  const [lr, lg, lb] = oklabToLinearSrgb(L, a, b);
  return linearToSrgb(lr, lg, lb);
}

// ── Gamut checking & clamping ────────────────────────────────────────

/** Check if an OKLCH color is within the sRGB gamut. */
export function isInSrgbGamut(L: number, C: number, H: number): boolean {
  const [, a, b] = oklchToOklab(L, C, H);
  const [lr, lg, lb] = oklabToLinearSrgb(L, a, b);
  // Allow a small epsilon for floating-point rounding
  const eps = 1e-6;
  return (
    lr >= -eps && lr <= 1 + eps &&
    lg >= -eps && lg <= 1 + eps &&
    lb >= -eps && lb <= 1 + eps
  );
}

/**
 * Clamp an OKLCH color to the sRGB gamut by reducing chroma via binary
 * search while preserving lightness and hue.
 */
export function gamutClampOklch(L: number, C: number, H: number): [number, number, number] {
  if (isInSrgbGamut(L, C, H)) return [L, C, H];

  // Clamp lightness extremes
  if (L <= 0) return [0, 0, H];
  if (L >= 1) return [1, 0, H];

  // Binary search on chroma
  let lo = 0;
  let hi = C;
  const maxIter = 20;
  const epsilon = 0.001;

  for (let i = 0; i < maxIter && (hi - lo) > epsilon; i++) {
    const mid = (lo + hi) / 2;
    if (isInSrgbGamut(L, mid, H)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return [L, lo, H];
}

// ── Color string parsing ─────────────────────────────────────────────

/** Parse a hex color string to RGB (0-255). Supports #RGB, #RGBA, #RRGGBB, #RRGGBBAA. */
export function hexToRgbTuple(hex: string): [number, number, number] {
  let h = hex.replace(/^#/, '');
  // Expand shorthand (#RGB → #RRGGBB, #RGBA → #RRGGBBAA)
  if (h.length === 3 || h.length === 4) {
    h = h.split('').map(c => c + c).join('');
  }
  const n = parseInt(h.substring(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Format RGB (0-255) as a hex color string. */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Parse a CSS color string to RGB (0-255).
 * Supports: hex (#RGB, #RRGGBB), rgb(r, g, b), hsl(h, s%, l%), oklch(L C H).
 */
export function parseColorToRgb(color: string): [number, number, number] | null {
  const s = color.trim().toLowerCase();

  // Hex
  if (s.startsWith('#')) {
    return hexToRgbTuple(s);
  }

  // rgb(r, g, b) or rgb(r g b)
  const rgbMatch = s.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)/);
  if (rgbMatch) {
    return [
      Math.round(parseFloat(rgbMatch[1])),
      Math.round(parseFloat(rgbMatch[2])),
      Math.round(parseFloat(rgbMatch[3])),
    ];
  }

  // hsl(h, s%, l%) or hsl(h s% l%)
  const hslMatch = s.match(/^hsla?\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)%\s*[,\s]\s*(\d+(?:\.\d+)?)%/);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const sat = parseFloat(hslMatch[2]) / 100;
    const lum = parseFloat(hslMatch[3]) / 100;
    return hslToRgb(h, sat, lum);
  }

  // oklch(L C H)
  const oklchMatch = s.match(/^oklch\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/);
  if (oklchMatch) {
    const L = parseFloat(oklchMatch[1]);
    const C = parseFloat(oklchMatch[2]);
    const H = parseFloat(oklchMatch[3]);
    return oklchToRgb(L, C, H);
  }

  return null;
}

// ── HSL → RGB helper ─────────────────────────────────────────────────

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1: number, g1: number, b1: number;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }

  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}
