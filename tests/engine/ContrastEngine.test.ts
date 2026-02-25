import { describe, it, expect } from 'bun:test';
import { relativeLuminance, wcagContrastRatio, getWcagPassingLevels, WCAG_LEVELS, colorDeltaE, round2 } from '../../src/engine/ContrastEngine';

describe('ContrastEngine', () => {
  describe('relativeLuminance', () => {
    it('should return 0 for black', () => {
      expect(relativeLuminance(0, 0, 0)).toBe(0);
    });

    it('should return 1 for white', () => {
      expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 4);
    });

    it('should weight green higher than red or blue', () => {
      const rLum = relativeLuminance(255, 0, 0);
      const gLum = relativeLuminance(0, 255, 0);
      const bLum = relativeLuminance(0, 0, 255);
      expect(gLum).toBeGreaterThan(rLum);
      expect(gLum).toBeGreaterThan(bLum);
    });
  });

  describe('wcagContrastRatio', () => {
    it('should return 21:1 for black on white', () => {
      const ratio = wcagContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1:1 for same colors', () => {
      const ratio = wcagContrastRatio('#888888', '#888888');
      expect(ratio).toBeCloseTo(1, 2);
    });

    it('should be order-independent', () => {
      const ab = wcagContrastRatio('#333333', '#ffffff');
      const ba = wcagContrastRatio('#ffffff', '#333333');
      expect(ab).toBeCloseTo(ba, 2);
    });
  });

  describe('getWcagPassingLevels', () => {
    it('should pass all levels for 21:1', () => {
      const levels = getWcagPassingLevels(21);
      expect(levels.length).toBe(WCAG_LEVELS.length);
    });

    it('should pass no levels for 1:1', () => {
      const levels = getWcagPassingLevels(1);
      expect(levels.length).toBe(0);
    });

    it('should pass AA Large but not AAA Normal for 4:1', () => {
      const levels = getWcagPassingLevels(4);
      expect(levels.some(l => l.id === 'aa-large')).toBe(true);
      expect(levels.some(l => l.id === 'aaa-normal')).toBe(false);
    });
  });

  describe('colorDeltaE', () => {
    it('should return 0 for identical colors', () => {
      expect(colorDeltaE('#ff0000', '#ff0000')).toBe(0);
    });

    it('should return a small value for similar colors', () => {
      expect(colorDeltaE('#333333', '#343434')).toBeLessThan(3);
    });

    it('should return a large value for different colors', () => {
      expect(colorDeltaE('#000000', '#ffffff')).toBeGreaterThan(50);
    });
  });

  describe('round2', () => {
    it('should round to 2 decimal places', () => {
      expect(round2(3.14159)).toBe(3.14);
      expect(round2(-107.891)).toBe(-107.89);
    });
  });
});
