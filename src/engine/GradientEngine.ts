
import chroma from 'chroma-js';
import { roundToOneDecimal } from './utils';

/**
 * Pure functions for converting between gradient values and positions
 * Handles special cases like hue gradients with circular wrapping
 */

export interface GradientPositionParams {
  value: number;
  min: number;
  max: number;
  referenceValue?: number;
  isHueGradient?: boolean;
  invertValues?: boolean;
}

export interface PositionToValueParams {
  position: number;
  min: number;
  max: number;
  referenceValue?: number;
  isHueGradient?: boolean;
  invertValues?: boolean;
}

/**
 * Convert a value to a position percentage (0-100) on a gradient
 */
export const valueToPosition = ({
  value,
  min,
  max,
  referenceValue,
  isHueGradient = false,
  invertValues = false
}: GradientPositionParams): number => {
  if (invertValues) {
    // For inverted sliders, map values in reverse
    return ((max - value) / (max - min)) * 100;
  }
  
  // Special handling for hue slider - make positions relative to reference
  if (isHueGradient && min === -180 && max === 180 && referenceValue !== undefined) {
    // Convert reference value (0-360) to position on gradient (0-100%)
    const referencePos = (referenceValue / 360) * 100;
    // Convert relative value (-180 to +180) to offset from reference
    const relativeOffset = (value / 360) * 100; // Convert to percentage of full circle
    // Position relative to reference, wrapping around if necessary
    let position = referencePos + relativeOffset;
    if (position > 100) position -= 100;
    if (position < 0) position += 100;
    return position;
  }
  
  return ((value - min) / (max - min)) * 100;
};

/**
 * Convert a position percentage (0-100) back to a value
 */
export const positionToValue = ({
  position,
  min,
  max,
  referenceValue,
  isHueGradient = false,
  invertValues = false
}: PositionToValueParams): number => {
  if (invertValues) {
    // For inverted sliders, map position in reverse
    const value = max - (position / 100) * (max - min);
    return roundToOneDecimal(Math.max(min, Math.min(max, value)));
  }
  
  // Special handling for hue slider - convert position back to relative value
  if (isHueGradient && min === -180 && max === 180 && referenceValue !== undefined) {
    // Convert reference value (0-360) to position on gradient (0-100%)
    const referencePos = (referenceValue / 360) * 100;
    // Calculate offset from reference position
    let relativeOffset = position - referencePos;
    // Handle wrapping
    if (relativeOffset > 50) relativeOffset -= 100;
    if (relativeOffset < -50) relativeOffset += 100;
    // Convert percentage back to degrees (-180 to +180)
    const value = (relativeOffset / 100) * 360;
    return roundToOneDecimal(Math.max(min, Math.min(max, value)));
  }
  
  const value = min + (position / 100) * (max - min);
  return roundToOneDecimal(Math.max(min, Math.min(max, value)));
};

/**
 * Determine if a gradient control represents a hue slider based on its properties
 */
export const isHueGradient = (label: string, min: number, max: number): boolean => {
  return label === 'Hue' && min === -180 && max === 180;
};

export const generateLightnessGradient = (baseColor: string): string[] => {
  try {
    const color = chroma(baseColor);
    const [h, s] = color.hsl();
    const colors: string[] = [];
    
    // From base color to white (lightness 0 to 100%)
    for (let i = 0; i <= 10; i++) {
      const lightness = i / 10;
      colors.push(chroma.hsl(h || 0, s || 0, lightness).hex());
    }
    return colors;
  } catch (error) {
    console.error('Error generating lightness gradient:', error);
    // Fallback to grayscale
    const colors: string[] = [];
    for (let i = 0; i <= 10; i++) {
      const lightness = i / 10;
      colors.push(chroma.hsl(0, 0, lightness).hex());
    }
    return colors;
  }
};

export const generateHueGradient = (baseColor: string): string[] => {
  try {
    const color = chroma(baseColor);
    const [, s, l] = color.hsl();
    const colors: string[] = [];
    
    // Use base color's saturation and lightness for the hue gradient
    for (let i = 0; i <= 10; i++) {
      const hue = (i / 10) * 360;
      colors.push(chroma.hsl(hue, s || 0.5, l || 0.5).hex());
    }
    return colors;
  } catch (error) {
    console.error('Error generating hue gradient:', error);
    // Fallback to standard hue wheel
    const colors: string[] = [];
    for (let i = 0; i <= 10; i++) {
      const hue = (i / 10) * 360;
      colors.push(chroma.hsl(hue, 1, 0.5).hex());
    }
    return colors;
  }
};

export const generateSaturationGradient = (baseColor: string): string[] => {
  try {
    const color = chroma(baseColor);
    const [h, , l] = color.hsl();
    const colors: string[] = [];
    
    // From completely desaturated base color to base color (saturation 0 to 100%) - INVERTED
    for (let i = 0; i <= 10; i++) {
      const saturation = (10 - i) / 10; // Invert the saturation values
      colors.push(chroma.hsl(h || 0, saturation, l || 0.5).hex());
    }
    return colors;
  } catch (error) {
    console.error('Error generating saturation gradient:', error);
    // Fallback to grayscale to color - INVERTED
    const colors: string[] = [];
    for (let i = 0; i <= 10; i++) {
      const saturation = (10 - i) / 10; // Invert the saturation values
      colors.push(chroma.hsl(0, saturation, 0.5).hex());
    }
    return colors;
  }
};
