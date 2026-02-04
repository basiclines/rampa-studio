/**
 * Terminal color utilities with fallback support for terminals
 * that don't properly support 24-bit truecolor (like macOS Terminal.app)
 */

/**
 * Detects if the terminal has poor truecolor support
 * macOS Terminal.app is known to have issues with 24-bit color rendering
 */
export function hasLimitedColorSupport(): boolean {
  return process.env.TERM_PROGRAM === 'Apple_Terminal';
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
    return `${yellow}Note:${reset} ${dim}Using 256-color mode. macOS Terminal.app has limited truecolor support.${reset}\n${dim}For accurate color previews, use iTerm2, Warp, kitty, or another truecolor terminal.${reset}`;
  }
  return null;
}
