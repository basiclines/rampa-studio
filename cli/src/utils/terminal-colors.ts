/**
 * Terminal color utilities with fallback support for terminals
 * that don't properly support 24-bit truecolor
 */

/**
 * Detects if the terminal supports 24-bit truecolor
 * Based on standard environment variables used across terminals
 */
export function supportsTruecolor(): boolean {
  const colorterm = process.env.COLORTERM?.toLowerCase() || '';
  
  // COLORTERM=truecolor or COLORTERM=24bit indicates truecolor support
  if (colorterm === 'truecolor' || colorterm === '24bit') {
    return true;
  }
  
  // Some terminals set specific TERM values for truecolor
  const term = process.env.TERM?.toLowerCase() || '';
  if (term.includes('truecolor') || term.includes('24bit') || term.includes('direct')) {
    return true;
  }
  
  // Default to false - use 256-color fallback for safety
  return false;
}

/**
 * Detects if the terminal has limited color support (no truecolor)
 */
export function hasLimitedColorSupport(): boolean {
  return !supportsTruecolor();
}

/**
 * Converts RGB values to the closest ANSI 256-color code
 * Uses the 6x6x6 color cube (codes 16-231) for color matching
 */
export function rgbTo256(r: number, g: number, b: number): number {
  // Check for grayscale (24 shades from 232-255)
  if (r === g && g === b) {
    if (r < 8) return 16; // black
    if (r > 248) return 231; // white
    return Math.round((r - 8) / 10) + 232;
  }

  // Map to 6x6x6 color cube (codes 16-231)
  const rIndex = Math.round(r / 255 * 5);
  const gIndex = Math.round(g / 255 * 5);
  const bIndex = Math.round(b / 255 * 5);

  return 16 + (36 * rIndex) + (6 * gIndex) + bIndex;
}

/**
 * Creates a colored square character for terminal output
 * Uses 256-color mode for terminals with limited support, truecolor otherwise
 */
export function coloredSquare(r: number, g: number, b: number): string {
  if (hasLimitedColorSupport()) {
    const colorCode = rgbTo256(r, g, b);
    return `\x1b[38;5;${colorCode}m■\x1b[0m`;
  }
  return `\x1b[38;2;${r};${g};${b}m■\x1b[0m`;
}

/**
 * Returns a warning message if using limited color mode
 */
export function getColorLimitationNote(): string | null {
  if (hasLimitedColorSupport()) {
    const dim = '\x1b[2m';
    const yellow = '\x1b[33m';
    const reset = '\x1b[0m';
    return `${yellow}Note:${reset} ${dim}Using 256-color mode. Terminal does not advertise truecolor support.${reset}\n${dim}For accurate color previews, use a terminal with COLORTERM=truecolor.${reset}`;
  }
  return null;
}
