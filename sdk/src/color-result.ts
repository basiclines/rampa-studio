import chroma from 'chroma-js';
import { convertToOklch, convertFromOklch, constrainOklchValues } from '../../src/engine/OklchEngine';
import { mixWithMode } from '../../src/engine/ColorSpaceEngine';
import { applyBlendMode } from '../../src/engine/BlendingEngine';
import type { ColorFormat, Color, ColorAccessor, RampaOutputFormat, BlendMode, InterpolationMode, OklchSetValues } from './types';

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
  const hsl = { h: Math.round(hh || 0), s: parseFloat(ss.toFixed(2)), l: parseFloat(ll.toFixed(2)) };
  const oklch = { l: parseFloat(ol.toFixed(3)), c: parseFloat(oc.toFixed(3)), h: Math.round(oh || 0) };

  const formatColor = (fmt: ColorFormat): string => {
    switch (fmt) {
      case 'hsl':
        return `hsl(${hsl.h}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
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

    lighten(delta: number): Color {
      const o = convertToOklch(hex);
      o.l = Math.max(0, Math.min(1, o.l + delta));
      return createColor(convertFromOklch(constrainOklchValues(o)));
    },

    darken(delta: number): Color {
      return this.lighten(-delta);
    },

    saturate(delta: number): Color {
      const o = convertToOklch(hex);
      o.c = Math.max(0, o.c + delta);
      return createColor(convertFromOklch(constrainOklchValues(o)));
    },

    desaturate(delta: number): Color {
      return this.saturate(-delta);
    },

    rotate(degrees: number): Color {
      const o = convertToOklch(hex);
      o.h = ((o.h + degrees) % 360 + 360) % 360;
      return createColor(convertFromOklch(constrainOklchValues(o)));
    },

    set(values: OklchSetValues): Color {
      const o = convertToOklch(hex);
      if (values.lightness !== undefined) o.l = Math.max(0, Math.min(1, values.lightness));
      if (values.chroma !== undefined) o.c = Math.max(0, values.chroma);
      if (values.hue !== undefined) o.h = ((values.hue % 360) + 360) % 360;
      return createColor(convertFromOklch(constrainOklchValues(o)));
    },

    mix(target: string, ratio: number, space: InterpolationMode = 'oklch'): Color {
      const engineSpace = space === 'srgb' ? 'rgb' : space;
      const mixed = mixWithMode(hex, chroma(target).hex(), ratio, engineSpace as InterpolationMode);
      return createColor(mixed);
    },

    blend(target: string, opacity: number, mode: BlendMode): Color {
      const blended = applyBlendMode(chroma(hex), chroma(target), opacity, mode);
      return createColor(blended.hex());
    },

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
