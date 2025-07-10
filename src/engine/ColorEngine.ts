import chroma from 'chroma-js';
import { ColorRampConfig, ColorFormat } from '@/entities/ColorRampEntity';
import { BlendMode } from '@/entities/BlendModeEntity';
import { calculatePositions } from './HarmonyEngine';
import { applyBlendMode } from './BlendingEngine';
import { convertFromOklch, convertToOklch, formatOklchString, roundOklch, constrainOklchValues, type OklchColor } from './OklchEngine';

// Color formatting helper with validation
const formatColor = (color: chroma.Color, colorFormat: ColorFormat): string => {
  try {
    if (colorFormat === 'hsl') {
      const [h, s, l] = color.hsl();
      
      // Validate and clamp HSL values
      const validH = clampValue(h, 0, 360);
      const validS = clampValue(s, 0, 1);
      const validL = clampValue(l, 0, 1);
      
      return `hsl(${Math.round(validH)}, ${Math.round(validS * 100)}%, ${Math.round(validL * 100)}%)`;
    }
    
    if (colorFormat === 'oklch') {
      const hexColor = color.hex();
      const oklchColor = convertToOklch(hexColor);
      return formatOklchString(oklchColor);
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

// Color calculation helpers with validation (HSL-based)
const calculateLightness = (
  config: ColorRampConfig,
  position: number,
  baseLightness: number,
  middleIndex: number,
  i: number
): number => {
  try {
    const startLightness = config.lightnessStart / 100;
    const endLightness = config.lightnessEnd / 100;
    const newLightness = startLightness + (endLightness - startLightness) * position;
    
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
    const hueRange = config.chromaEnd - config.chromaStart;
    let newHue = (baseHue + config.chromaStart + hueRange * position) % 360;
    
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
    const startSaturation = config.saturationStart / 100;
    const endSaturation = config.saturationEnd / 100;
    const invertedPosition = 1 - position;
    const newSaturation = startSaturation + (endSaturation - startSaturation) * invertedPosition;
    
    return clampValue(newSaturation, 0, 1);
  } catch (error) {
    console.error('Error calculating saturation:', error);
    return 0.5; // Safe fallback
  }
};

// OKLCH-native calculation helpers
const calculateOklchLightness = (
  config: ColorRampConfig,
  position: number,
  baseLightness: number,
  middleIndex: number,
  i: number
): number => {
  try {
    const startLightness = config.lightnessStart / 100;
    const endLightness = config.lightnessEnd / 100;
    const newLightness = startLightness + (endLightness - startLightness) * position;
    
    return clampValue(newLightness, 0, 1);
  } catch (error) {
    console.error('Error calculating OKLCH lightness:', error);
    return 0.5; // Safe fallback
  }
};

const calculateOklchHue = (
  config: ColorRampConfig,
  position: number,
  baseHue: number,
  middleIndex: number,
  i: number
): number => {
  try {
    const hueRange = config.chromaEnd - config.chromaStart;
    let newHue = (baseHue + config.chromaStart + hueRange * position) % 360;
    
    // Ensure hue is positive and valid
    while (newHue < 0) newHue += 360;
    return clampValue(newHue, 0, 360);
  } catch (error) {
    console.error('Error calculating OKLCH hue:', error);
    return 0; // Safe fallback
  }
};

const calculateOklchChroma = (
  config: ColorRampConfig,
  position: number,
  baseChroma: number,
  middleIndex: number,
  i: number
): number => {
  try {
    // For OKLCH, we interpret saturation controls as chroma controls
    const startChroma = (config.saturationStart / 100) * baseChroma;
    const endChroma = (config.saturationEnd / 100) * baseChroma;
    const invertedPosition = 1 - position;
    const newChroma = startChroma + (endChroma - startChroma) * invertedPosition;
    
    return Math.max(0, newChroma); // Chroma cannot be negative
  } catch (error) {
    console.error('Error calculating OKLCH chroma:', error);
    return 0.1; // Safe fallback
  }
};

// HSL-based color generation
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

// OKLCH-native color generation
const generateSingleColorOklch = (
  config: ColorRampConfig,
  i: number,
  baseOklch: OklchColor,
  middleIndex: number
): string => {
  try {
    const positions = calculatePositions(i, config);

    const newLightness = calculateOklchLightness(config, positions.lightness, baseOklch.l, middleIndex, i);
    const newHue = calculateOklchHue(config, positions.hue, baseOklch.h, middleIndex, i);
    const newChroma = calculateOklchChroma(config, positions.saturation, baseOklch.c, middleIndex, i);

    // Create new OKLCH color
    let newOklch: OklchColor = {
      l: newLightness,
      c: newChroma,
      h: newHue,
      alpha: baseOklch.alpha
    };

    // Apply gamut constraints
    newOklch = constrainOklchValues(newOklch);

    // Apply tint if configured (convert to chroma for blending, then back)
    if (config.tintColor && config.tintOpacity && config.tintOpacity > 0) {
      try {
        const hexColor = convertFromOklch(newOklch);
        let chromaColor = chroma(hexColor);
        const tintColorChroma = chroma(config.tintColor);
        const opacity = config.tintOpacity / 100;
        const blendMode = config.tintBlendMode || 'normal';
        
        chromaColor = applyBlendMode(chromaColor, tintColorChroma, opacity, blendMode);
        
        // Convert back to OKLCH
        const blendedHex = chromaColor.hex();
        newOklch = convertToOklch(blendedHex);
      } catch (error) {
        console.error('Error applying tint to OKLCH:', error);
        // Continue without tint if there's an error
      }
    }

    return formatOklchString(roundOklch(newOklch));
  } catch (error) {
    console.error('Error generating single OKLCH color:', error);
    // Return a safe fallback color
    return formatOklchString(roundOklch({ l: 0.5, c: 0.1, h: 0, alpha: 1 }));
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
      
      // Choose generation method based on color format
      if (config.colorFormat === 'oklch') {
        const color = generateSingleColorOklch(config, i, convertToOklch(config.baseColor), middleIndex);
        colors.push(color);
      } else {
        // Use HSL-based generation for hex and hsl formats
        const color = generateSingleColor(config, i, baseColor, middleIndex);
        colors.push(color);
      }
    }
    
    return colors;
  } catch (error) {
    console.error('Error generating color ramp:', error);
    return generateFallbackColors(config);
  }
};

// Color harmony helpers for ramp creation

export function getAnalogousColors(baseColor: string, count: number = 2, mode: 'hsl' | 'oklch' = 'hsl'): string[] {
  if (mode === 'oklch') {
    const oklch = convertToOklch(baseColor);
    const step = 30;
    const colors = [formatOklchString(oklch)];
    for (let i = 1; i < count; i++) {
      const newHue = (oklch.h + step * i) % 360;
      colors.push(formatOklchString({ ...oklch, h: newHue }));
    }
    return colors;
  } else {
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
}

export function getTriadColors(baseColor: string, mode: 'hsl' | 'oklch' = 'hsl'): string[] {
  if (mode === 'oklch') {
    const oklch = convertToOklch(baseColor);
    return [
      formatOklchString(oklch),
      formatOklchString({ ...oklch, h: (oklch.h + 120) % 360 }),
      formatOklchString({ ...oklch, h: (oklch.h + 240) % 360 }),
    ];
  } else {
    const color = chroma(baseColor);
    const [h, s, l] = color.hsl();
    return [
      baseColor,
      chroma.hsl((h + 120) % 360, s, l).hex(),
      chroma.hsl((h + 240) % 360, s, l).hex(),
    ];
  }
}

export function getComplementaryColors(baseColor: string, mode: 'hsl' | 'oklch' = 'hsl'): string[] {
  if (mode === 'oklch') {
    const oklch = convertToOklch(baseColor);
    return [
      formatOklchString(oklch),
      formatOklchString({ ...oklch, h: (oklch.h + 180) % 360 }),
    ];
  } else {
    const color = chroma(baseColor);
    const [h, s, l] = color.hsl();
    return [
      baseColor,
      chroma.hsl((h + 180) % 360, s, l).hex(),
    ];
  }
}

export function getSplitComplementaryColors(baseColor: string, mode: 'hsl' | 'oklch' = 'hsl'): string[] {
  if (mode === 'oklch') {
    const oklch = convertToOklch(baseColor);
    return [
      formatOklchString(oklch),
      formatOklchString({ ...oklch, h: (oklch.h + 150) % 360 }),
      formatOklchString({ ...oklch, h: (oklch.h + 210) % 360 }),
    ];
  } else {
    const color = chroma(baseColor);
    const [h, s, l] = color.hsl();
    return [
      baseColor,
      chroma.hsl((h + 150) % 360, s, l).hex(),
      chroma.hsl((h + 210) % 360, s, l).hex(),
    ];
  }
}

export function getSquareColors(baseColor: string, mode: 'hsl' | 'oklch' = 'hsl'): string[] {
  if (mode === 'oklch') {
    const oklch = convertToOklch(baseColor);
    return [
      formatOklchString(oklch),
      formatOklchString({ ...oklch, h: (oklch.h + 90) % 360 }),
      formatOklchString({ ...oklch, h: (oklch.h + 180) % 360 }),
      formatOklchString({ ...oklch, h: (oklch.h + 270) % 360 }),
    ];
  } else {
    const color = chroma(baseColor);
    const [h, s, l] = color.hsl();
    return [
      baseColor,
      chroma.hsl((h + 90) % 360, s, l).hex(),
      chroma.hsl((h + 180) % 360, s, l).hex(),
      chroma.hsl((h + 270) % 360, s, l).hex(),
    ];
  }
}

export function getCompoundColors(baseColor: string, mode: 'hsl' | 'oklch' = 'hsl'): string[] {
  if (mode === 'oklch') {
    const oklch = convertToOklch(baseColor);
    return [
      formatOklchString(oklch),
      formatOklchString({ ...oklch, h: (oklch.h + 180) % 360 }),
      formatOklchString({ ...oklch, h: (oklch.h + 150) % 360 }),
      formatOklchString({ ...oklch, h: (oklch.h + 210) % 360 }),
    ];
  } else {
    const color = chroma(baseColor);
    const [h, s, l] = color.hsl();
    return [
      baseColor,
      chroma.hsl((h + 180) % 360, s, l).hex(),
      chroma.hsl((h + 150) % 360, s, l).hex(),
      chroma.hsl((h + 210) % 360, s, l).hex(),
    ];
  }
}

// Color format conversion utility
export const convertColorFormat = (color: string, fromFormat: ColorFormat, toFormat: ColorFormat): string => {
  try {
    if (fromFormat === toFormat) {
      return color;
    }
    
    // Convert to chroma.js color object first
    let chromaColor: chroma.Color;
    
    if (fromFormat === 'oklch') {
      // Convert OKLCH to hex first, then to chroma
      const oklchColor = convertToOklch(color);
      const hexColor = convertFromOklch(oklchColor);
      chromaColor = chroma(hexColor);
    } else {
      // For hex and hsl, chroma.js can handle them directly
      chromaColor = chroma(color);
    }
    
    // Format to target format
    return formatColor(chromaColor, toFormat);
  } catch (error) {
    console.error('Error converting color format:', error);
    return color; // Return original if conversion fails
  }
};
