import { describe, it, expect } from 'bun:test';
import { palette } from '../src/index';
import { resolve } from 'path';

const TEST_PNG = resolve(__dirname, '../../tests/fixtures/test-palette.png');
const TEST_JPEG = resolve(__dirname, '../../tests/fixtures/test-palette.jpeg');

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

  describe('.sortBy()', () => {
    it('sorts dominant by lightness ascending', async () => {
      const p = await palette(TEST_PNG);
      const sorted = p.dominant().sortBy('L');
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].color.oklch.l).toBeGreaterThanOrEqual(sorted[i - 1].color.oklch.l);
      }
    });

    it('sorts dominant by chroma ascending', async () => {
      const p = await palette(TEST_PNG);
      const sorted = p.dominant().sortBy('C');
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].color.oklch.c).toBeGreaterThanOrEqual(sorted[i - 1].color.oklch.c);
      }
    });

    it('sorts dominant by hue ascending', async () => {
      const p = await palette(TEST_PNG);
      const sorted = p.dominant().sortBy('H');
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].color.oklch.h).toBeGreaterThanOrEqual(sorted[i - 1].color.oklch.h);
      }
    });

    it('returns a new array (does not mutate)', async () => {
      const p = await palette(TEST_PNG);
      const original = p.dominant();
      const sorted = original.sortBy('L');
      expect(sorted).not.toBe(original);
      expect(sorted.length).toBe(original.length);
    });

    it('sortBy is chainable', async () => {
      const p = await palette(TEST_PNG);
      const sorted = p.dominant().sortBy('L').sortBy('C');
      expect(sorted.length).toBeGreaterThan(0);
    });

    it('sorts group buckets internally by L', async () => {
      const p = await palette(TEST_JPEG);
      const grouped = p.group({ by: 'C' }).sortBy('L');
      for (const [, entries] of Object.entries(grouped)) {
        for (let i = 1; i < entries.length; i++) {
          expect(entries[i].color.oklch.l).toBeGreaterThanOrEqual(entries[i - 1].color.oklch.l);
        }
      }
    });

    it('sorts ansi buckets internally', async () => {
      const p = await palette(TEST_PNG);
      const ansi = p.ansi().sortBy('L');
      for (const [, entries] of Object.entries(ansi)) {
        for (let i = 1; i < entries.length; i++) {
          expect(entries[i].color.oklch.l).toBeGreaterThanOrEqual(entries[i - 1].color.oklch.l);
        }
      }
    });
  });

  describe('.group()', () => {
    it('groups by lightness with default buckets', async () => {
      const p = await palette(TEST_PNG);
      const grouped = p.group({ by: 'L' });
      const keys = Object.keys(grouped);
      expect(keys).toEqual(['darkest', 'dark', 'mid', 'light', 'lightest']);
    });

    it('groups by chroma with default buckets', async () => {
      const p = await palette(TEST_PNG);
      const grouped = p.group({ by: 'C' });
      const keys = Object.keys(grouped);
      expect(keys).toEqual(['gray', 'muted', 'saturated', 'vivid']);
    });

    it('groups by hue with default buckets', async () => {
      const p = await palette(TEST_PNG);
      const grouped = p.group({ by: 'H' });
      const keys = Object.keys(grouped);
      expect(keys).toEqual(['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink']);
    });

    it('respects count per bucket', async () => {
      const p = await palette(TEST_JPEG);
      const grouped = p.group({ by: 'L', count: 2 });
      for (const entries of Object.values(grouped)) {
        expect(entries.length).toBeLessThanOrEqual(2);
      }
    });

    it('respects tolerance for dedup', async () => {
      const p = await palette(TEST_JPEG);
      const tight = p.group({ by: 'L', tolerance: 2, count: 20 });
      const wide = p.group({ by: 'L', tolerance: 10, count: 20 });
      const tightTotal = Object.values(tight).reduce((s, e) => s + e.length, 0);
      const wideTotal = Object.values(wide).reduce((s, e) => s + e.length, 0);
      expect(tightTotal).toBeGreaterThanOrEqual(wideTotal);
    });

    it('result has sortBy method', async () => {
      const p = await palette(TEST_PNG);
      const grouped = p.group({ by: 'C' });
      expect(typeof grouped.sortBy).toBe('function');
    });
  });

  describe('k-means++ clustering', () => {
    it('post-merges close clusters with tolerance', async () => {
      const p = await palette(TEST_JPEG);
      const loose = p.dominant({ count: 10, tolerance: 15 });
      const tight = p.dominant({ count: 10, tolerance: 2 });
      expect(loose.length).toBeLessThanOrEqual(tight.length);
    });

    it('dominant result has sortBy method', async () => {
      const p = await palette(TEST_PNG);
      const dom = p.dominant();
      expect(typeof dom.sortBy).toBe('function');
    });
  });
});
