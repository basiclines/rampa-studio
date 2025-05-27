
import chroma from 'chroma-js';

const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
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

export const calculateAdvancedDefaults = (
  baseColor: string,
  attribute: 'lightness' | 'hue' | 'saturation',
  range: number
) => {
  try {
    const color = chroma(baseColor);
    const [h, s, l] = color.hsl();
    
    switch (attribute) {
      case 'lightness': {
        const baseLightness = (l || 0.5) * 100;
        return {
          start: roundToOneDecimal(Math.max(0, Math.min(100, baseLightness - range / 2))),
          end: roundToOneDecimal(Math.max(0, Math.min(100, baseLightness + range / 2)))
        };
      }
      case 'hue': {
        return {
          start: roundToOneDecimal(-range / 2),
          end: roundToOneDecimal(range / 2)
        };
      }
      case 'saturation': {
        const baseSaturation = (s || 0.5) * 100;
        return {
          start: roundToOneDecimal(Math.max(0, Math.min(100, baseSaturation - range / 2))),
          end: roundToOneDecimal(Math.max(0, Math.min(100, baseSaturation + range / 2)))
        };
      }
      default:
        return { start: 0, end: 0 };
    }
  } catch (error) {
    console.error('Error calculating advanced defaults:', error);
    return { start: 0, end: 0 };
  }
};
