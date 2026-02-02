import { describe, it, expect } from 'bun:test';
import { parseRange, parsePercentRange, parseHueRange } from '../src/utils/range-parser';

describe('Range Parser', () => {
  describe('parseRange', () => {
    it('should parse a simple range', () => {
      const result = parseRange('10:90', 'test');
      expect(result).toEqual({ start: 10, end: 90 });
    });

    it('should parse a range with decimals', () => {
      const result = parseRange('10.5:90.5', 'test');
      expect(result).toEqual({ start: 10.5, end: 90.5 });
    });

    it('should parse a range with negative values', () => {
      const result = parseRange('-30:30', 'test');
      expect(result).toEqual({ start: -30, end: 30 });
    });

    it('should parse a single value as identical start and end', () => {
      const result = parseRange('50', 'test');
      expect(result).toEqual({ start: 50, end: 50 });
    });

    it('should parse zero values', () => {
      const result = parseRange('0:0', 'test');
      expect(result).toEqual({ start: 0, end: 0 });
    });

    it('should parse reversed range (end < start)', () => {
      const result = parseRange('100:0', 'test');
      expect(result).toEqual({ start: 100, end: 0 });
    });

    it('should handle whitespace', () => {
      const result = parseRange('  10:90  ', 'test');
      expect(result).toEqual({ start: 10, end: 90 });
    });

    it('should throw on invalid input', () => {
      expect(() => parseRange('abc', 'test')).toThrow();
    });

    it('should throw on empty string', () => {
      expect(() => parseRange('', 'test')).toThrow();
    });

    it('should throw on malformed range', () => {
      expect(() => parseRange('10:20:30', 'test')).toThrow();
    });

    it('should throw on partial range', () => {
      expect(() => parseRange('10:', 'test')).toThrow();
    });
  });

  describe('parsePercentRange', () => {
    it('should parse valid percentage range', () => {
      const result = parsePercentRange('0:100', 'lightness');
      expect(result).toEqual({ start: 0, end: 100 });
    });

    it('should parse mid-range percentages', () => {
      const result = parsePercentRange('20:80', 'lightness');
      expect(result).toEqual({ start: 20, end: 80 });
    });

    it('should allow reversed percentage range', () => {
      const result = parsePercentRange('100:0', 'saturation');
      expect(result).toEqual({ start: 100, end: 0 });
    });

    it('should throw on values below 0', () => {
      expect(() => parsePercentRange('-10:90', 'lightness')).toThrow();
    });

    it('should throw on values above 100', () => {
      expect(() => parsePercentRange('10:110', 'lightness')).toThrow();
    });

    it('should throw on both values out of range', () => {
      expect(() => parsePercentRange('-10:110', 'lightness')).toThrow();
    });
  });

  describe('parseHueRange', () => {
    it('should parse positive hue range', () => {
      const result = parseHueRange('0:30');
      expect(result).toEqual({ start: 0, end: 30 });
    });

    it('should parse negative hue range', () => {
      const result = parseHueRange('-30:30');
      expect(result).toEqual({ start: -30, end: 30 });
    });

    it('should parse large hue values', () => {
      const result = parseHueRange('-180:180');
      expect(result).toEqual({ start: -180, end: 180 });
    });

    it('should parse zero hue shift', () => {
      const result = parseHueRange('0:0');
      expect(result).toEqual({ start: 0, end: 0 });
    });
  });
});
