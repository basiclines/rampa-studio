import chroma from 'chroma-js';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { BlendMode } from '@/entities/BlendModeEntity';
import { calculatePositions } from './HarmonyEngine';
import { applyBlendMode } from './BlendingEngine';

// Color formatting helper with validation
const formatColor = (color: chroma.Color, colorFormat: 'hex' | 'hsl'): string => {
  try {
    if (colorFormat === 'hsl') {
      const [h, s, l] = color.hsl();
      
      // Validate and clamp HSL values
      const validH = clampValue(h, 0, 360);
      const validS = clampValue(s, 0, 1);
      const validL = clampValue(l, 0, 1);
      
      return `hsl(${Math.round(validH)}, ${Math.round(validS * 100)}%, ${Math.round(validL * 100)}%)`;
    }
    return color.hex();
  } catch (error) {
    console.error('Error formatting color:', error);
    // Fallback to a safe color
    return '#000000';
  }
};

// Validation helper for color calculations
const isValidNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const clampValue = (value: number, min: number, max: number): number => {
  if (!isValidNumber(value)) return min;
  return Math.max(min, Math.min(max, value));
};

// Color calculation helpers with validation
const calculateLightness = (
  config: ColorRampConfig,
  position: number,
  baseLightness: number,
  middleIndex: number,
  i: number
): number => {
  try {
    let newLightness: number;
    
    if (config.lightnessAdvanced && config.lightnessStart !== undefined && config.lightnessEnd !== undefined) {
      const startLightness = config.lightnessStart / 100;
      const endLightness = config.lightnessEnd / 100;
      newLightness = startLightness + (endLightness - startLightness) * position;
    } else {
      const lightnessStep = (config.lightnessRange / 100) / (config.totalSteps - 1);
      const positionFromMiddle = i - middleIndex;
      const lightnessAdjustment = positionFromMiddle * lightnessStep;
      newLightness = baseLightness + lightnessAdjustment;
    }
    
    return clampValue(newLightness, 0, 1);
  } catch (error) {
    console.error('Error calculating lightness:', error);
    return 0.5; // Safe fallback
  }
};

const calculateHue = (
  config: ColorRampConfig,
  position: number,
  baseHue: number,
  middleIndex: number,
  i: number
): number => {
  try {
    let newHue: number;
    
    if (config.chromaAdvanced && config.chromaStart !== undefined && config.chromaEnd !== undefined) {
      const hueRange = config.chromaEnd - config.chromaStart;
      newHue = (baseHue + config.chromaStart + hueRange * position) % 360;
    } else {
      const hueStep = config.chromaRange / (config.totalSteps - 1);
      const positionFromMiddle = i - middleIndex;
      const hueAdjustment = positionFromMiddle * hueStep;
      newHue = (baseHue + hueAdjustment) % 360;
    }
    
    // Ensure hue is positive and valid
    while (newHue < 0) newHue += 360;
    return clampValue(newHue, 0, 360);
  } catch (error) {
    console.error('Error calculating hue:', error);
    return 0; // Safe fallback
  }
};

const calculateSaturation = (
  config: ColorRampConfig,
  position: number,
  baseSaturation: number,
  middleIndex: number,
  i: number
): number => {
  try {
    let newSaturation: number;
    
    if (config.saturationAdvanced && config.saturationStart !== undefined && config.saturationEnd !== undefined) {
      const startSaturation = config.saturationStart / 100;
      const endSaturation = config.saturationEnd / 100;
      const invertedPosition = 1 - position;
      newSaturation = startSaturation + (endSaturation - startSaturation) * invertedPosition;
    } else {
      const saturationStep = (config.saturationRange / 100) / (config.totalSteps - 1);
      const positionFromMiddle = i - middleIndex;
      const saturationAdjustment = Math.abs(positionFromMiddle) * saturationStep;
      newSaturation = baseSaturation - saturationAdjustment;
    }
    
    return clampValue(newSaturation, 0, 1);
  } catch (error) {
    console.error('Error calculating saturation:', error);
    return 0.5; // Safe fallback
  }
};

