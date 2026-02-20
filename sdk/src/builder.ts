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
  RampaResult,
} from './types';
import { formatCssOutput } from './formatters/css';
import { formatJsonOutput } from './formatters/json';

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
  private _lightnessScale: ScaleType = 'linear';
  private _saturationScale: ScaleType = 'linear';
  private _hueScale: ScaleType = 'linear';
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

  lightnessScale(scale: ScaleType): this {
    this._lightnessScale = scale;
    return this;
  }

  saturationScale(scale: ScaleType): this {
    this._saturationScale = scale;
    return this;
  }

  hueScale(scale: ScaleType): this {
    this._hueScale = scale;
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
      lightnessScaleType: this._lightnessScale,
      saturationScaleType: this._saturationScale,
      hueScaleType: this._hueScale,
      tintColor: this._tintColor,
      tintOpacity: this._tintOpacity,
      tintBlendMode: this._tintBlend,
      swatches: [],
    };
  }

  private formatColor(color: string): string {
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

  private buildRamps(): RampResult[] {
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

  generate(): RampaResult {
    return { ramps: this.buildRamps() };
  }

  toCSS(): string {
    return formatCssOutput(this.buildRamps());
  }

  toJSON(): string {
    return formatJsonOutput(this.buildRamps());
  }
}
