import { describe, it, expect } from 'bun:test';
import { rampa, color, RampaBuilder } from '../src/index';

describe('rampa()', () => {
  it('returns a callable RampaFn', () => {
    const palette = rampa('#3b82f6');
    expect(typeof palette).toBe('function');
    expect(typeof palette.size).toBe('function');
  });

  it('throws on invalid color', () => {
    expect(() => rampa('not-a-color')).toThrow('Invalid color');
  });
});

describe('ramp generation', () => {
  it('generates a default 10-color ramp', () => {
    const palette = rampa('#3b82f6');
    expect(palette.ramps).toHaveLength(1);
    expect(palette.ramps[0].name).toBe('base');
    expect(palette.ramps[0].colors).toHaveLength(10);
  });

  it('respects custom size', () => {
    const palette = rampa('#3b82f6').size(5);
    expect(palette.ramps[0].colors).toHaveLength(5);
  });

  it('throws on invalid size', () => {
    expect(() => rampa('#3b82f6').size(1)).toThrow('Size must be between 2 and 100');
    expect(() => rampa('#3b82f6').size(101)).toThrow('Size must be between 2 and 100');
  });

  it('generates hex colors by default', () => {
    const palette = rampa('#3b82f6').size(3);
    for (const color of palette.palette) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('generates hsl colors when format is hsl', () => {
    const palette = rampa('#3b82f6').size(3).format('hsl');
    for (const color of palette.palette) {
      expect(color).toMatch(/^hsl\(/);
    }
  });

  it('generates rgb colors when format is rgb', () => {
    const palette = rampa('#3b82f6').size(3).format('rgb');
    for (const color of palette.palette) {
      expect(color).toMatch(/^rgb\(/);
    }
  });

  it('generates oklch colors when format is oklch', () => {
    const palette = rampa('#3b82f6').size(3).format('oklch');
    for (const color of palette.palette) {
      expect(color).toMatch(/^oklch\(/);
    }
  });
});

describe('lightness, saturation, hue', () => {
  it('accepts lightness range', () => {
    const palette = rampa('#3b82f6').size(3).lightness(20, 80);
    expect(palette.palette).toHaveLength(3);
  });

  it('accepts saturation range', () => {
    const palette = rampa('#3b82f6').size(3).saturation(50, 50);
    expect(palette.palette).toHaveLength(3);
  });

  it('accepts hue range', () => {
    const palette = rampa('#3b82f6').size(3).hue(-30, 30);
    expect(palette.palette).toHaveLength(3);
  });
});

describe('distributions', () => {
  it('accepts lightness distribution', () => {
    const palette = rampa('#3b82f6').size(5).lightnessDistribution('fibonacci');
    expect(palette.palette).toHaveLength(5);
  });

  it('accepts saturation distribution', () => {
    const palette = rampa('#3b82f6').size(5).saturationDistribution('ease-out');
    expect(palette.palette).toHaveLength(5);
  });

  it('accepts hue distribution', () => {
    const palette = rampa('#3b82f6').size(5).hueDistribution('golden-ratio');
    expect(palette.palette).toHaveLength(5);
  });
});

describe('tinting', () => {
  it('applies tint color', () => {
    const palette = rampa('#3b82f6').size(3).tint('#FF0000', 20);
    expect(palette.palette).toHaveLength(3);
  });

  it('applies tint with blend mode', () => {
    const palette = rampa('#3b82f6').size(3).tint('#FF0000', 20, 'multiply');
    expect(palette.palette).toHaveLength(3);
  });

  it('throws on invalid tint color', () => {
    expect(() => rampa('#3b82f6').tint('not-a-color', 20)).toThrow('Invalid tint color');
  });
});

describe('harmonies', () => {
  it('adds complementary harmony', () => {
    const palette = rampa('#3b82f6').size(5).add('complementary');
    expect(palette.ramps).toHaveLength(2);
    expect(palette.ramps[1].name).toBe('complementary');
    expect(palette.ramps[1].colors).toHaveLength(5);
  });

  it('adds triadic harmony (2 extra ramps)', () => {
    const palette = rampa('#3b82f6').size(5).add('triadic');
    expect(palette.ramps).toHaveLength(3);
    expect(palette.ramps[1].name).toBe('triadic-1');
    expect(palette.ramps[2].name).toBe('triadic-2');
  });

  it('adds shift harmony', () => {
    const palette = rampa('#3b82f6').size(5).add('shift', 45);
    expect(palette.ramps).toHaveLength(2);
    expect(palette.ramps[1].name).toBe('shift-45');
  });

  it('adds multiple harmonies', () => {
    const palette = rampa('#3b82f6')
      .size(5)
      .add('complementary')
      .add('shift', 90);
    expect(palette.ramps).toHaveLength(3);
  });
});

describe('output formats', () => {
  it('output("css") returns valid CSS', () => {
    const css = rampa('#3b82f6').size(3).output('css');
    expect(css).toContain(':root {');
    expect(css).toContain('--base-');
    expect(css).toContain('}');
  });

  it('output("css", prefix) uses prefix in variable names', () => {
    const css = rampa('#3b82f6').size(3).output('css', 'primary');
    expect(css).toContain('--primary-');
    expect(css).not.toContain('--base-');
  });

  it('output("json") returns valid JSON', () => {
    const json = rampa('#3b82f6').size(3).output('json');
    const parsed = JSON.parse(json);
    expect(parsed.ramps).toHaveLength(1);
    expect(parsed.ramps[0].colors).toHaveLength(3);
  });

  it('output("json", prefix) uses prefix as name', () => {
    const json = rampa('#3b82f6').size(3).output('json', 'primary');
    const parsed = JSON.parse(json);
    expect(parsed.ramps[0].name).toBe('primary');
  });

  it('output("text") returns plain color list', () => {
    const text = rampa('#3b82f6').size(3).output('text');
    const lines = text.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('rampa.convert()', () => {
  it('converts hex to hsl', () => {
    const result = rampa.convert('#ff0000', 'hsl');
    expect(result).toBe('hsl(0, 100%, 50%)');
  });

  it('converts hex to rgb', () => {
    const result = rampa.convert('#ff0000', 'rgb');
    expect(result).toBe('rgb(255, 0, 0)');
  });

  it('converts hex to oklch', () => {
    const result = rampa.convert('#ff0000', 'oklch');
    expect(result).toMatch(/^oklch\(/);
  });

  it('converts to hex (passthrough)', () => {
    const result = rampa.convert('#ff0000', 'hex');
    expect(result).toBe('#ff0000');
  });
});

describe('color()', () => {
  it('returns all format properties', () => {
    const c = color('#fe0000');
    expect(c.hex).toBe('#fe0000');
    expect(c.rgb).toEqual({ r: 254, g: 0, b: 0 });
    expect(c.hsl).toEqual({ h: 0, s: 1, l: 0.5 });
    expect(c.oklch).toHaveProperty('l');
    expect(c.oklch).toHaveProperty('c');
    expect(c.oklch).toHaveProperty('h');
  });

  it('has luminance property', () => {
    const c = color('#fe0000');
    expect(typeof c.luminance).toBe('number');
    expect(c.luminance).toBeGreaterThan(0);
    expect(c.luminance).toBeLessThanOrEqual(1);
  });

  it('format() returns formatted string', () => {
    const c = color('#fe0000');
    expect(c.format('hsl')).toBe('hsl(0, 100%, 50%)');
    expect(c.format('rgb')).toBe('rgb(254, 0, 0)');
    expect(c.format('hex')).toBe('#fe0000');
    expect(c.format('oklch')).toMatch(/^oklch\(/);
  });

  it('toString() returns hex', () => {
    const c = color('#fe0000');
    expect(c.toString()).toBe('#fe0000');
    expect(`${c}`).toBe('#fe0000');
  });

  it('output("json") returns valid JSON', () => {
    const c = color('#fe0000');
    const json = JSON.parse(c.output('json'));
    expect(json.hex).toBe('#fe0000');
    expect(json.rgb).toEqual({ r: 254, g: 0, b: 0 });
    expect(json.hsl).toEqual({ h: 0, s: 1, l: 0.5 });
    expect(json.oklch).toHaveProperty('l');
  });

  it('output("css") returns CSS custom properties', () => {
    const css = color('#fe0000').output('css');
    expect(css).toContain(':root {');
    expect(css).toContain('--color-hex:');
    expect(css).toContain('--color-rgb:');
    expect(css).toContain('--color-hsl:');
    expect(css).toContain('--color-oklch:');
  });

  it('output("css", prefix) uses custom prefix', () => {
    const css = color('#fe0000').output('css', 'brand');
    expect(css).toContain('--brand-hex:');
    expect(css).toContain('--brand-rgb:');
  });

  it('output("text") returns hex string', () => {
    expect(color('#fe0000').output('text')).toBe('#fe0000');
  });

  it('throws on invalid color', () => {
    expect(() => color('not-a-color')).toThrow('Invalid color');
  });

  it('accepts any CSS color format', () => {
    const c = color('rgb(254, 0, 0)');
    expect(c.hex).toMatch(/^#[0-9a-f]{6}$/);
    expect(c.rgb.r).toBe(254);
  });
});

describe('method chaining', () => {
  it('supports full chaining', () => {
    const palette = rampa('#3b82f6')
      .size(8)
      .format('hsl')
      .lightness(10, 90)
      .saturation(80, 20)
      .hue(-20, 20)
      .lightnessDistribution('ease-in-out')
      .saturationDistribution('linear')
      .hueDistribution('fibonacci')
      .tint('#FF6600', 15, 'overlay')
      .add('complementary');

    expect(palette.ramps).toHaveLength(2);
    expect(palette.ramps[0].colors).toHaveLength(8);
    for (const color of palette.ramps[0].colors) {
      expect(color).toMatch(/^hsl\(/);
    }
  });
});

describe('rampa.mix()', () => {
  it('returns start color at t=0', () => {
    const result = rampa.mix('#ff0000', '#0000ff', 0);
    expect(result).toMatch(/^#/);
    expect(result.toLowerCase()).toBe('#ff0302');
  });

  it('returns end color at t=1', () => {
    const result = rampa.mix('#ff0000', '#0000ff', 1);
    expect(result).toMatch(/^#/);
    expect(result.toLowerCase()).toBe('#0031e5');
  });

  it('returns midpoint at t=0.5', () => {
    const result = rampa.mix('#ff0000', '#0000ff', 0.5);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('mixes black and white', () => {
    const mid = rampa.mix('#000000', '#ffffff', 0.5);
    expect(mid).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('handles achromatic colors', () => {
    const result = rampa.mix('#000000', '#ffffff', 0.25);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('uses OKLCH interpolation (not sRGB)', () => {
    // OKLCH interpolation between red and cyan should go through vivid colors,
    // not through desaturated gray like sRGB would
    const mid = rampa.mix('#ff0000', '#00ffff', 0.5);
    const r = parseInt(mid.slice(1, 3), 16);
    const g = parseInt(mid.slice(3, 5), 16);
    const b = parseInt(mid.slice(5, 7), 16);
    // sRGB lerp midpoint of #ff0000 and #00ffff is #808080 (gray)
    // OKLCH should produce a vivid (non-gray) color
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    expect(maxChannel - minChannel).toBeGreaterThan(50);
  });
});

describe('callable palette API', () => {
  it('palette(n) returns a ColorAccessor', () => {
    const palette = rampa('#3b82f6').size(5);
    const color = palette(1);
    expect(typeof color.toString()).toBe('string');
    expect(color.toString()).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('supports format conversion on accessor', () => {
    const palette = rampa('#3b82f6').size(5);
    expect(palette(3).hsl()).toMatch(/^hsl\(/);
    expect(palette(3).rgb()).toMatch(/^rgb\(/);
    expect(palette(3).oklch()).toMatch(/^oklch\(/);
    expect(palette(3).hex()).toMatch(/^#/);
  });

  it('clamps out-of-range indices', () => {
    const palette = rampa('#3b82f6').size(5);
    expect(palette(0).toString()).toBe(palette(1).toString());
    expect(palette(99).toString()).toBe(palette(5).toString());
  });

  it('exposes .palette array', () => {
    const palette = rampa('#3b82f6').size(5);
    expect(palette.palette).toHaveLength(5);
    expect(palette.palette[0]).toMatch(/^#/);
  });

  it('exposes .ramps with harmonies', () => {
    const palette = rampa('#3b82f6').size(5).add('complementary');
    expect(palette.ramps).toHaveLength(2);
    expect(palette.ramps[0].name).toBe('base');
  });

  it('chains in any order', () => {
    const a = rampa('#3b82f6').size(5).lightness(10, 90);
    const b = rampa('#3b82f6').lightness(10, 90).size(5);
    expect(a.palette).toEqual(b.palette);
  });

  it('works with template literals', () => {
    const palette = rampa('#3b82f6').size(5);
    const str = `${palette(1)}`;
    expect(str).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('respects format setting', () => {
    const palette = rampa('#3b82f6').format('hsl').size(5);
    expect(palette(1).toString()).toMatch(/^hsl\(/);
  });

  it('has luminance on accessor', () => {
    const palette = rampa('#3b82f6').size(5);
    expect(typeof palette(1).luminance).toBe('number');
    expect(palette(1).luminance).toBeGreaterThanOrEqual(0);
    expect(palette(1).luminance).toBeLessThanOrEqual(1);
  });
});
