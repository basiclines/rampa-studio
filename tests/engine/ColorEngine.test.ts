import { describe, it, expect } from 'bun:test';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

describe('ColorEngine - Expected Values Test', () => {
  
  it('should generate the exact expected Primary color ramp', () => {
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

    // Expected colors from the provided swatches
    const expectedColors = [
      "#070a0f", // index 0
      "#152339", // index 1
      "#1c3a6b", // index 2
      "#1e50a2", // index 3
      "#1964e0", // index 4
      "#3b82f6", // index 5 (base color)
      "#79a7f0", // index 6
      "#b2caf1", // index 7
      "#e3ebf8", // index 8
      "#ffffff"  // index 9
    ];

    const generatedColors = generateColorRamp(config);
    
    // Should generate exactly 10 colors
    expect(generatedColors).toHaveLength(10);
    
    console.log('Generated colors:', generatedColors);
    console.log('Expected colors: ', expectedColors);
    
    // Assert each color matches exactly
    expectedColors.forEach((expectedColor, index) => {
      expect(generatedColors[index]).toBe(expectedColor);
    });
  });
}); 