// Color generation helper with validation
const generateSingleColor = (
  config: ColorRampConfig,
  i: number,
  baseColor: chroma.Color,
  middleIndex: number
): string => {
  try {
    const [h, s, l] = baseColor.hsl();
    const baseHue = isValidNumber(h) ? h : 0;
    const baseSaturation = isValidNumber(s) ? s : 0;
    const baseLightness = isValidNumber(l) ? l : 0;

    const positions = calculatePositions(i, config);

    const newLightness = calculateLightness(config, positions.lightness, baseLightness, middleIndex, i);
    const newHue = calculateHue(config, positions.hue, baseHue, middleIndex, i);
    const newSaturation = calculateSaturation(config, positions.saturation, baseSaturation, middleIndex, i);

    // Validate all values before creating color
    if (!isValidNumber(newHue) || !isValidNumber(newSaturation) || !isValidNumber(newLightness)) {
      console.warn('Invalid color values detected, using fallback:', { newHue, newSaturation, newLightness });
      return formatColor(chroma.hsl(0, 0, 0.5), config.colorFormat);
    }
    
    // Create the new color
    let newColor = chroma.hsl(newHue, newSaturation, newLightness);
    
    // Apply tint if configured
    if (config.tintColor && config.tintOpacity && config.tintOpacity > 0) {
      try {
        const tintColorChroma = chroma(config.tintColor);
        const opacity = config.tintOpacity / 100;
        const blendMode = config.tintBlendMode || 'normal';
        
        newColor = applyBlendMode(newColor, tintColorChroma, opacity, blendMode);
      } catch (error) {
        console.error('Error applying tint:', error);
        // Continue without tint if there's an error
      }
    }
    
    return formatColor(newColor, config.colorFormat);
  } catch (error) {
    console.error('Error generating single color:', error);
    // Return a safe fallback color
    return formatColor(chroma.hsl(0, 0, 0.5), config.colorFormat);
  }
};

// Fallback color generation helper
const generateFallbackColors = (config: ColorRampConfig): string[] => {
  const fallbackColors: string[] = [];
  for (let i = 0; i < config.totalSteps; i++) {
    const lightness = (i / (config.totalSteps - 1)) * 0.8 + 0.1;
    const fallbackColor = chroma.hsl(0, 0, lightness);
    const formattedColor = formatColor(fallbackColor, config.colorFormat);
    fallbackColors.push(formattedColor);
  }
  return fallbackColors;
};

export const generateColorRamp = (config: ColorRampConfig): string[] => {
  try {
    const baseColor = chroma(config.baseColor);
    const colors: string[] = [];
    const middleIndex = Math.floor(config.totalSteps / 2);
    
    // Generate colors from darkest to lightest
    for (let i = 0; i < config.totalSteps; i++) {
      // Check if this color index is locked (swatch)
      if (config.swatches && config.swatches[i]?.locked) {
        colors.push(config.swatches[i].color);
        continue;
      }
      
      const color = generateSingleColor(config, i, baseColor, middleIndex);
      colors.push(color);
    }
    
    return colors;
  } catch (error) {
    console.error('Error generating color ramp:', error);
    return generateFallbackColors(config);
  }
};

// Color harmony helpers for ramp creation
export function getAnalogousColors(baseColor: string, count: number = 2): string[] {
  // Returns baseColor plus count-1 analogous colors (±30° steps)
  const color = chroma(baseColor);
  const [h, s, l] = color.hsl();
  const step = 30;
  const colors = [baseColor];
  for (let i = 1; i < count; i++) {
    const angle = h + step * i;
    colors.push(chroma.hsl((angle + 360) % 360, s, l).hex());
  }
  return colors;
}

export function getTriadColors(baseColor: string): string[] {
  // Returns baseColor plus two triadic colors (±120°)
  const color = chroma(baseColor);
  const [h, s, l] = color.hsl();
  return [
    baseColor,
    chroma.hsl((h + 120) % 360, s, l).hex(),
    chroma.hsl((h + 240) % 360, s, l).hex(),
  ];
}

export function getComplementaryColors(baseColor: string): string[] {
  // Returns baseColor and its complement (180° apart)
  const color = chroma(baseColor);
  const [h, s, l] = color.hsl();
  return [
    baseColor,
    chroma.hsl((h + 180) % 360, s, l).hex(),
  ];
}

export function getSplitComplementaryColors(baseColor: string): string[] {
  // Returns baseColor and two split complements (±150°, ±210°)
  const color = chroma(baseColor);
  const [h, s, l] = color.hsl();
  return [
    baseColor,
    chroma.hsl((h + 150) % 360, s, l).hex(),
    chroma.hsl((h + 210) % 360, s, l).hex(),
  ];
}

export function getSquareColors(baseColor: string): string[] {
  // Returns baseColor and three others at 90° intervals
  const color = chroma(baseColor);
  const [h, s, l] = color.hsl();
  return [
    baseColor,
    chroma.hsl((h + 90) % 360, s, l).hex(),
    chroma.hsl((h + 180) % 360, s, l).hex(),
    chroma.hsl((h + 270) % 360, s, l).hex(),
  ];
}

export function getCompoundColors(baseColor: string): string[] {
  // Compound: base, complement, and two near-complements (±150°, ±210°)
  const color = chroma(baseColor);
  const [h, s, l] = color.hsl();
  return [
    baseColor,
    chroma.hsl((h + 180) % 360, s, l).hex(),
    chroma.hsl((h + 150) % 360, s, l).hex(),
    chroma.hsl((h + 210) % 360, s, l).hex(),
  ];
}
