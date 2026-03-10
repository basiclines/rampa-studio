import chroma from 'chroma-js';
import {
  generateColorRamp,
  getComplementaryColors,
  getTriadColors,
  getAnalogousColors,
  getSplitComplementaryColors,
  getSquareColors,
  getCompoundColors,
} from '../../src/engine/ColorEngine';
import type { ColorRampConfig } from '../../src/entities/ColorRampEntity';
import type {
  ColorFormat,
  ScaleType,
  BlendMode,
  HarmonyType,
  RampResult,
  RampaFn,
  RampaOutputFormat,
  ColorAccessor,
} from './types';
import { formatCssOutput } from './formatters/css';
import { formatJsonOutput } from './formatters/json';
import { formatTextOutput } from './formatters/text';
import { createColorAccessor } from './color-result';

interface HarmonyEntry {
  type: HarmonyType | 'shift';
  degrees?: number;
}

export class RampaBuilder {
  private _baseColor: string;
  private _size: number = 10;
  private _format: ColorFormat = 'hex';
  private _lightnessStart: number = 0;
  private _lightnessEnd: number = 100;
  private _saturationStart: number = 100;
  private _saturationEnd: number = 0;
  private _hueStart: number = -10;
  private _hueEnd: number = 10;
  private _lightnessDistribution: ScaleType = 'linear';
  private _saturationDistribution: ScaleType = 'linear';
  private _hueDistribution: ScaleType = 'linear';
  private _tintColor?: string;
  private _tintOpacity: number = 0;
  private _tintBlend: BlendMode = 'normal';
  private _harmonies: HarmonyEntry[] = [];

  constructor(baseColor: string) {
    // Validate the color
    try {
      chroma(baseColor);
    } catch {
      throw new Error(`Invalid color: "${baseColor}"`);
    }
    this._baseColor = chroma(baseColor).hex();
  }

  size(steps: number): this {
    if (steps < 2 || steps > 100) {
      throw new Error('Size must be between 2 and 100');
    }
    this._size = steps;
    return this;
  }

  format(fmt: ColorFormat): this {
    this._format = fmt;
    return this;
  }

  lightness(start: number, end: number): this {
    this._lightnessStart = start;
    this._lightnessEnd = end;
    return this;
  }

  saturation(start: number, end: number): this {
    this._saturationStart = start;
    this._saturationEnd = end;
    return this;
  }

  hue(start: number, end: number): this {
    this._hueStart = start;
    this._hueEnd = end;
    return this;
  }

  lightnessDistribution(scale: ScaleType): this {
    this._lightnessDistribution = scale;
    return this;
  }

  saturationDistribution(scale: ScaleType): this {
    this._saturationDistribution = scale;
    return this;
  }

  hueDistribution(scale: ScaleType): this {
    this._hueDistribution = scale;
    return this;
  }

  tint(color: string, opacity: number, blend: BlendMode = 'normal'): this {
    try {
      chroma(color);
    } catch {
      throw new Error(`Invalid tint color: "${color}"`);
    }
    this._tintColor = chroma(color).hex();
    this._tintOpacity = opacity;
    this._tintBlend = blend;
    return this;
  }

  add(type: HarmonyType): this;
  add(type: 'shift', degrees: number): this;
  add(type: HarmonyType | 'shift', degrees?: number): this {
    if (type === 'shift') {
      if (degrees === undefined) {
        throw new Error('shift requires a degrees value');
      }
      this._harmonies.push({ type: 'shift', degrees });
    } else {
      this._harmonies.push({ type });
    }
    return this;
  }

  private buildConfig(baseColor: string): ColorRampConfig {
    return {
      id: 'sdk',
      name: 'ramp',
      baseColor,
      colorFormat: 'hex',
      totalSteps: this._size,
      lightnessStart: this._lightnessStart,
      lightnessEnd: this._lightnessEnd,
      chromaStart: this._hueStart,
      chromaEnd: this._hueEnd,
      saturationStart: this._saturationStart,
      saturationEnd: this._saturationEnd,
      lightnessDistributionType: this._lightnessDistribution,
      saturationDistributionType: this._saturationDistribution,
      hueDistributionType: this._hueDistribution,
      tintColor: this._tintColor,
      tintOpacity: this._tintOpacity,
      tintBlendMode: this._tintBlend,
      swatches: [],
    };
  }

