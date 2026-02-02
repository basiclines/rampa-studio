import { describe, it, expect } from 'bun:test';
import { SCALE_TYPES, isValidScaleType } from '../src/constants/scales';
import { BLEND_MODES, isValidBlendMode } from '../src/constants/blend-modes';
import { HARMONY_TYPES, isValidHarmonyType, HARMONY_RAMP_COUNT } from '../src/constants/harmonies';
import { OUTPUT_FORMATS, isValidOutputFormat } from '../src/constants/output-formats';

describe('Constants', () => {
  describe('Scale Types', () => {
    it('should have all expected scale types', () => {
      expect(SCALE_TYPES).toContain('linear');
      expect(SCALE_TYPES).toContain('geometric');
      expect(SCALE_TYPES).toContain('fibonacci');
      expect(SCALE_TYPES).toContain('golden-ratio');
      expect(SCALE_TYPES).toContain('logarithmic');
      expect(SCALE_TYPES).toContain('powers-of-2');
      expect(SCALE_TYPES).toContain('musical-ratio');
      expect(SCALE_TYPES).toContain('cielab-uniform');
      expect(SCALE_TYPES).toContain('ease-in');
      expect(SCALE_TYPES).toContain('ease-out');
      expect(SCALE_TYPES).toContain('ease-in-out');
    });

    it('should have 11 scale types', () => {
      expect(SCALE_TYPES.length).toBe(11);
    });

    it('should validate valid scale types', () => {
      expect(isValidScaleType('linear')).toBe(true);
      expect(isValidScaleType('fibonacci')).toBe(true);
      expect(isValidScaleType('ease-in-out')).toBe(true);
    });

    it('should reject invalid scale types', () => {
      expect(isValidScaleType('invalid')).toBe(false);
      expect(isValidScaleType('')).toBe(false);
      expect(isValidScaleType('LINEAR')).toBe(false); // case sensitive
    });
  });

  describe('Blend Modes', () => {
    it('should have all expected blend modes', () => {
      expect(BLEND_MODES).toContain('normal');
      expect(BLEND_MODES).toContain('multiply');
      expect(BLEND_MODES).toContain('screen');
      expect(BLEND_MODES).toContain('overlay');
      expect(BLEND_MODES).toContain('darken');
      expect(BLEND_MODES).toContain('lighten');
      expect(BLEND_MODES).toContain('color-dodge');
      expect(BLEND_MODES).toContain('color-burn');
      expect(BLEND_MODES).toContain('hard-light');
      expect(BLEND_MODES).toContain('soft-light');
      expect(BLEND_MODES).toContain('difference');
      expect(BLEND_MODES).toContain('exclusion');
      expect(BLEND_MODES).toContain('hue');
      expect(BLEND_MODES).toContain('saturation');
      expect(BLEND_MODES).toContain('color');
      expect(BLEND_MODES).toContain('luminosity');
    });

    it('should validate valid blend modes', () => {
      expect(isValidBlendMode('normal')).toBe(true);
      expect(isValidBlendMode('multiply')).toBe(true);
      expect(isValidBlendMode('overlay')).toBe(true);
    });

    it('should reject invalid blend modes', () => {
      expect(isValidBlendMode('invalid')).toBe(false);
      expect(isValidBlendMode('')).toBe(false);
      expect(isValidBlendMode('NORMAL')).toBe(false);
    });
  });

  describe('Harmony Types', () => {
    it('should have all expected harmony types', () => {
      expect(HARMONY_TYPES).toContain('complementary');
      expect(HARMONY_TYPES).toContain('triadic');
      expect(HARMONY_TYPES).toContain('analogous');
      expect(HARMONY_TYPES).toContain('split-complementary');
      expect(HARMONY_TYPES).toContain('square');
      expect(HARMONY_TYPES).toContain('compound');
    });

    it('should have 6 harmony types', () => {
      expect(HARMONY_TYPES.length).toBe(6);
    });

    it('should validate valid harmony types', () => {
      expect(isValidHarmonyType('complementary')).toBe(true);
      expect(isValidHarmonyType('triadic')).toBe(true);
      expect(isValidHarmonyType('split-complementary')).toBe(true);
    });

    it('should reject invalid harmony types', () => {
      expect(isValidHarmonyType('invalid')).toBe(false);
      expect(isValidHarmonyType('')).toBe(false);
      expect(isValidHarmonyType('COMPLEMENTARY')).toBe(false);
    });

    it('should have correct ramp counts for each harmony', () => {
      expect(HARMONY_RAMP_COUNT['complementary']).toBe(1);
      expect(HARMONY_RAMP_COUNT['triadic']).toBe(2);
      expect(HARMONY_RAMP_COUNT['analogous']).toBe(2);
      expect(HARMONY_RAMP_COUNT['split-complementary']).toBe(2);
      expect(HARMONY_RAMP_COUNT['square']).toBe(3);
      expect(HARMONY_RAMP_COUNT['compound']).toBe(3);
    });
  });

  describe('Output Formats', () => {
    it('should have all expected output formats', () => {
      expect(OUTPUT_FORMATS).toContain('text');
      expect(OUTPUT_FORMATS).toContain('json');
      expect(OUTPUT_FORMATS).toContain('css');
    });

    it('should have 3 output formats', () => {
      expect(OUTPUT_FORMATS.length).toBe(3);
    });

    it('should validate valid output formats', () => {
      expect(isValidOutputFormat('text')).toBe(true);
      expect(isValidOutputFormat('json')).toBe(true);
      expect(isValidOutputFormat('css')).toBe(true);
    });

    it('should reject invalid output formats', () => {
      expect(isValidOutputFormat('invalid')).toBe(false);
      expect(isValidOutputFormat('')).toBe(false);
      expect(isValidOutputFormat('JSON')).toBe(false);
      expect(isValidOutputFormat('yaml')).toBe(false);
    });
  });
});
