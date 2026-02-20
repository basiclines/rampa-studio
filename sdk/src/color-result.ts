import chroma from 'chroma-js';
import type { ColorFormat, ColorResult } from './types';

/**
 * Create a ColorResult from a hex string.
 * Acts as a string (hex) by default, supports .format() for conversions.
 */
export function createColorResult(hex: string): ColorResult {
  const result: ColorResult = {
    hex,
    format(fmt: ColorFormat): string {
      const c = chroma(hex);
      switch (fmt) {
        case 'hsl': {
          const [h, s, l] = c.hsl();
          return `hsl(${Math.round(h || 0)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
        }
        case 'rgb': {
          const [r, g, b] = c.rgb();
          return `rgb(${r}, ${g}, ${b})`;
        }
        case 'oklch': {
          const [l, ch, h] = c.oklch();
          return `oklch(${(l * 100).toFixed(1)}% ${ch.toFixed(3)} ${Math.round(h || 0)})`;
        }
        default:
          return hex;
      }
    },
    toString(): string {
      return hex;
    },
  };
  return result;
}