  formatColor(color: string): string {
    const c = chroma(color);
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

  private getHarmonyColors(type: HarmonyType, baseColor: string): string[] {
    switch (type) {
      case 'complementary':
        return getComplementaryColors(baseColor).slice(1);
      case 'triadic':
        return getTriadColors(baseColor).slice(1);
      case 'analogous':
        return getAnalogousColors(baseColor).slice(1);
      case 'split-complementary':
        return getSplitComplementaryColors(baseColor).slice(1);
      case 'square':
        return getSquareColors(baseColor).slice(1);
      case 'compound':
        return getCompoundColors(baseColor).slice(1);
    }
  }

  buildRamps(): RampResult[] {
    const ramps: RampResult[] = [];

    // Base ramp
    const baseColors = generateColorRamp(this.buildConfig(this._baseColor));
    ramps.push({
      name: 'base',
      baseColor: this.formatColor(this._baseColor),
      colors: baseColors.map(c => this.formatColor(c)),
    });

    // Harmony ramps
    for (const harmony of this._harmonies) {
      if (harmony.type === 'shift') {
        const c = chroma(this._baseColor);
        const [h, s, l] = c.hsl();
        const shiftedHue = ((h || 0) + (harmony.degrees || 0)) % 360;
        const shiftedBase = chroma.hsl(shiftedHue, s, l).hex();
        const shiftedColors = generateColorRamp(this.buildConfig(shiftedBase));
        ramps.push({
          name: `shift-${Math.round(harmony.degrees || 0)}`,
          baseColor: this.formatColor(shiftedBase),
          colors: shiftedColors.map(c => this.formatColor(c)),
        });
      } else {
        const harmonyColors = this.getHarmonyColors(harmony.type, this._baseColor);
        harmonyColors.forEach((harmonyBase, index) => {
          const suffix = harmonyColors.length > 1 ? `-${index + 1}` : '';
          const rampColors = generateColorRamp(this.buildConfig(harmonyBase));
          ramps.push({
            name: `${harmony.type}${suffix}`,
            baseColor: this.formatColor(harmonyBase),
            colors: rampColors.map(c => this.formatColor(c)),
          });
        });
      }
    }

    return ramps;
  }

  getFormat(): ColorFormat {
    return this._format;
  }

  output(format: RampaOutputFormat, prefix?: string): string {
    const ramps = this.buildRamps();
    switch (format) {
      case 'css': return formatCssOutput(ramps, prefix);
      case 'json': return formatJsonOutput(ramps, prefix);
      case 'text': return formatTextOutput(ramps);
    }
  }
}

/**
 * Create a callable RampaFn that wraps a RampaBuilder.
 * All builder methods are available for chaining in any order.
 * Call the result with a 1-based index to access colors.
 */
export function createRampaFn(builder: RampaBuilder): RampaFn {
  let cache: RampResult[] | null = null;

  function ensureBuilt(): RampResult[] {
    if (!cache) cache = builder.buildRamps();
    return cache;
  }

  function invalidate() { cache = null; }

  const fn = ((index: number): ColorAccessor => {
    const ramps = ensureBuilt();
    const colors = ramps[0].colors;
    const i = Math.max(1, Math.min(colors.length, index)) - 1;
    return createColorAccessor(colors[i], builder.getFormat());
  }) as unknown as RampaFn;

  fn.size = (n: number) => { invalidate(); builder.size(n); return fn; };
  fn.format = (fmt: ColorFormat) => { invalidate(); builder.format(fmt); return fn; };
  fn.lightness = (s: number, e: number) => { invalidate(); builder.lightness(s, e); return fn; };
  fn.saturation = (s: number, e: number) => { invalidate(); builder.saturation(s, e); return fn; };
  fn.hue = (s: number, e: number) => { invalidate(); builder.hue(s, e); return fn; };
  fn.lightnessDistribution = (scale: ScaleType) => { invalidate(); builder.lightnessDistribution(scale); return fn; };
  fn.saturationDistribution = (scale: ScaleType) => { invalidate(); builder.saturationDistribution(scale); return fn; };
  fn.hueDistribution = (scale: ScaleType) => { invalidate(); builder.hueDistribution(scale); return fn; };
  fn.tint = (color: string, opacity: number, blend?: BlendMode) => {
    invalidate();
    builder.tint(color, opacity, blend ?? 'normal');
    return fn;
  };
  fn.add = ((type: HarmonyType | 'shift', degrees?: number) => {
    invalidate();
    if (type === 'shift') builder.add(type, degrees!);
    else builder.add(type);
    return fn;
  }) as RampaFn['add'];

  fn.output = (format: RampaOutputFormat, prefix?: string) => {
    const ramps = ensureBuilt();
    switch (format) {
      case 'css': return formatCssOutput(ramps, prefix);
      case 'json': return formatJsonOutput(ramps, prefix);
      case 'text': return formatTextOutput(ramps);
    }
  };

  Object.defineProperty(fn, 'palette', {
    get: () => ensureBuilt()[0].colors,
    enumerable: true,
  });
  Object.defineProperty(fn, 'ramps', {
    get: () => ensureBuilt(),
    enumerable: true,
  });

  return fn;
}
