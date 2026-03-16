import { describe, it, expect } from 'bun:test';
import { color } from '../src/index';

describe('Color transforms', () => {
  describe('lighten / darken', () => {
    it('lighten increases OKLCH lightness', () => {
      const c = color('#666666');
      const lighter = c.lighten(0.1);
      expect(lighter.oklch.l).toBeGreaterThan(c.oklch.l);
    });

    it('darken decreases OKLCH lightness', () => {
      const c = color('#666666');
      const darker = c.darken(0.1);
      expect(darker.oklch.l).toBeLessThan(c.oklch.l);
    });

    it('darken is sugar for lighten(-delta)', () => {
      const c = color('#ff6600');
      expect(c.darken(0.1).hex).toBe(c.lighten(-0.1).hex);
    });

    it('clamps lightness to [0, 1]', () => {
      const white = color('#ffffff').lighten(0.5);
      expect(white.oklch.l).toBeLessThanOrEqual(1);

      const black = color('#000000').darken(0.5);
      expect(black.oklch.l).toBeGreaterThanOrEqual(0);
    });

    it('returns a new Color (immutable)', () => {
      const c = color('#ff0000');
      const lighter = c.lighten(0.1);
      expect(lighter.hex).not.toBe(c.hex);
      expect(c.hex).toBe('#ff0000');
    });
  });

  describe('saturate / desaturate', () => {
    it('saturate increases OKLCH chroma in a meaningful way', () => {
      const c = color('#996666');
      const saturated = c.saturate(0.05);
      expect(saturated.oklch.c).toBeGreaterThan(c.oklch.c);
    });

    it('desaturate decreases OKLCH chroma', () => {
      const c = color('#ff0000');
      const desaturated = c.desaturate(0.05);
      expect(desaturated.oklch.c).toBeLessThan(c.oklch.c);
    });

    it('desaturate is sugar for saturate(-delta)', () => {
      const c = color('#ff6600');
      expect(c.desaturate(0.05).hex).toBe(c.saturate(-0.05).hex);
    });

    it('clamps chroma to >= 0', () => {
      const gray = color('#808080').desaturate(1);
      expect(gray.oklch.c).toBeGreaterThanOrEqual(0);
    });
  });

  describe('rotate', () => {
    it('rotates hue by degrees', () => {
      const c = color('#ff0000');
      const rotated = c.rotate(120);
      // Red (~29° in OKLCH) + 120° ≈ 149° — roughly green territory
      expect(rotated.oklch.h).not.toBe(c.oklch.h);
    });

    it('handles negative rotation', () => {
      const c = color('#ff0000');
      const rotated = c.rotate(-30);
      expect(rotated.oklch.h).toBeDefined();
    });

    it('wraps around 360°', () => {
      const c = color('#ff0000');
      const full = c.rotate(360);
      expect(full.oklch.h).toBeCloseTo(c.oklch.h, 0);
    });
  });

  describe('set', () => {
    it('sets absolute lightness', () => {
      const c = color('#ff0000').set({ lightness: 0.5 });
      expect(c.oklch.l).toBeCloseTo(0.5, 1);
    });

    it('sets absolute chroma', () => {
      const c = color('#ff0000').set({ chroma: 0.1 });
      expect(c.oklch.c).toBeCloseTo(0.1, 2);
    });

    it('sets absolute hue', () => {
      const c = color('#ff0000').set({ hue: 180 });
      expect(c.oklch.h).toBeCloseTo(180, 0);
    });

    it('sets multiple values at once', () => {
      const c = color('#ff0000').set({ lightness: 0.5, chroma: 0.1, hue: 180 });
      expect(c.oklch.l).toBeCloseTo(0.5, 1);
      expect(c.oklch.c).toBeCloseTo(0.1, 1);
      expect(c.oklch.h).toBeCloseTo(180, 0);
    });

    it('clamps lightness to [0, 1]', () => {
      const c = color('#ff0000').set({ lightness: 1.5 });
      expect(c.oklch.l).toBeLessThanOrEqual(1);
    });
  });

  describe('mix', () => {
    it('mixes two colors at 50% in oklch', () => {
      const c = color('#ff0000').mix('#0000ff', 0.5);
      // Midpoint should differ from both endpoints
      expect(c.hex).not.toBe('#ff0000');
      expect(c.hex).not.toBe('#0000ff');
    });

    it('ratio 0 returns original color', () => {
      const c = color('#ff0000').mix('#0000ff', 0);
      // OKLCH round-trip may introduce tiny differences
      expect(c.oklch.l).toBeCloseTo(color('#ff0000').oklch.l, 1);
    });

    it('ratio 1 returns target color', () => {
      const c = color('#ff0000').mix('#0000ff', 1);
      expect(c.oklch.l).toBeCloseTo(color('#0000ff').oklch.l, 1);
    });

    it('supports lab color space', () => {
      const oklch = color('#ff0000').mix('#0000ff', 0.5, 'oklch');
      const lab = color('#ff0000').mix('#0000ff', 0.5, 'lab');
      // Different spaces produce different midpoints
      expect(oklch.hex).not.toBe(lab.hex);
    });

    it('supports rgb color space', () => {
      const c = color('#ff0000').mix('#0000ff', 0.5, 'rgb');
      expect(c.hex).toBeDefined();
    });
  });

  describe('blend', () => {
    it('applies multiply blend mode', () => {
      const c = color('#ff8800').blend('#0088ff', 0.5, 'multiply');
      expect(c.hex).toBeDefined();
      expect(c.hex).not.toBe('#ff8800');
    });

    it('applies screen blend mode', () => {
      const c = color('#333333').blend('#ffffff', 0.5, 'screen');
      // Screen lightens
      expect(c.oklch.l).toBeGreaterThan(color('#333333').oklch.l);
    });

    it('applies overlay blend mode', () => {
      const c = color('#ff0000').blend('#00ff00', 0.5, 'overlay');
      expect(c.hex).toBeDefined();
    });
  });

  describe('chaining', () => {
    it('chains multiple transforms', () => {
      const c = color('#66b172')
        .lighten(0.1)
        .desaturate(0.05)
        .rotate(10);
      expect(c.hex).toBeDefined();
      expect(typeof c.hex).toBe('string');
    });

    it('chains transform with mix', () => {
      const c = color('#ff0000')
        .lighten(0.1)
        .mix('#0000ff', 0.3);
      expect(c.hex).toBeDefined();
    });

    it('chains transform with blend', () => {
      const c = color('#ff0000')
        .darken(0.1)
        .blend('#000000', 0.2, 'multiply');
      expect(c.hex).toBeDefined();
    });

    it('bright variant pattern works', () => {
      const base = color('#06ef48');
      const bright = base.lighten(0.1).desaturate(0.05);
      expect(bright.oklch.l).toBeGreaterThan(base.oklch.l);
      expect(bright.hex).not.toBe(base.hex);
    });

    it('result has all Color properties', () => {
      const c = color('#ff0000').lighten(0.1);
      expect(c.hex).toBeDefined();
      expect(c.rgb).toBeDefined();
      expect(c.hsl).toBeDefined();
      expect(c.oklch).toBeDefined();
      expect(c.luminance).toBeDefined();
      expect(typeof c.format).toBe('function');
      expect(typeof c.output).toBe('function');
      expect(typeof c.lighten).toBe('function');
      expect(typeof c.mix).toBe('function');
      expect(typeof c.blend).toBe('function');
    });

    it('toString still returns hex after transforms', () => {
      const c = color('#ff0000').lighten(0.1);
      expect(`${c}`).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});
