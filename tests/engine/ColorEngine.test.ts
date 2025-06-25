import { describe, it, expect } from 'bun:test';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

describe('generateColorRamp', () => {
  
  it('Generate the default color ramp', () => {
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

    const expectedColors = [
      "#070a0f",
      "#152339",
      "#1c3a6b",
      "#1e50a2",
      "#1964e0",
      "#3b82f6",
      "#79a7f0",
      "#b2caf1",
      "#e3ebf8",
      "#ffffff" 
    ];

    const generatedColors = generateColorRamp(config);
    expect(generatedColors).toHaveLength(10);
    
    expectedColors.forEach((expectedColor, index) => {
      expect(generatedColors[index]).toBe(expectedColor);
    });
  });



}); 