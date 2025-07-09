import { describe, it, expect } from 'bun:test';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

const mockRamp: ColorRampConfig = {
  id: '1',
  name: 'Test Ramp',
  baseColor: '#3b82f6',
  colorFormat: 'hex',
  totalSteps: 10,
  lightnessRange: 100,
  chromaRange: 0,
  saturationRange: 100,
  swatches: [
    { color: '#eff6ff', colorFormat: 'hex', index: 0, locked: false },
    { color: '#dbeafe', colorFormat: 'hex', index: 1, locked: false },
    { color: '#bfdbfe', colorFormat: 'hex', index: 2, locked: false },
    { color: '#93c5fd', colorFormat: 'hex', index: 3, locked: false },
    { color: '#60a5fa', colorFormat: 'hex', index: 4, locked: false },
    { color: '#3b82f6', colorFormat: 'hex', index: 5, locked: false },
    { color: '#2563eb', colorFormat: 'hex', index: 6, locked: false },
    { color: '#1d4ed8', colorFormat: 'hex', index: 7, locked: false },
    { color: '#1e40af', colorFormat: 'hex', index: 8, locked: false },
    { color: '#1e3a8a', colorFormat: 'hex', index: 9, locked: false },
  ],
};

const mockRamp2: ColorRampConfig = {
  id: '2',
  name: 'Test Ramp 2',
  baseColor: '#10b981',
  colorFormat: 'hex',
  totalSteps: 10,
  lightnessRange: 100,
  chromaRange: 0,
  saturationRange: 100,
  swatches: [
    { color: '#ecfdf5', colorFormat: 'hex', index: 0, locked: false },
    { color: '#d1fae5', colorFormat: 'hex', index: 1, locked: false },
    { color: '#a7f3d0', colorFormat: 'hex', index: 2, locked: false },
    { color: '#6ee7b7', colorFormat: 'hex', index: 3, locked: false },
    { color: '#34d399', colorFormat: 'hex', index: 4, locked: false },
    { color: '#10b981', colorFormat: 'hex', index: 5, locked: false },
    { color: '#059669', colorFormat: 'hex', index: 6, locked: false },
    { color: '#047857', colorFormat: 'hex', index: 7, locked: false },
    { color: '#065f46', colorFormat: 'hex', index: 8, locked: false },
    { color: '#064e3b', colorFormat: 'hex', index: 9, locked: false },
  ],
};

const mockRampWith6Steps: ColorRampConfig = {
  id: '3',
  name: 'Test Ramp 3',
  baseColor: '#f59e0b',
  colorFormat: 'hex',
  totalSteps: 6,
  lightnessRange: 100,
  chromaRange: 0,
  saturationRange: 100,
  swatches: [
    { color: '#fef3c7', colorFormat: 'hex', index: 0, locked: false },
    { color: '#fde68a', colorFormat: 'hex', index: 1, locked: false },
    { color: '#fcd34d', colorFormat: 'hex', index: 2, locked: false },
    { color: '#f59e0b', colorFormat: 'hex', index: 3, locked: false },
    { color: '#d97706', colorFormat: 'hex', index: 4, locked: false },
    { color: '#b45309', colorFormat: 'hex', index: 5, locked: false },
  ],
};

describe('Color Engine', () => {
  it('should generate a color ramp with 10 steps', () => {
    const result = generateColorRamp(mockRamp);
    expect(result.length).toBe(10);
  });

  it('should generate a color ramp with 6 steps', () => {
    const result = generateColorRamp(mockRampWith6Steps);
    expect(result.length).toBe(6);
  });

  it('should generate colors based on the base color', () => {
    const result = generateColorRamp(mockRamp);
    const middleIndex = Math.floor(mockRamp.totalSteps / 2);
    const middleColor = result[middleIndex];
    expect(middleColor).toBe(mockRamp.baseColor);
  });

  it('Generate color ramp with start and end values', () => {
    const rampWithStartEnd: ColorRampConfig = {
      id: '4',
      name: 'Test Ramp 4',
      baseColor: '#f59e0b',
      colorFormat: 'hex',
      totalSteps: 6,
      lightnessRange: 100,
      lightnessStart: 20,
      lightnessEnd: 80,
      chromaRange: 0,
      chromaStart: -10,
      chromaEnd: 10,
      saturationRange: 100,
      saturationStart: 40,
      saturationEnd: 60,
      swatches: [
        { color: '#fef3c7', colorFormat: 'hex', index: 0, locked: false },
        { color: '#fde68a', colorFormat: 'hex', index: 1, locked: false },
        { color: '#fcd34d', colorFormat: 'hex', index: 2, locked: false },
        { color: '#f59e0b', colorFormat: 'hex', index: 3, locked: false },
        { color: '#d97706', colorFormat: 'hex', index: 4, locked: false },
        { color: '#b45309', colorFormat: 'hex', index: 5, locked: false },
      ],
    };
    const result = generateColorRamp(rampWithStartEnd);
    expect(result.length).toBe(6);
  });
}); 