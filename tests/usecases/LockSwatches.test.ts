import { describe, it, expect } from 'bun:test';
import { lockRampColor } from '@/usecases/LockRampColor';
import { lockAllRampColors } from '@/usecases/LockAllRampColors';
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

const mockRamps = [mockRamp, mockRamp2];

describe('Lock Swatch Usecases', () => {
  it('should lock a color at a specific index', () => {
    const result = lockRampColor(mockRamps, '1', 3, '#93c5fd');
    const updatedRamp = result.find(r => r.id === '1');
    expect(updatedRamp?.swatches[3].locked).toBe(true);
    expect(updatedRamp?.swatches[3].color).toBe('#93c5fd');
  });

  it('should lock all colors in a ramp', () => {
    const colors = mockRamp.swatches.map(s => s.color);
    const result = lockAllRampColors(mockRamps, '1', colors, true);
    const updatedRamp = result.find(r => r.id === '1');
    expect(updatedRamp?.swatches.every(s => s.locked)).toBe(true);
  });

  it('should not affect other ramps when locking', () => {
    const result = lockRampColor(mockRamps, '1', 3, '#93c5fd');
    const otherRamp = result.find(r => r.id === '2');
    expect(otherRamp?.swatches.every(s => !s.locked)).toBe(true);
  });
}); 