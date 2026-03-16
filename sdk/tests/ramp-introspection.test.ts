import { describe, it, expect } from 'bun:test';
import { LinearColorSpace, PlaneColorSpace, CubeColorSpace } from '../src/index';

describe('Ramp introspection', () => {
  describe('LinearColorSpace', () => {
    const ramp = new LinearColorSpace('#000000', '#ffffff').size(12);

    it('.at(n) returns a Color object', () => {
      const c = ramp.at(0);
      expect(c.hex).toBeDefined();
      expect(c.oklch).toBeDefined();
      expect(c.hsl).toBeDefined();
      expect(c.rgb).toBeDefined();
      expect(typeof c.lighten).toBe('function');
    });

    it('.at(n) is 0-based', () => {
      const first = ramp.at(0);
      const last = ramp.at(11);
      expect(first.oklch.l).toBeLessThan(last.oklch.l);
    });

    it('.at(n) clamps to valid range', () => {
      const underflow = ramp.at(-5);
      const overflow = ramp.at(100);
      expect(underflow.hex).toBe(ramp.at(0).hex);
      expect(overflow.hex).toBe(ramp.at(11).hex);
    });

    it('.colors() returns Color[]', () => {
      const colors = ramp.colors();
      expect(colors).toHaveLength(12);
      expect(colors[0].hex).toBeDefined();
      expect(typeof colors[0].lighten).toBe('function');
    });

    it('.colors() matches .palette', () => {
      const colors = ramp.colors();
      expect(colors.map(c => c.hex)).toEqual(ramp.palette);
    });

    it('Color from .at() has oklch components', () => {
      const c = ramp.at(6);
      expect(typeof c.oklch.l).toBe('number');
      expect(typeof c.oklch.c).toBe('number');
      expect(typeof c.oklch.h).toBe('number');
    });

    it('Color from .at() supports transforms', () => {
      const c = ramp.at(3);
      const lighter = c.lighten(0.1);
      expect(lighter.oklch.l).toBeGreaterThan(c.oklch.l);
      expect(lighter.hex).not.toBe(c.hex);
    });

    it('transforms on .at() do not mutate the ramp', () => {
      const before = ramp.at(3).hex;
      ramp.at(3).lighten(0.1);
      expect(ramp.at(3).hex).toBe(before);
    });

    it('.colors() enables chroma curve extraction', () => {
      const chromaValues = ramp.colors().map(c => c.oklch.c);
      expect(chromaValues).toHaveLength(12);
      chromaValues.forEach(v => expect(typeof v).toBe('number'));
    });
  });

  describe('PlaneColorSpace', () => {
    const plane = new PlaneColorSpace('#1e1e2e', '#cdd6f4', '#f38ba8').size(6);

    it('.at(sat, lgt) returns a Color object', () => {
      const c = plane.at(3, 5);
      expect(c.hex).toBeDefined();
      expect(c.oklch).toBeDefined();
      expect(typeof c.lighten).toBe('function');
    });

    it('.at() clamps to valid range', () => {
      const c = plane.at(-1, 100);
      expect(c.hex).toBeDefined();
    });

    it('.colors() returns Color[] of size²', () => {
      const colors = plane.colors();
      expect(colors).toHaveLength(36);
    });

    it('.colors() matches .palette', () => {
      const colors = plane.colors();
      expect(colors.map(c => c.hex)).toEqual(plane.palette);
    });

    it('Color from .at() supports transforms', () => {
      const c = plane.at(3, 5);
      const rotated = c.rotate(90);
      expect(rotated.hex).not.toBe(c.hex);
    });
  });

  describe('CubeColorSpace', () => {
    const cube = new CubeColorSpace({
      k: '#1e1e2e', r: '#f38ba8', g: '#a6e3a1', b: '#89b4fa',
      y: '#f9e2af', m: '#cba6f7', c: '#94e2d5', w: '#cdd6f4',
    }).size(4);

    it('.at(x, y, z) returns a Color object', () => {
      const c = cube.at(2, 3, 1);
      expect(c.hex).toBeDefined();
      expect(c.oklch).toBeDefined();
      expect(typeof c.lighten).toBe('function');
    });

    it('.at() clamps to valid range', () => {
      const c = cube.at(-1, 100, 2);
      expect(c.hex).toBeDefined();
    });

    it('.colors() returns Color[] of size³', () => {
      const colors = cube.colors();
      expect(colors).toHaveLength(64);
    });

    it('.colors() matches .palette', () => {
      const colors = cube.colors();
      expect(colors.map(c => c.hex)).toEqual(cube.palette);
    });

    it('Color from .at() supports transforms', () => {
      const c = cube.at(1, 1, 1);
      const desaturated = c.desaturate(0.05);
      expect(desaturated.oklch.c).toBeLessThan(c.oklch.c);
    });
  });
});
