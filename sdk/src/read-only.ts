import chroma from 'chroma-js';
import type { ColorFormat, ColorInfo } from './types';

export class ReadOnlyBuilder {
  private _color: string;
  private _format?: ColorFormat;

  constructor(color: string) {
    try {
      chroma(color);
    } catch {
      throw new Error(`Invalid color: "${color}"`);
    }
    this._color = chroma(color).hex();
  }

  format(fmt: ColorFormat): this {
    this._format = fmt;
    return this;
  }

  generate(): ColorInfo | string {
    const c = chroma(this._color);

    if (this._format) {
      switch (this._format) {
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
          return c.hex();
      }
    }

    const [r, g, b] = c.rgb();
    const [hh, ss, ll] = c.hsl();
    const [ol, oc, oh] = c.oklch();
    return {
      hex: c.hex(),
      rgb: { r, g, b },
      hsl: { h: Math.round(hh || 0), s: Math.round(ss * 100), l: Math.round(ll * 100) },
      oklch: { l: parseFloat((ol * 100).toFixed(1)), c: parseFloat(oc.toFixed(3)), h: Math.round(oh || 0) },
    };
  }
}
