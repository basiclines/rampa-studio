import { describe, it, expect } from 'bun:test';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

describe('Color ramp generation suite', () => {
  
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

  it('Generate color ramp with tint blend mode (color-burn)', () => {
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
      swatches: [],
      tintColor: "#FE0000",
      tintOpacity: 40,
      tintBlendMode: "color-burn"
    };

    const expectedColors = [
      "#070609",
      "#151522",
      "#1c2340",
      "#1d3061",
      "#183c86",
      "#3b4e94",
      "#796490",
      "#b27990",
      "#e38d95",
      "#ff9999"
    ];

    const generatedColors = generateColorRamp(config);
    expect(generatedColors).toHaveLength(10);
    
    expectedColors.forEach((expectedColor, index) => {
      expect(generatedColors[index]).toBe(expectedColor);
    });
  });

  it('Generate color ramp in HSL format', () => {
    const baseConfig: ColorRampConfig = {
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
      colorFormat: 'hsl',
      swatches: []
    };

    const generatedColors = generateColorRamp(baseConfig);

    const expectedHslColors = [
      "hsl(217, 36%, 4%)",
      "hsl(217, 47%, 15%)",
      "hsl(217, 58%, 26%)",
      "hsl(217, 69%, 38%)",
      "hsl(217, 80%, 49%)",
      "hsl(217, 91%, 60%)",
      "hsl(217, 80%, 71%)",
      "hsl(217, 69%, 82%)",
      "hsl(217, 58%, 93%)",
      "hsl(60, 100%, 100%)"
    ];

    expect(generatedColors).toHaveLength(10);
    generatedColors.forEach((expectedHslColor, index) => {
      expect(generatedColors[index]).toBe(expectedHslColor);
    });

    generatedColors.forEach((color, index) => {
      expect(color).toMatch(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/);
    });
  });

  it('Generate color ramp with advanced lightness, chroma, and saturation settings', () => {
    const config: ColorRampConfig = {
      id: "1",
      name: "Primary",
      baseColor: "#3b82f6",
      totalSteps: 10,
      lightnessRange: 100,
      lightnessAdvanced: true,
      chromaRange: 0,
      chromaAdvanced: true,
      saturationRange: 100,
      saturationAdvanced: true,
      colorFormat: 'hex',
      swatches: [],
      chromaStart: 36.3,
      chromaEnd: 64.2,
      saturationStart: 0,
      saturationEnd: 100,
      lightnessStart: 0,
      lightnessEnd: 100
    };

    const expectedColors = [
      "#000000",
      "#110336",
      "#2a0d65",
      "#471c8e",
      "#6932b0",
      "#8c5bc0",
      "#ac8ec6",
      "#c9bad3",
      "#e4e0e6",
      "#ffffff"
    ];

    const generatedColors = generateColorRamp(config);
    expect(generatedColors).toHaveLength(10);
    
    expectedColors.forEach((expectedColor, index) => {
      expect(generatedColors[index]).toBe(expectedColor);
    });
  });
}); 