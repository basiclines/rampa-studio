import { describe, it, expect } from 'bun:test';
import { rampa, RampaBuilder } from '../src/index';

describe('rampa()', () => {
  it('creates a RampaBuilder instance', () => {
    const builder = rampa('#3b82f6');
    expect(builder).toBeInstanceOf(RampaBuilder);
  });

  it('throws on invalid color', () => {
    expect(() => rampa('not-a-color')).toThrow('Invalid color');
  });
});

describe('RampaBuilder.generate()', () => {
  it('generates a default 10-color ramp', () => {
    const result = rampa('#3b82f6').generate();
    expect(result.ramps).toHaveLength(1);
    expect(result.ramps[0].name).toBe('base');
    expect(result.ramps[0].colors).toHaveLength(10);
  });

  it('respects custom size', () => {
    const result = rampa('#3b82f6').size(5).generate();
    expect(result.ramps[0].colors).toHaveLength(5);
  });

  it('throws on invalid size', () => {
    expect(() => rampa('#3b82f6').size(1)).toThrow('Size must be between 2 and 100');
    expect(() => rampa('#3b82f6').size(101)).toThrow('Size must be between 2 and 100');
  });

  it('generates hex colors by default', () => {
    const result = rampa('#3b82f6').size(3).generate();
    for (const color of result.ramps[0].colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('generates hsl colors when format is hsl', () => {
    const result = rampa('#3b82f6').size(3).format('hsl').generate();
    for (const color of result.ramps[0].colors) {
      expect(color).toMatch(/^hsl\(/);
    }
  });

  it('generates rgb colors when format is rgb', () => {
    const result = rampa('#3b82f6').size(3).format('rgb').generate();
    for (const color of result.ramps[0].colors) {
      expect(color).toMatch(/^rgb\(/);
    }
  });

  it('generates oklch colors when format is oklch', () => {
    const result = rampa('#3b82f6').size(3).format('oklch').generate();
    for (const color of result.ramps[0].colors) {
      expect(color).toMatch(/^oklch\(/);
    }
  });
});

describe('lightness, saturation, hue', () => {
  it('accepts lightness range', () => {
    const result = rampa('#3b82f6').size(3).lightness(20, 80).generate();
    expect(result.ramps[0].colors).toHaveLength(3);
  });

  it('accepts saturation range', () => {
    const result = rampa('#3b82f6').size(3).saturation(50, 50).generate();
    expect(result.ramps[0].colors).toHaveLength(3);
  });

  it('accepts hue range', () => {
    const result = rampa('#3b82f6').size(3).hue(-30, 30).generate();
    expect(result.ramps[0].colors).toHaveLength(3);
  });
});

describe('scales', () => {
  it('accepts lightness scale', () => {
    const result = rampa('#3b82f6').size(5).lightnessScale('fibonacci').generate();
    expect(result.ramps[0].colors).toHaveLength(5);
  });

  it('accepts saturation scale', () => {
    const result = rampa('#3b82f6').size(5).saturationScale('ease-out').generate();
    expect(result.ramps[0].colors).toHaveLength(5);
  });

  it('accepts hue scale', () => {
    const result = rampa('#3b82f6').size(5).hueScale('golden-ratio').generate();
    expect(result.ramps[0].colors).toHaveLength(5);
  });
});

describe('tinting', () => {
  it('applies tint color', () => {
    const result = rampa('#3b82f6').size(3).tint('#FF0000', 20).generate();
    expect(result.ramps[0].colors).toHaveLength(3);
  });

  it('applies tint with blend mode', () => {
    const result = rampa('#3b82f6').size(3).tint('#FF0000', 20, 'multiply').generate();
    expect(result.ramps[0].colors).toHaveLength(3);
  });

  it('throws on invalid tint color', () => {
    expect(() => rampa('#3b82f6').tint('not-a-color', 20)).toThrow('Invalid tint color');
  });
});

describe('harmonies', () => {
  it('adds complementary harmony', () => {
    const result = rampa('#3b82f6').size(5).add('complementary').generate();
    expect(result.ramps).toHaveLength(2);
    expect(result.ramps[1].name).toBe('complementary');
    expect(result.ramps[1].colors).toHaveLength(5);
  });

  it('adds triadic harmony (2 extra ramps)', () => {
    const result = rampa('#3b82f6').size(5).add('triadic').generate();
    expect(result.ramps).toHaveLength(3);
    expect(result.ramps[1].name).toBe('triadic-1');
    expect(result.ramps[2].name).toBe('triadic-2');
  });

  it('adds shift harmony', () => {
    const result = rampa('#3b82f6').size(5).add('shift', 45).generate();
    expect(result.ramps).toHaveLength(2);
    expect(result.ramps[1].name).toBe('shift-45');
  });

  it('adds multiple harmonies', () => {
    const result = rampa('#3b82f6')
      .size(5)
      .add('complementary')
      .add('shift', 90)
      .generate();
    expect(result.ramps).toHaveLength(3);
  });
});

describe('output formats', () => {
  it('toCSS() returns valid CSS', () => {
    const css = rampa('#3b82f6').size(3).toCSS();
    expect(css).toContain(':root {');
    expect(css).toContain('--base-');
    expect(css).toContain('}');
  });

  it('toJSON() returns valid JSON', () => {
    const json = rampa('#3b82f6').size(3).toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.ramps).toHaveLength(1);
    expect(parsed.ramps[0].colors).toHaveLength(3);
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

describe('rampa.readOnly()', () => {
  it('returns all formats when no format specified', () => {
    const result = rampa.readOnly('#fe0000').generate();
    expect(result).toHaveProperty('hex');
    expect(result).toHaveProperty('rgb');
    expect(result).toHaveProperty('hsl');
    expect(result).toHaveProperty('oklch');
    expect((result as any).hex).toBe('#fe0000');
    expect((result as any).rgb).toEqual({ r: 254, g: 0, b: 0 });
    expect((result as any).hsl).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('returns formatted string when format specified', () => {
    const result = rampa.readOnly('#fe0000').format('hsl').generate();
    expect(result).toBe('hsl(0, 100%, 50%)');
  });

  it('returns hex string when hex format specified', () => {
    const result = rampa.readOnly('#fe0000').format('hex').generate();
    expect(result).toBe('#fe0000');
  });

  it('returns rgb string when rgb format specified', () => {
    const result = rampa.readOnly('#fe0000').format('rgb').generate();
    expect(result).toBe('rgb(254, 0, 0)');
  });

  it('returns oklch string when oklch format specified', () => {
    const result = rampa.readOnly('#fe0000').format('oklch').generate();
    expect(typeof result).toBe('string');
    expect(result as string).toMatch(/^oklch\(/);
  });
});

describe('method chaining', () => {
  it('supports full chaining', () => {
    const result = rampa('#3b82f6')
      .size(8)
      .format('hsl')
      .lightness(10, 90)
      .saturation(80, 20)
      .hue(-20, 20)
      .lightnessScale('ease-in-out')
      .saturationScale('linear')
      .hueScale('fibonacci')
      .tint('#FF6600', 15, 'overlay')
      .add('complementary')
      .generate();

    expect(result.ramps).toHaveLength(2);
    expect(result.ramps[0].colors).toHaveLength(8);
    for (const color of result.ramps[0].colors) {
      expect(color).toMatch(/^hsl\(/);
    }
  });
});
