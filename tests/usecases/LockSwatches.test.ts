import { describe, it, expect } from 'bun:test';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { lockRampColor } from '@/usecases/LockRampColor';

describe('Lock colors suite', () => {

  it('Lock a swatch and verify it persists after config change', () => {
    // Initial config with empty swatches
    const config: ColorRampConfig = {
      id: "1",
      name: "Primary",
      baseColor: "#3b82f6",
      totalSteps: 10,
      lightnessRange: 100,
      lightnessAdvanced: false,
      chromaRange: 0,
      chromaAdvanced: false,
      saturationRange: 100,
      saturationAdvanced: false,
      colorFormat: 'hex',
      swatches: Array(10).fill(null).map((_, i) => ({
        color: "",
        index: i,
        locked: false
      }))
    };

    // Generate initial colors
    const initialColors = generateColorRamp(config);

    // Lock color at index 3 using the pure function
    const indexToLock = 3;
    const colorToLock = initialColors[indexToLock];
    const updatedRamps = lockRampColor([config], "1", indexToLock, colorToLock);
    const configWithLock = updatedRamps[0];

    // Verify the color was locked
    expect(configWithLock.swatches[indexToLock].locked).toBe(true);
    expect(configWithLock.swatches[indexToLock].color).toBe(colorToLock);

    // Change lightness range
    const configWithChanges = {
      ...configWithLock,
      lightnessRange: 80
    };

    // Generate new colors and verify locked color persists
    const newColors = generateColorRamp(configWithChanges);
    expect(newColors[indexToLock]).toBe(colorToLock);
  });

  it('Lock all swatchs and verify it persists after config change', () => {
    const config: ColorRampConfig = {
      id: "1",
      name: "Primary",
      baseColor: "#3b82f6",
      totalSteps: 10,
      lightnessRange: 100,
      lightnessAdvanced: false,
      chromaRange: 0,
      chromaAdvanced: false,
      saturationRange: 100,
      saturationAdvanced: false,
      colorFormat: 'hex',
      swatches: []  
    };

    const initialColors = generateColorRamp(config);
    let lastConfig = config;
    
    initialColors.forEach((color, index) => {
      const updatedRamps = lockRampColor([config], "1", index, color);
      const configWithLock = updatedRamps[0];
      lastConfig = configWithLock;
    });

    lastConfig.swatches.forEach((swatch) => {
      expect(swatch.color).toBe(initialColors[swatch.index]);
      expect(swatch.locked).toBe(true);
    });
  });

}); 