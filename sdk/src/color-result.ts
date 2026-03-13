import chroma from 'chroma-js';
import type { ColorFormat, Color, ColorAccessor, RampaOutputFormat } from './types';

/**
 * Detect the format of a color string.
 */
export function detectColorFormat(color: string): ColorFormat {
  const trimmed = color.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) return 'hex';
  if (/^rgb\s*\(/.test(trimmed)) return 'rgb';
  if (/^hsl\s*\(/.test(trimmed)) return 'hsl';
  if (/^oklch\s*\(/.test(trimmed)) return 'oklch';
  throw new Error(`Unknown color format: ${color}`);
}

/**
 * Validate that all colors in an array share the same format.
 * Returns the detected format.
 */
export function validateSameFormat(colors: string[]): ColorFormat {
  const formats = colors.map(c => detectColorFormat(c));
  const first = formats[0];
  for (let i = 1; i < formats.length; i++) {
    if (formats[i] !== first) {
      throw new Error(
        `All colors must use the same format. Found '${first}' and '${formats[i]}': ${colors[0]} vs ${colors[i]}`
      );
    }
  }
  return first;
}

/**
 * Create a ColorAccessor from a hex string with a given output format.
 * Returns a String object with conversion methods so it acts as a string
 * in template literals, comparisons, and concatenation.
 */
export function createColorAccessor(hex: string, outputFormat: ColorFormat): ColorAccessor {
  const c = chroma(hex);
  const [l] = c.oklch();

  const formatColor = (fmt: ColorFormat): string => {
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
  };

  const value = formatColor(outputFormat);

  // Use a String object so typeof coercion and === with strings works naturally
  const accessor = new String(value) as unknown as ColorAccessor;
  Object.defineProperties(accessor, {
    hex:       { value: () => c.hex(),               enumerable: false },
    hsl:       { value: () => formatColor('hsl'),   enumerable: false },
    rgb:       { value: () => formatColor('rgb'),   enumerable: false },
    oklch:     { value: () => formatColor('oklch'), enumerable: false },
    luminance: { value: l,                          enumerable: false },
  });

  return accessor;
}

/**
 * Create a Color primitive from any valid color string.
 * Provides .hex, .rgb, .hsl, .oklch, .luminance, .format(), .output().
 */
export function createColor(input: string): Color {
  let c: ReturnType<typeof chroma>;
  try {
    c = chroma(input);
  } catch {
    throw new Error(`Invalid color: "${input}"`);
  }

  const hex = c.hex();
  const [r, g, b] = c.rgb();
  const [hh, ss, ll] = c.hsl();
  const [ol, oc, oh] = c.oklch();

  const rgb = { r, g, b };
  const hsl = { h: Math.round(hh || 0), s: Math.round(ss * 100), l: Math.round(ll * 100) };
  const oklch = { l: parseFloat((ol * 100).toFixed(1)), c: parseFloat(oc.toFixed(3)), h: Math.round(oh || 0) };

  const formatColor = (fmt: ColorFormat): string => {
    switch (fmt) {
      case 'hsl':
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      case 'rgb':
        return `rgb(${r}, ${g}, ${b})`;
      case 'oklch':
        return `oklch(${(ol * 100).toFixed(1)}% ${oc.toFixed(3)} ${Math.round(oh || 0)})`;
      default:
        return hex;
    }
  };

  const result: Color = {
    hex,
    rgb,
    hsl,
    oklch,
    luminance: ol,

    format(fmt: ColorFormat): string {
      return formatColor(fmt);
    },

    output(format: RampaOutputFormat, prefix?: string): string {
      const name = prefix || 'color';
      switch (format) {
        case 'css': {
          const lines: string[] = [':root {'];
          lines.push(`  --${name}-hex: ${hex};`);
          lines.push(`  --${name}-rgb: ${formatColor('rgb')};`);
          lines.push(`  --${name}-hsl: ${formatColor('hsl')};`);
          lines.push(`  --${name}-oklch: ${formatColor('oklch')};`);
          lines.push('}');
          return lines.join('\n');
        }
        case 'json':
          return JSON.stringify({ hex, rgb, hsl, oklch }, null, 2);
        case 'text':
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
