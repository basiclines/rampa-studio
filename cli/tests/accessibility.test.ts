import { describe, it, expect } from 'bun:test';
import { computeApca, getPassingLevels, APCA_LEVELS, parseAccessibilityFilter } from '../src/accessibility/apca';
import { generateAccessibilityReport } from '../src/accessibility/report';
import type { RampOutput } from '../src/formatters/types';

describe('APCA', () => {
  describe('computeApca', () => {
    it('should return high positive contrast for black on white', () => {
      const lc = computeApca('#000000', '#ffffff');
      expect(lc).toBeGreaterThan(100);
    });

    it('should return high negative contrast for white on black', () => {
      const lc = computeApca('#ffffff', '#000000');
      expect(lc).toBeLessThan(-100);
    });

    it('should return near-zero contrast for same colors', () => {
      const lc = computeApca('#888888', '#888888');
      expect(Math.abs(lc)).toBeLessThan(1);
    });

    it('should be asymmetric', () => {
      const lcAB = computeApca('#333333', '#ffffff');
      const lcBA = computeApca('#ffffff', '#333333');
      expect(lcAB).not.toBe(lcBA);
      expect(Math.sign(lcAB)).not.toBe(Math.sign(lcBA));
    });
  });

  describe('getPassingLevels', () => {
    it('should return all levels for very high contrast', () => {
      const levels = getPassingLevels(106);
      expect(levels.length).toBe(APCA_LEVELS.length);
    });

    it('should return no levels for very low contrast', () => {
      const levels = getPassingLevels(5);
      expect(levels.length).toBe(0);
    });

    it('should work with negative Lc values', () => {
      const levels = getPassingLevels(-80);
      expect(levels.some(l => l.id === 'body')).toBe(true);
      expect(levels.some(l => l.id === 'preferred-body')).toBe(false);
    });

    it('should return correct levels for body text threshold', () => {
      const levels = getPassingLevels(76);
      expect(levels.some(l => l.id === 'body')).toBe(true);
      expect(levels.some(l => l.id === 'preferred-body')).toBe(false);
    });
  });

  describe('parseAccessibilityFilter', () => {
    it('should return min:0 max:Infinity for undefined/empty/true', () => {
      expect(parseAccessibilityFilter(undefined)).toEqual({ min: 0, max: Infinity, raw: '' });
      expect(parseAccessibilityFilter('')).toEqual({ min: 0, max: Infinity, raw: '' });
      expect(parseAccessibilityFilter('true')).toEqual({ min: 0, max: Infinity, raw: 'true' });
    });

    it('should parse numeric Lc values as min threshold', () => {
      expect(parseAccessibilityFilter('60')).toEqual({ min: 60, max: Infinity, raw: '60' });
      expect(parseAccessibilityFilter('75')).toEqual({ min: 75, max: Infinity, raw: '75' });
    });

    it('should parse label aliases as min threshold', () => {
      expect(parseAccessibilityFilter('body')).toEqual({ min: 75, max: Infinity, raw: 'body' });
      expect(parseAccessibilityFilter('preferred')).toEqual({ min: 90, max: Infinity, raw: 'preferred' });
      expect(parseAccessibilityFilter('large')).toEqual({ min: 60, max: Infinity, raw: 'large' });
      expect(parseAccessibilityFilter('bold')).toEqual({ min: 45, max: Infinity, raw: 'bold' });
      expect(parseAccessibilityFilter('minimum')).toEqual({ min: 30, max: Infinity, raw: 'minimum' });
      expect(parseAccessibilityFilter('nontext')).toEqual({ min: 15, max: Infinity, raw: 'nontext' });
    });

    it('should be case-insensitive', () => {
      expect(parseAccessibilityFilter('BODY')).toEqual({ min: 75, max: Infinity, raw: 'BODY' });
      expect(parseAccessibilityFilter('Large')).toEqual({ min: 60, max: Infinity, raw: 'Large' });
    });

    it('should parse range syntax with numbers', () => {
      expect(parseAccessibilityFilter('15:30')).toEqual({ min: 15, max: 30, raw: '15:30' });
      expect(parseAccessibilityFilter('60:90')).toEqual({ min: 60, max: 90, raw: '60:90' });
    });

    it('should parse range syntax with labels', () => {
      expect(parseAccessibilityFilter('nontext:bold')).toEqual({ min: 15, max: 45, raw: 'nontext:bold' });
      expect(parseAccessibilityFilter('large:preferred')).toEqual({ min: 60, max: 90, raw: 'large:preferred' });
    });

    it('should auto-sort range values', () => {
      expect(parseAccessibilityFilter('90:15')).toEqual({ min: 15, max: 90, raw: '90:15' });
    });
  });

  describe('generateAccessibilityReport with filter', () => {
    const mockRamps: RampOutput[] = [
      {
        name: 'base',
        baseColor: '#3b82f6',
        config: {
          size: 3,
          lightness: { start: 0, end: 100 },
          saturation: { start: 100, end: 0 },
          hue: { start: -10, end: 10 },
          scales: { lightness: 'linear', saturation: 'linear', hue: 'linear' },
          tint: null,
        },
        colors: ['#000000', '#808080', '#ffffff'],
      },
    ];

    it('should return all levels with no filter', () => {
      const report = generateAccessibilityReport(mockRamps);
      expect(report.levels.length).toBe(APCA_LEVELS.length);
    });

    it('should filter to only high-contrast levels', () => {
      const report = generateAccessibilityReport(mockRamps, { min: 75, max: Infinity, raw: '75' });
      expect(report.levels.every(l => l.minLc >= 75)).toBe(true);
      expect(report.levels.some(l => l.minLc < 75)).toBe(false);
    });

    it('should filter by range', () => {
      const report = generateAccessibilityReport(mockRamps, { min: 30, max: 60, raw: '30:60' });
      expect(report.levels.every(l => l.minLc >= 30 && l.minLc <= 60)).toBe(true);
    });
  });

  describe('generateAccessibilityReport', () => {
    const mockRamps: RampOutput[] = [
      {
        name: 'base',
        baseColor: '#3b82f6',
        config: {
          size: 3,
          lightness: { start: 0, end: 100 },
          saturation: { start: 100, end: 0 },
          hue: { start: -10, end: 10 },
          scales: { lightness: 'linear', saturation: 'linear', hue: 'linear' },
          tint: null,
        },
        colors: ['#000000', '#808080', '#ffffff'],
      },
    ];

    it('should compute totalPairs as unordered pairs', () => {
      const report = generateAccessibilityReport(mockRamps);
      // 3 colors, unordered pairs = 3*2/2 = 3
      expect(report.totalPairs).toBe(3);
    });

    it('should have all APCA levels in report', () => {
      const report = generateAccessibilityReport(mockRamps);
      expect(report.levels.length).toBe(APCA_LEVELS.length);
    });

    it('should find high-contrast pairs at preferred body level', () => {
      const report = generateAccessibilityReport(mockRamps);
      const preferred = report.levels.find(l => l.id === 'preferred-body')!;
      // Black ↔ white should pass as one collapsed pair
      expect(preferred.pairs.length).toBeGreaterThanOrEqual(1);
    });

    it('should collapse direction pairs', () => {
      const report = generateAccessibilityReport(mockRamps);
      const preferred = report.levels.find(l => l.id === 'preferred-body')!;
      // Should have both Lc values on each pair
      for (const pair of preferred.pairs) {
        expect(pair.lcAB).toBeDefined();
        expect(pair.lcBA).toBeDefined();
        expect(pair.lcAB).not.toBe(pair.lcBA);
      }
    });

    it('should not duplicate pairs across levels', () => {
      const report = generateAccessibilityReport(mockRamps);
      const totalInLevels = report.levels.reduce((sum, l) => sum + l.pairs.length, 0);
      expect(totalInLevels).toBe(report.passingPairs);
    });

    it('should report cross-ramp pairs', () => {
      const twoRamps: RampOutput[] = [
        { ...mockRamps[0], name: 'base', colors: ['#000000', '#ffffff'] },
        { ...mockRamps[0], name: 'complementary', colors: ['#ff0000'] },
      ];
      const report = generateAccessibilityReport(twoRamps);
      // 3 colors total, unordered pairs = 3*2/2 = 3
      expect(report.totalPairs).toBe(3);
      // Should include cross-ramp pairs in results
      const allPairs = report.levels.flatMap(l => l.pairs);
      const crossRamp = allPairs.filter(p => p.colorA.ramp !== p.colorB.ramp);
      expect(crossRamp.length).toBeGreaterThan(0);
    });
  });
});

