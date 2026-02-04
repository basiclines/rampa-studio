import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { 
  hasLimitedColorSupport, 
  rgbTo256, 
  coloredSquare, 
  getColorLimitationNote 
} from '../src/utils/terminal-colors';

describe('Terminal Colors', () => {
  const originalTermProgram = process.env.TERM_PROGRAM;

  afterEach(() => {
    // Restore original TERM_PROGRAM
    if (originalTermProgram === undefined) {
      delete process.env.TERM_PROGRAM;
    } else {
      process.env.TERM_PROGRAM = originalTermProgram;
    }
  });

  describe('hasLimitedColorSupport', () => {
    it('should return true for Apple_Terminal', () => {
      process.env.TERM_PROGRAM = 'Apple_Terminal';
      expect(hasLimitedColorSupport()).toBe(true);
    });

    it('should return false for iTerm.app', () => {
      process.env.TERM_PROGRAM = 'iTerm.app';
      expect(hasLimitedColorSupport()).toBe(false);
    });

    it('should return false for vscode', () => {
      process.env.TERM_PROGRAM = 'vscode';
      expect(hasLimitedColorSupport()).toBe(false);
    });

    it('should return false when TERM_PROGRAM is not set', () => {
      delete process.env.TERM_PROGRAM;
      expect(hasLimitedColorSupport()).toBe(false);
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
    it('should return truecolor ANSI code when not in Terminal.app', () => {
      process.env.TERM_PROGRAM = 'iTerm.app';
      const result = coloredSquare(255, 128, 64);
      
      expect(result).toContain('\x1b[38;2;255;128;64m');
      expect(result).toContain('■');
      expect(result).toContain('\x1b[0m');
    });

    it('should return 256-color ANSI code in Terminal.app', () => {
      process.env.TERM_PROGRAM = 'Apple_Terminal';
      const result = coloredSquare(255, 128, 64);
      
      expect(result).toMatch(/\x1b\[38;5;\d+m/);
      expect(result).toContain('■');
      expect(result).toContain('\x1b[0m');
      // Should NOT contain truecolor format
      expect(result).not.toContain('38;2;');
    });
  });

  describe('getColorLimitationNote', () => {
    it('should return null when not in Terminal.app', () => {
      process.env.TERM_PROGRAM = 'iTerm.app';
      expect(getColorLimitationNote()).toBeNull();
    });

    it('should return warning message in Terminal.app', () => {
      process.env.TERM_PROGRAM = 'Apple_Terminal';
      const note = getColorLimitationNote();
      
      expect(note).not.toBeNull();
      expect(note).toContain('256-color mode');
      expect(note).toContain('macOS Terminal.app');
      expect(note).toContain('truecolor');
    });

    it('should suggest alternative terminals', () => {
      process.env.TERM_PROGRAM = 'Apple_Terminal';
      const note = getColorLimitationNote();
      
      expect(note).toContain('iTerm2');
    });
  });
});
