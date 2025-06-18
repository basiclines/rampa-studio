import chroma from 'chroma-js';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { BlendMode } from '@/entities/BlendModeEntity';
import { calculatePositions } from './HarmonyEngine';

// Helper function to clamp values between 0 and 255
const clamp = (value: number): number => Math.max(0, Math.min(255, value));

// Helper function to apply blending modes
const applyBlendMode = (baseColor: chroma.Color, tintColor: chroma.Color, opacity: number, blendMode: BlendMode): chroma.Color => {
  const baseRgb = baseColor.rgb();
  const tintRgb = tintColor.rgb();
  
  let blendedRgb: [number, number, number];
  
  switch (blendMode) {
    case 'darken':
      blendedRgb = [
        Math.min(baseRgb[0], tintRgb[0]),
        Math.min(baseRgb[1], tintRgb[1]),
        Math.min(baseRgb[2], tintRgb[2])
      ];
      break;
    
    case 'multiply':
      blendedRgb = [
        (baseRgb[0] * tintRgb[0]) / 255,
        (baseRgb[1] * tintRgb[1]) / 255,
        (baseRgb[2] * tintRgb[2]) / 255
      ];
      break;
    
    case 'plus-darker':
      blendedRgb = [
        clamp(baseRgb[0] + tintRgb[0] - 255),
        clamp(baseRgb[1] + tintRgb[1] - 255),
        clamp(baseRgb[2] + tintRgb[2] - 255)
      ];
      break;
    
    case 'color-burn':
      blendedRgb = baseRgb.map((base, i) => {
        const tint = tintRgb[i];
        if (tint === 0) return 0;
        return clamp(255 - (((255 - base) * 255) / tint));
      }) as [number, number, number];
      break;
    
    case 'lighten':
      blendedRgb = [
        Math.max(baseRgb[0], tintRgb[0]),
        Math.max(baseRgb[1], tintRgb[1]),
        Math.max(baseRgb[2], tintRgb[2])
      ];
      break;
    
    case 'screen':
      blendedRgb = [
        255 - (((255 - baseRgb[0]) * (255 - tintRgb[0])) / 255),
        255 - (((255 - baseRgb[1]) * (255 - tintRgb[1])) / 255),
        255 - (((255 - baseRgb[2]) * (255 - tintRgb[2])) / 255)
      ];
      break;
    
    case 'plus-lighter':
      blendedRgb = [
        clamp(baseRgb[0] + tintRgb[0]),
        clamp(baseRgb[1] + tintRgb[1]),
        clamp(baseRgb[2] + tintRgb[2])
      ];
      break;
    
    case 'color-dodge':
      blendedRgb = baseRgb.map((base, i) => {
        const tint = tintRgb[i];
        if (tint === 255) return 255;
        return clamp((base * 255) / (255 - tint));
      }) as [number, number, number];
      break;
    
    case 'overlay':
      blendedRgb = baseRgb.map((base, i) => {
        const tint = tintRgb[i];
        const baseNorm = base / 255;
        const tintNorm = tint / 255;
        
        if (baseNorm < 0.5) {
          return 2 * baseNorm * tintNorm * 255;
        } else {
          return (1 - 2 * (1 - baseNorm) * (1 - tintNorm)) * 255;
        }
      }) as [number, number, number];
      break;
    
    case 'soft-light':
      blendedRgb = baseRgb.map((base, i) => {
        const tint = tintRgb[i];
        const baseNorm = base / 255;
        const tintNorm = tint / 255;
        
        if (tintNorm < 0.5) {
          return (2 * baseNorm * tintNorm + baseNorm * baseNorm * (1 - 2 * tintNorm)) * 255;
        } else {
          return (2 * baseNorm * (1 - tintNorm) + Math.sqrt(baseNorm) * (2 * tintNorm - 1)) * 255;
        }
      }) as [number, number, number];
      break;
    
    case 'hard-light':
      blendedRgb = baseRgb.map((base, i) => {
        const tint = tintRgb[i];
        const baseNorm = base / 255;
        const tintNorm = tint / 255;
        
        if (tintNorm < 0.5) {
          return 2 * baseNorm * tintNorm * 255;
        } else {
          return (1 - 2 * (1 - baseNorm) * (1 - tintNorm)) * 255;
        }
      }) as [number, number, number];
      break;
    
    case 'difference':
      blendedRgb = [
        Math.abs(baseRgb[0] - tintRgb[0]),
        Math.abs(baseRgb[1] - tintRgb[1]),
        Math.abs(baseRgb[2] - tintRgb[2])
      ];
      break;
    
    case 'exclusion':
      blendedRgb = [
        baseRgb[0] + tintRgb[0] - (2 * baseRgb[0] * tintRgb[0]) / 255,
        baseRgb[1] + tintRgb[1] - (2 * baseRgb[1] * tintRgb[1]) / 255,
        baseRgb[2] + tintRgb[2] - (2 * baseRgb[2] * tintRgb[2]) / 255
      ];
      break;
    
    case 'hue':
      const baseHsl = baseColor.hsl();
      const tintHsl = tintColor.hsl();
      return chroma.hsl(tintHsl[0] || 0, baseHsl[1] || 0, baseHsl[2] || 0);
    
    case 'saturation':
      const baseHsl2 = baseColor.hsl();
      const tintHsl2 = tintColor.hsl();
      return chroma.hsl(baseHsl2[0] || 0, tintHsl2[1] || 0, baseHsl2[2] || 0);
    
    case 'color':
      const baseHsl3 = baseColor.hsl();
      const tintHsl3 = tintColor.hsl();
      return chroma.hsl(tintHsl3[0] || 0, tintHsl3[1] || 0, baseHsl3[2] || 0);
    
    case 'luminosity':
      const baseHsl4 = baseColor.hsl();
      const tintHsl4 = tintColor.hsl();
      return chroma.hsl(baseHsl4[0] || 0, baseHsl4[1] || 0, tintHsl4[2] || 0);
    
    case 'normal':
    default:
      // Normal blending is just regular mixing
      return chroma.mix(baseColor, tintColor, opacity, 'rgb');
  }
  
  // Apply opacity by mixing with original color
  const blendedColor = chroma.rgb(...blendedRgb);
  return chroma.mix(baseColor, blendedColor, opacity, 'rgb');
};

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
