import { describe, it, expect } from 'bun:test';
import { contrast } from '../src/contrast';

describe('SDK contrast()', () => {
  describe('APCA mode (default)', () => {
    it('should return high contrast for white on dark background', () => {
      const result = contrast('#ffffff', '#1e1e2e');
      expect(Math.abs(result.score)).toBeGreaterThan(90);
      expect(result.pass).toBe(true);
      expect(result.levels.length).toBe(6);
    });

    it('should return low contrast for similar colors', () => {
      const result = contrast('#808080', '#828282');
      expect(Math.abs(result.score)).toBeLessThan(15);
      expect(result.pass).toBe(false);
    });

    it('should warn for near-identical colors', () => {
      const result = contrast('#333333', '#343434');
      expect(result.warnings.some(w => w.includes('nearly identical'))).toBe(true);
    });

    it('should warn for low contrast', () => {
      const result = contrast('#808080', '#828282');
      expect(result.warnings.some(w => w.includes('below minimum'))).toBe(true);
    });

    it('should warn for pure black', () => {
      const result = contrast('#000000', '#ffffff');
      expect(result.warnings.some(w => w.includes('#000000'))).toBe(true);
      expect(result.warnings.some(w => w.includes('#ffffff'))).toBe(true);
    });
  });

  describe('WCAG mode via .mode() chain', () => {
    it('should return contrast ratio for black on white', () => {
      const result = contrast('#000000', '#ffffff').mode('wcag');
      expect(result.score).toBeCloseTo(21, 0);
      expect(result.pass).toBe(true);
    });

    it('should pass AA Large but not AAA Normal for mid-gray on white', () => {
      const result = contrast('#777777', '#ffffff').mode('wcag');
      const aaLarge = result.levels.find(l => l.name === 'AA Large text');
      const aaaNormal = result.levels.find(l => l.name === 'AAA Normal text');
      expect(aaLarge?.pass).toBe(true);
      expect(aaaNormal?.pass).toBe(false);
    });

    it('should have 4 WCAG levels', () => {
      const result = contrast('#fff', '#000').mode('wcag');
      expect(result.levels.length).toBe(4);
    });
  });

  describe('result shape', () => {
    it('should include foreground and background hex', () => {
      const result = contrast('#ff0000', '#00ff00');
      expect(result.foreground).toMatch(/^#[0-9a-f]{6}$/);
      expect(result.background).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should normalize hex colors', () => {
      const result = contrast('#fff', '#000');
      expect(result.foreground).toBe('#ffffff');
      expect(result.background).toBe('#000000');
    });

    it('should accept any CSS color format', () => {
      const result = contrast('rgb(255, 0, 0)', 'hsl(240, 100%, 50%)');
      expect(result.foreground).toMatch(/^#[0-9a-f]{6}$/);
      expect(result.score).toBeDefined();
    });

    it('should serialize with toJSON()', () => {
      const result = contrast('#fff', '#000').toJSON();
      expect(result.mode).toBe('apca');
      expect(result.foreground).toBe('#ffffff');
      expect(result.levels).toBeInstanceOf(Array);
    });
  });
});
