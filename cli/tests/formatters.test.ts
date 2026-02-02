import { describe, it, expect } from 'bun:test';
import { formatJson } from '../src/formatters/json';
import { formatCss } from '../src/formatters/css';
import type { RampOutput } from '../src/formatters/types';

const mockRamp: RampOutput = {
  name: 'base',
  baseColor: '#3b82f6',
  config: {
    size: 5,
    lightness: { start: 0, end: 100 },
    saturation: { start: 100, end: 0 },
    hue: { start: -10, end: 10 },
    scales: {
      lightness: 'linear',
      saturation: 'linear',
      hue: 'linear',
    },
    tint: null,
  },
  colors: ['#000000', '#1e3a5f', '#3b82f6', '#a3bffa', '#ffffff'],
};

const mockRampWithTint: RampOutput = {
  name: 'tinted',
  baseColor: '#3b82f6',
  config: {
    size: 3,
    lightness: { start: 20, end: 80 },
    saturation: { start: 100, end: 50 },
    hue: { start: 0, end: 0 },
    scales: {
      lightness: 'fibonacci',
      saturation: 'ease-out',
      hue: 'linear',
    },
    tint: {
      color: '#ff0000',
      opacity: 20,
      blend: 'overlay',
    },
  },
  colors: ['#1a1a2e', '#4a69bd', '#b8c5d9'],
};

describe('Formatters', () => {
  describe('JSON Formatter', () => {
    it('should format a single ramp as JSON', () => {
      const result = formatJson([mockRamp]);
      const parsed = JSON.parse(result);
      
      expect(parsed).toHaveProperty('ramps');
      expect(parsed.ramps).toHaveLength(1);
      expect(parsed.ramps[0].name).toBe('base');
      expect(parsed.ramps[0].baseColor).toBe('#3b82f6');
      expect(parsed.ramps[0].colors).toHaveLength(5);
    });

    it('should format multiple ramps as JSON', () => {
      const result = formatJson([mockRamp, mockRampWithTint]);
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps).toHaveLength(2);
      expect(parsed.ramps[0].name).toBe('base');
      expect(parsed.ramps[1].name).toBe('tinted');
    });

    it('should include config in JSON output', () => {
      const result = formatJson([mockRamp]);
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config).toBeDefined();
      expect(parsed.ramps[0].config.size).toBe(5);
      expect(parsed.ramps[0].config.lightness).toEqual({ start: 0, end: 100 });
      expect(parsed.ramps[0].config.scales.lightness).toBe('linear');
    });

    it('should include tint config when present', () => {
      const result = formatJson([mockRampWithTint]);
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.tint).not.toBeNull();
      expect(parsed.ramps[0].config.tint.color).toBe('#ff0000');
      expect(parsed.ramps[0].config.tint.opacity).toBe(20);
      expect(parsed.ramps[0].config.tint.blend).toBe('overlay');
    });

    it('should have null tint when not present', () => {
      const result = formatJson([mockRamp]);
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.tint).toBeNull();
    });

    it('should produce valid JSON', () => {
      const result = formatJson([mockRamp, mockRampWithTint]);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should handle empty ramps array', () => {
      const result = formatJson([]);
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps).toEqual([]);
    });
  });

  describe('CSS Formatter', () => {
    it('should format a single ramp as CSS', () => {
      const result = formatCss([mockRamp]);
      
      expect(result).toContain(':root {');
      expect(result).toContain('/* base */');
      expect(result).toContain('--base-0:');
      expect(result).toContain('--base-4:');
      expect(result).toContain('}');
    });

    it('should include all colors as CSS variables', () => {
      const result = formatCss([mockRamp]);
      
      expect(result).toContain('--base-0: #000000;');
      expect(result).toContain('--base-1: #1e3a5f;');
      expect(result).toContain('--base-2: #3b82f6;');
      expect(result).toContain('--base-3: #a3bffa;');
      expect(result).toContain('--base-4: #ffffff;');
    });

    it('should format multiple ramps with comments', () => {
      const result = formatCss([mockRamp, mockRampWithTint]);
      
      expect(result).toContain('/* base */');
      expect(result).toContain('/* tinted */');
    });

    it('should sanitize ramp names for CSS', () => {
      const rampWithSpaces: RampOutput = {
        ...mockRamp,
        name: 'Blue Primary',
      };
      const result = formatCss([rampWithSpaces]);
      
      expect(result).toContain('--blue-primary-0:');
      expect(result).not.toContain('Blue Primary');
    });

    it('should handle special characters in names', () => {
      const rampWithSpecialChars: RampOutput = {
        ...mockRamp,
        name: 'color@#$%123',
      };
      const result = formatCss([rampWithSpecialChars]);
      
      // Name should be sanitized to only contain valid CSS chars
      expect(result).toContain('--color123-');
      expect(result).toContain('/* color123 */');
    });

    it('should handle empty ramps array', () => {
      const result = formatCss([]);
      
      expect(result).toBe(':root {\n}');
    });

    it('should produce valid CSS structure', () => {
      const result = formatCss([mockRamp]);
      
      // Should start with :root {
      expect(result.startsWith(':root {')).toBe(true);
      // Should end with }
      expect(result.endsWith('}')).toBe(true);
      // Each variable line should end with semicolon
      const lines = result.split('\n').filter(l => l.includes('--'));
      lines.forEach(line => {
        expect(line.trim().endsWith(';')).toBe(true);
      });
    });
  });
});
