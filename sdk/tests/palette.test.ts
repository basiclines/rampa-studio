import { describe, it, expect } from 'bun:test';
import { palette } from '../src/index';
import { resolve } from 'path';

const TEST_PNG = resolve(__dirname, '../../tests/fixtures/test-palette.png');
// Use a real JPEG from Downloads for JPEG decoding tests
const TEST_JPEG = '/Users/basiclines/Downloads/IMG_6588.jpeg';

describe('palette()', () => {
  describe('PNG decoding', () => {
    it('loads a PNG file', async () => {
      const p = await palette(TEST_PNG);
      expect(p).toBeDefined();
    });

    it('detects dominant colors from simple image', async () => {
      const p = await palette(TEST_PNG);
      const dom = p.dominant({ count: 3 });
      expect(dom.length).toBe(3);

      // Red should be most dominant (60% of pixels)
      const hexes = dom.map(d => d.color.hex);
      expect(hexes[0]).toBe('#ff0000');
    });

    it('frequencies sum to ~1', async () => {
      const p = await palette(TEST_PNG);
      const dom = p.dominant({ count: 3 });
      const total = dom.reduce((s, d) => s + d.frequency, 0);
      expect(total).toBeCloseTo(1, 1);
    });

    it('frequency order matches expected ratios', async () => {
      const p = await palette(TEST_PNG);
      const dom = p.dominant({ count: 3 });
      // Red=60%, Blue=30%, Green=10%
      expect(dom[0].frequency).toBeGreaterThan(dom[1].frequency);
      expect(dom[1].frequency).toBeGreaterThan(dom[2].frequency);
    });
  });

  describe('JPEG decoding', () => {
    it('loads a JPEG file', async () => {
      const p = await palette(TEST_JPEG);
      expect(p).toBeDefined();
    });

    it('returns dominant colors', async () => {
      const p = await palette(TEST_JPEG);
      const dom = p.dominant();
      expect(dom.length).toBeGreaterThan(0);
      expect(dom.length).toBeLessThanOrEqual(10); // may merge close clusters
      expect(dom[0].frequency).toBeGreaterThan(0);
    });
  });

  describe('.at()', () => {
    it('returns the Nth dominant color (0-based)', async () => {
      const p = await palette(TEST_PNG);
      const first = p.at(0);
      const dom = p.dominant();
      expect(first.color.hex).toBe(dom[0].color.hex);
      expect(first.frequency).toBe(dom[0].frequency);
    });

    it('throws RangeError for out-of-bounds index', async () => {
      const p = await palette(TEST_PNG);
      expect(() => p.at(100)).toThrow(RangeError);
      expect(() => p.at(-1)).toThrow(RangeError);
    });

    it('returns Color with transform methods', async () => {
      const p = await palette(TEST_PNG);
      const lightened = p.at(0).color.lighten(0.1);
      expect(lightened.hex).toBeDefined();
      expect(lightened.hex).not.toBe(p.at(0).color.hex);
    });
  });

  describe('.raw()', () => {
    it('returns all unique colors', async () => {
      const p = await palette(TEST_PNG);
      const raw = p.raw();
      expect(raw.length).toBeGreaterThan(0);
      expect(raw.length).toBeLessThanOrEqual(1000);
    });

    it('respects tolerance option', async () => {
      const p = await palette(TEST_JPEG);
      const tight = p.raw({ tolerance: 1 });
      const loose = p.raw({ tolerance: 10 });
      expect(tight.length).toBeGreaterThanOrEqual(loose.length);
    });

    it('respects maxColors option', async () => {
      const p = await palette(TEST_JPEG);
      const limited = p.raw({ maxColors: 5 });
      expect(limited.length).toBeLessThanOrEqual(5);
    });
  });

  describe('.ansi()', () => {
    it('returns all 8 ANSI categories', async () => {
      const p = await palette(TEST_PNG);
      const ansi = p.ansi();
      const keys = Object.keys(ansi);
      expect(keys).toContain('red');
      expect(keys).toContain('green');
      expect(keys).toContain('blue');
      expect(keys).toContain('yellow');
      expect(keys).toContain('magenta');
      expect(keys).toContain('cyan');
      expect(keys).toContain('black');
      expect(keys).toContain('white');
    });

    it('classifies pure red as red', async () => {
      const p = await palette(TEST_PNG);
      const ansi = p.ansi();
      expect(ansi.red.length).toBeGreaterThan(0);
      expect(ansi.red[0].color.hex).toBe('#ff0000');
    });

    it('respects count option', async () => {
      const p = await palette(TEST_JPEG);
      const ansi = p.ansi({ count: 2 });
      for (const entries of Object.values(ansi)) {
        expect(entries.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('.average()', () => {
    it('returns a Color', async () => {
      const p = await palette(TEST_PNG);
      const avg = p.average();
      expect(avg.hex).toBeDefined();
      expect(avg.oklch).toBeDefined();
    });
  });

  describe('.temperature()', () => {
    it('returns warm, cool, or neutral', async () => {
      const p = await palette(TEST_PNG);
      const temp = p.temperature();
      expect(['warm', 'cool', 'neutral']).toContain(temp);
    });
  });

  describe('.output()', () => {
    it('generates JSON output', async () => {
      const p = await palette(TEST_PNG);
      const json = p.output('json');
      const parsed = JSON.parse(json);
      expect(parsed.dominant).toBeDefined();
      expect(parsed.average).toBeDefined();
      expect(parsed.temperature).toBeDefined();
      expect(parsed.ansi).toBeDefined();
    });

    it('generates CSS output', async () => {
      const p = await palette(TEST_PNG);
      const css = p.output('css', 'test');
      expect(css).toContain(':root {');
      expect(css).toContain('--test-1:');
      expect(css).toContain('--test-avg:');
    });

    it('generates text output', async () => {
      const p = await palette(TEST_PNG);
      const text = p.output('text');
      expect(text).toContain('Dominant colors:');
      expect(text).toContain('Average:');
      expect(text).toContain('Temperature:');
    });
  });

  describe('PaletteEntry shape', () => {
    it('has color and frequency properties', async () => {
      const p = await palette(TEST_PNG);
      const entry = p.at(0);
      expect(entry).toHaveProperty('color');
      expect(entry).toHaveProperty('frequency');
      expect(typeof entry.frequency).toBe('number');
      expect(entry.frequency).toBeGreaterThan(0);
      expect(entry.frequency).toBeLessThanOrEqual(1);
      expect(entry.color.hex).toBeDefined();
      expect(entry.color.oklch).toBeDefined();
    });
  });
});
