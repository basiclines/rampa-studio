import { describe, it, expect, afterEach } from 'bun:test';
import { 
  hasLimitedColorSupport,
  supportsTruecolor,
  rgbTo256, 
  coloredSquare, 
  getColorLimitationNote 
} from '../src/utils/terminal-colors';

describe('Terminal Colors', () => {
  const originalColorterm = process.env.COLORTERM;
  const originalTerm = process.env.TERM;

  afterEach(() => {
    // Restore original environment
    if (originalColorterm === undefined) {
      delete process.env.COLORTERM;
    } else {
      process.env.COLORTERM = originalColorterm;
    }
    if (originalTerm === undefined) {
      delete process.env.TERM;
    } else {
      process.env.TERM = originalTerm;
    }
  });

  describe('supportsTruecolor', () => {
    it('should return true when COLORTERM=truecolor', () => {
      process.env.COLORTERM = 'truecolor';
      expect(supportsTruecolor()).toBe(true);
    });

    it('should return true when COLORTERM=24bit', () => {
      process.env.COLORTERM = '24bit';
      expect(supportsTruecolor()).toBe(true);
    });

    it('should return true when COLORTERM=TRUECOLOR (case insensitive)', () => {
      process.env.COLORTERM = 'TRUECOLOR';
      expect(supportsTruecolor()).toBe(true);
    });

    it('should return false when COLORTERM is not set', () => {
      delete process.env.COLORTERM;
      delete process.env.TERM;
      expect(supportsTruecolor()).toBe(false);
    });

    it('should return false when COLORTERM is empty', () => {
      process.env.COLORTERM = '';
      delete process.env.TERM;
      expect(supportsTruecolor()).toBe(false);
    });

    it('should return true when TERM contains truecolor', () => {
      delete process.env.COLORTERM;
      process.env.TERM = 'xterm-truecolor';
      expect(supportsTruecolor()).toBe(true);
    });

    it('should return false for xterm-256color without COLORTERM', () => {
      delete process.env.COLORTERM;
      process.env.TERM = 'xterm-256color';
      expect(supportsTruecolor()).toBe(false);
    });
  });

  describe('hasLimitedColorSupport', () => {
    it('should return false when COLORTERM=truecolor', () => {
      process.env.COLORTERM = 'truecolor';
      expect(hasLimitedColorSupport()).toBe(false);
    });

    it('should return true when no truecolor support', () => {
      delete process.env.COLORTERM;
      process.env.TERM = 'xterm-256color';
      expect(hasLimitedColorSupport()).toBe(true);
    });

    it('should return true when no color env vars set', () => {
      delete process.env.COLORTERM;
      delete process.env.TERM;
      expect(hasLimitedColorSupport()).toBe(true);
    });
  });

  describe('rgbTo256', () => {
    it('should convert black to color 16', () => {
      expect(rgbTo256(0, 0, 0)).toBe(16);
    });

    it('should convert white to color 231', () => {
      expect(rgbTo256(255, 255, 255)).toBe(231);
    });

    it('should convert pure red to correct color cube index', () => {
      // Pure red (255, 0, 0) -> 16 + 36*5 + 6*0 + 0 = 196
      expect(rgbTo256(255, 0, 0)).toBe(196);
    });

    it('should convert pure green to correct color cube index', () => {
      // Pure green (0, 255, 0) -> 16 + 36*0 + 6*5 + 0 = 46
      expect(rgbTo256(0, 255, 0)).toBe(46);
    });

    it('should convert pure blue to correct color cube index', () => {
      // Pure blue (0, 0, 255) -> 16 + 36*0 + 6*0 + 5 = 21
      expect(rgbTo256(0, 0, 255)).toBe(21);
    });

    it('should convert grayscale values to grayscale range', () => {
      // Mid-gray should be in grayscale range (232-255)
      const gray128 = rgbTo256(128, 128, 128);
      expect(gray128).toBeGreaterThanOrEqual(232);
      expect(gray128).toBeLessThanOrEqual(255);
    });

    it('should handle mixed colors', () => {
      // Some arbitrary color
      const result = rgbTo256(100, 150, 200);
      expect(result).toBeGreaterThanOrEqual(16);
      expect(result).toBeLessThanOrEqual(231);
    });
  });

  describe('coloredSquare', () => {
    it('should return truecolor ANSI code when COLORTERM=truecolor', () => {
      process.env.COLORTERM = 'truecolor';
      const result = coloredSquare(255, 128, 64);
      
      expect(result).toContain('\x1b[38;2;255;128;64m');
      expect(result).toContain('■');
      expect(result).toContain('\x1b[0m');
    });

    it('should return 256-color ANSI code when no truecolor support', () => {
      delete process.env.COLORTERM;
      process.env.TERM = 'xterm-256color';
      const result = coloredSquare(255, 128, 64);
      
      expect(result).toMatch(/\x1b\[38;5;\d+m/);
      expect(result).toContain('■');
      expect(result).toContain('\x1b[0m');
      // Should NOT contain truecolor format
      expect(result).not.toContain('38;2;');
    });
  });

  describe('getColorLimitationNote', () => {
    it('should return null when COLORTERM=truecolor', () => {
      process.env.COLORTERM = 'truecolor';
      expect(getColorLimitationNote()).toBeNull();
    });

    it('should return warning message when no truecolor support', () => {
      delete process.env.COLORTERM;
      process.env.TERM = 'xterm-256color';
      const note = getColorLimitationNote();
      
      expect(note).not.toBeNull();
      expect(note).toContain('256-color mode');
      expect(note).toContain('truecolor');
    });

    it('should mention COLORTERM in suggestion', () => {
      delete process.env.COLORTERM;
      delete process.env.TERM;
      const note = getColorLimitationNote();
      
      expect(note).toContain('COLORTERM=truecolor');
    });
  });
});