describe('CLI Integration - Accessibility', () => {
  const CLI = './dist/rampa';

  it('should not show accessibility report by default', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=3', '--no-preview'], { cwd: import.meta.dir + '/..', });
    const output = result.stdout.toString();
    expect(output).not.toContain('Accessibility Report');
  });

  it('should show accessibility report with -A flag', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=3', '--no-preview', '-A'], { cwd: import.meta.dir + '/..', });
    const output = result.stdout.toString();
    expect(output).toContain('Accessibility Report (APCA)');
    expect(output).toContain('pairs pass at least one level');
  });

  it('should show accessibility report with lowercase -a flag', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=3', '--no-preview', '-a'], { cwd: import.meta.dir + '/..', });
    const output = result.stdout.toString();
    expect(output).toContain('Accessibility Report (APCA)');
  });

  it('should include accessibility in JSON output with -A', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=3', '-O', 'json', '-A'], { cwd: import.meta.dir + '/..', });
    const output = result.stdout.toString();
    const json = JSON.parse(output);
    expect(json.accessibility).toBeDefined();
    expect(json.accessibility.totalPairs).toBeDefined();
    expect(json.accessibility.levels).toBeInstanceOf(Array);
    expect(json.accessibility.levels.length).toBe(6);
  });

  it('should not include accessibility in JSON without -A', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=3', '-O', 'json'], { cwd: import.meta.dir + '/..', });
    const output = result.stdout.toString();
    const json = JSON.parse(output);
    expect(json.accessibility).toBeUndefined();
  });

  it('should append CSS comment with -A in CSS mode', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=3', '-O', 'css', '-A'], { cwd: import.meta.dir + '/..', });
    const output = result.stdout.toString();
    expect(output).toContain('/*');
    expect(output).toContain('Accessibility Report (APCA)');
    expect(output).toContain('*/');
  });

  it('should filter by label name', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=5', '--no-preview', '-A', 'body'], { cwd: import.meta.dir + '/..', });
    const output = result.stdout.toString();
    expect(output).toContain('Preferred body text');
    expect(output).toContain('Body text');
    expect(output).not.toContain('Large text');
    expect(output).not.toContain('Non-text');
  });

  it('should filter by Lc number', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=5', '--no-preview', '-A=60'], { cwd: import.meta.dir + '/..', });
    const output = result.stdout.toString();
    expect(output).toContain('Large text');
    expect(output).not.toContain('Large/bold text');
    expect(output).not.toContain('Non-text');
  });

  it('should filter in JSON mode', () => {
    const result = Bun.spawnSync([CLI, '-C', '#3b82f6', '--size=5', '-O', 'json', '-A=body'], { cwd: import.meta.dir + '/..', });
    const json = JSON.parse(result.stdout.toString());
    expect(json.accessibility.levels.every((l: any) => l.minLc >= 75)).toBe(true);
  });
});
