import { describe, it, expect } from 'bun:test';
import { lint } from '../src/lint';

describe('SDK lint()', () => {
  describe('APCA mode (default)', () => {
    it('should return high contrast for white on dark background', () => {
      const result = lint('#ffffff', '#1e1e2e');
      expect(Math.abs(result.score)).toBeGreaterThan(90);
      expect(result.pass).toBe(true);
      expect(result.levels.length).toBe(6);
    });

    it('should return low contrast for similar colors', () => {
      const result = lint('#808080', '#828282');
      expect(Math.abs(result.score)).toBeLessThan(15);
      expect(result.pass).toBe(false);
    });

    it('should warn for near-identical colors', () => {
      const result = lint('#333333', '#343434');
      expect(result.warnings.some(w => w.includes('nearly identical'))).toBe(true);
    });

    it('should warn for low contrast', () => {
      const result = lint('#808080', '#828282');
      expect(result.warnings.some(w => w.includes('below minimum'))).toBe(true);
    });

    it('should warn for pure black', () => {
      const result = lint('#000000', '#ffffff');
      expect(result.warnings.some(w => w.includes('#000000'))).toBe(true);
      expect(result.warnings.some(w => w.includes('#ffffff'))).toBe(true);
    });
  });

  describe('WCAG mode via .mode("wcag")', () => {
    it('should return contrast ratio for black on white', () => {
      const result = lint('#000000', '#ffffff').mode('wcag');
      expect(result.score).toBeCloseTo(21, 0);
      expect(result.pass).toBe(true);
    });

    it('should pass AA Large but not AAA Normal for mid-gray on white', () => {
      const result = lint('#777777', '#ffffff').mode('wcag');
      const aaLarge = result.levels.find(l => l.name === 'AA Large text');
      const aaaNormal = result.levels.find(l => l.name === 'AAA Normal text');
      expect(aaLarge?.pass).toBe(true);
      expect(aaaNormal?.pass).toBe(false);
    });

    it('should have 4 WCAG levels', () => {
      const result = lint('#fff', '#000').mode('wcag');
      expect(result.levels.length).toBe(4);
    });

    it('should warn for near-identical colors', () => {
      const result = lint('#333333', '#343434').mode('wcag');
      expect(result.warnings.some(w => w.includes('nearly identical'))).toBe(true);
    });

    it('should warn for pure black', () => {
      const result = lint('#000000', '#ffffff').mode('wcag');
      expect(result.warnings.some(w => w.includes('#000000'))).toBe(true);
      expect(result.warnings.some(w => w.includes('#ffffff'))).toBe(true);
    });
  });

  describe('result shape', () => {
    it('should include foreground and background hex', () => {
      const result = lint('#ff0000', '#00ff00');
      expect(result.foreground).toMatch(/^#[0-9a-f]{6}$/);
      expect(result.background).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should normalize hex colors', () => {
      const result = lint('#fff', '#000');
      expect(result.foreground).toBe('#ffffff');
      expect(result.background).toBe('#000000');
    });

    it('should accept any CSS color format', () => {
      const result = lint('rgb(255, 0, 0)', 'hsl(240, 100%, 50%)');
      expect(result.foreground).toMatch(/^#[0-9a-f]{6}$/);
      expect(result.score).toBeDefined();
    });

    it('should serialize with toJSON()', () => {
      const result = lint('#fff', '#000').toJSON();
      expect(result.mode).toBe('apca');
      expect(result.foreground).toBe('#ffffff');
      expect(result.levels).toBeInstanceOf(Array);
    });
  });

  describe('output()', () => {
    it('output("json") returns valid JSON', () => {
      const json = JSON.parse(lint('#fff', '#000').output('json'));
      expect(json.mode).toBe('apca');
      expect(json.score).toBeDefined();
      expect(json.levels).toBeInstanceOf(Array);
    });

    it('output("text") returns readable text', () => {
      const text = lint('#fff', '#000').output('text');
      expect(text).toContain('Score:');
      expect(text).toContain('Levels:');
    });

    it('output("css") returns CSS custom properties', () => {
      const css = lint('#fff', '#000').output('css');
      expect(css).toContain(':root {');
      expect(css).toContain('--lint-foreground:');
      expect(css).toContain('--lint-background:');
    });
  });

  describe('APCA is always available', () => {
    it('APCA mode should work without any extra dependency', () => {
      const result = lint('#ffffff', '#1e1e2e').mode('apca');
      expect(Math.abs(result.score)).toBeGreaterThan(90);
    });
  });
});
