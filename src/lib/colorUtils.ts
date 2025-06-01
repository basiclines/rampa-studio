import chroma from 'chroma-js';
import { ColorRampConfig, BlendMode } from '@/types/colorRamp';

interface ColorRampData {
  name: string;
  colors: string[];
}

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

export const generateColorRamp = (config: ColorRampConfig): string[] => {
  try {
    const baseColor = chroma(config.baseColor);
    const colors: string[] = [];
    
    // Get base color properties
    const [h, s, l] = baseColor.hsl();
    const baseHue = h || 0;
    const baseSaturation = s || 0;
    const baseLightness = l || 0;
    
    // Calculate the middle index (base color position)
    const middleIndex = Math.floor(config.totalSteps / 2);
    
    // Determine scale type for each attribute
    const lightnessScale = config.lightnessScaleType || 'linear';
    const hueScale = config.hueScaleType || 'linear';
    const saturationScale = config.saturationScaleType || 'linear';

    // Helper for geometric progression (0 to 1)
    function geometricPosition(i: number, steps: number) {
      const ratio = 3;
      if (steps <= 1) return 0;
      const min = 1;
      const max = Math.pow(ratio, steps - 1);
      return (Math.pow(ratio, i) - min) / (max - min);
    }

    // Fibonacci scale helper
    function fibonacciPositions(steps: number): number[] {
      const fibs = [0, 1];
      for (let i = 2; i < steps; i++) {
        fibs.push(fibs[i - 1] + fibs[i - 2]);
      }
      const min = fibs[0];
      const max = fibs[fibs.length - 1];
      return fibs.map(f => (f - min) / (max - min));
    }

    // Golden Ratio scale helper
    function goldenRatioPositions(steps: number): number[] {
      const phi = 1.61803398875;
      const vals = [];
      for (let i = 0; i < steps; i++) {
        vals.push(Math.pow(phi, i));
      }
      const min = vals[0];
      const max = vals[vals.length - 1];
      return vals.map(v => (v - min) / (max - min));
    }

    // Logarithmic scale helper
    function logarithmicPosition(i: number, steps: number) {
      const min = 1;
      const max = steps;
      const logMin = Math.log(min);
      const logMax = Math.log(max);
      const x = i + 1;
      return (Math.log(x) - logMin) / (logMax - logMin);
    }

    // Powers of 2 scale helper
    function powersOf2Position(i: number, steps: number) {
      const min = 1;
      const max = Math.pow(2, steps - 1);
      return (Math.pow(2, i) - min) / (max - min);
    }

    // Musical ratio scale helper
    function musicalRatioPosition(i: number, steps: number) {
      const ratios = [1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 15/8, 2];
      let seq = [];
      if (steps <= ratios.length) {
        seq = ratios.slice(0, steps);
      } else {
        for (let j = 0; j < steps; j++) {
          seq.push(1 * Math.pow(2, j / (steps - 1)));
        }
      }
      const min = seq[0];
      const max = seq[seq.length - 1];
      return (seq[i] - min) / (max - min);
    }

    // CIELAB uniform (placeholder: linear)
    function cielabUniformPosition(i: number, steps: number) {
      return i / (steps - 1);
    }

    // Ease-in
    function easeInPosition(i: number, steps: number) {
      const t = i / (steps - 1);
      return t * t;
    }
    // Ease-out
    function easeOutPosition(i: number, steps: number) {
      const t = i / (steps - 1);
      return 1 - (1 - t) * (1 - t);
    }
    // Ease-in-out
    function easeInOutPosition(i: number, steps: number) {
      const t = i / (steps - 1);
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    // Generate colors from darkest to lightest
    for (let i = 0; i < config.totalSteps; i++) {
      // Check if this color index is locked
      if (config.lockedColors && config.lockedColors[i]) {
        colors.push(config.lockedColors[i]);
        continue;
      }
      // Precompute all positions for Fibonacci, Golden Ratio, etc.
      const linearPosition = i / (config.totalSteps - 1);
      const geometricPos = geometricPosition(i, config.totalSteps);
      const fibPositions = fibonacciPositions(config.totalSteps);
      const fibPos = fibPositions[i];
      const goldenPositions = goldenRatioPositions(config.totalSteps);
      const goldenPos = goldenPositions[i];
      const logPos = logarithmicPosition(i, config.totalSteps);
      const pow2Pos = powersOf2Position(i, config.totalSteps);
      const musicalPos = musicalRatioPosition(i, config.totalSteps);
      const cielabPos = cielabUniformPosition(i, config.totalSteps);
      const easeInPos = easeInPosition(i, config.totalSteps);
      const easeOutPos = easeOutPosition(i, config.totalSteps);
      const easeInOutPos = easeInOutPosition(i, config.totalSteps);

      // Apply scale type to each attribute
      const positionLightness =
        lightnessScale === 'geometric' ? geometricPos :
        lightnessScale === 'fibonacci' ? fibPos :
        lightnessScale === 'golden-ratio' ? goldenPos :
        lightnessScale === 'logarithmic' ? logPos :
        lightnessScale === 'powers-of-2' ? pow2Pos :
        lightnessScale === 'musical-ratio' ? musicalPos :
        lightnessScale === 'cielab-uniform' ? cielabPos :
        lightnessScale === 'ease-in' ? easeInPos :
        lightnessScale === 'ease-out' ? easeOutPos :
        lightnessScale === 'ease-in-out' ? easeInOutPos :
        linearPosition;
      const positionHue =
        hueScale === 'geometric' ? geometricPos :
        hueScale === 'fibonacci' ? fibPos :
        hueScale === 'golden-ratio' ? goldenPos :
        hueScale === 'logarithmic' ? logPos :
        hueScale === 'powers-of-2' ? pow2Pos :
        hueScale === 'musical-ratio' ? musicalPos :
        hueScale === 'cielab-uniform' ? cielabPos :
        hueScale === 'ease-in' ? easeInPos :
        hueScale === 'ease-out' ? easeOutPos :
        hueScale === 'ease-in-out' ? easeInOutPos :
        linearPosition;
      const positionSaturation =
        saturationScale === 'geometric' ? geometricPos :
        saturationScale === 'fibonacci' ? fibPos :
        saturationScale === 'golden-ratio' ? goldenPos :
        saturationScale === 'logarithmic' ? logPos :
        saturationScale === 'powers-of-2' ? pow2Pos :
        saturationScale === 'musical-ratio' ? musicalPos :
        saturationScale === 'cielab-uniform' ? cielabPos :
        saturationScale === 'ease-in' ? easeInPos :
        saturationScale === 'ease-out' ? easeOutPos :
        saturationScale === 'ease-in-out' ? easeInOutPos :
        linearPosition;

      let newLightness: number;
      let newHue: number;
      let newSaturation: number;
      
      // Calculate lightness
      if (config.lightnessAdvanced && config.lightnessStart !== undefined && config.lightnessEnd !== undefined) {
        // Convert percentage values to 0-1 range
        const startLightness = config.lightnessStart / 100;
        const endLightness = config.lightnessEnd / 100;
        newLightness = startLightness + (endLightness - startLightness) * positionLightness;
      } else {
        const lightnessStep = (config.lightnessRange / 100) / (config.totalSteps - 1);
        const positionFromMiddle = i - middleIndex;
        const lightnessAdjustment = positionFromMiddle * lightnessStep;
        newLightness = baseLightness + lightnessAdjustment;
      }
      
      // Calculate hue
      if (config.chromaAdvanced && config.chromaStart !== undefined && config.chromaEnd !== undefined) {
        const hueRange = config.chromaEnd - config.chromaStart;
        newHue = (baseHue + config.chromaStart + hueRange * positionHue) % 360;
      } else {
        const hueStep = config.chromaRange / (config.totalSteps - 1);
        const positionFromMiddle = i - middleIndex;
        const hueAdjustment = positionFromMiddle * hueStep;
        newHue = (baseHue + hueAdjustment) % 360;
      }
      
      // Calculate saturation - INVERTED logic
      if (config.saturationAdvanced && config.saturationStart !== undefined && config.saturationEnd !== undefined) {
        // Convert percentage values to 0-1 range
        const startSaturation = config.saturationStart / 100;
        const endSaturation = config.saturationEnd / 100;
        // Invert the position so bottom of ramp (position 0) gets lower saturation
        const invertedPosition = 1 - positionSaturation;
        newSaturation = startSaturation + (endSaturation - startSaturation) * invertedPosition;
      } else {
        const saturationStep = (config.saturationRange / 100) / (config.totalSteps - 1);
        const positionFromMiddle = i - middleIndex;
        const saturationAdjustment = Math.abs(positionFromMiddle) * saturationStep;
        newSaturation = baseSaturation - saturationAdjustment;
      }
      
      // Ensure hue is positive
      if (newHue < 0) newHue += 360;
      
      // Clamp values to valid ranges
      newLightness = Math.max(0, Math.min(1, newLightness));
      newSaturation = Math.max(0, Math.min(1, newSaturation));
      
      // Create the new color
      let newColor = chroma.hsl(newHue, newSaturation, newLightness);
      
      // Apply tint if configured
      if (config.tintColor && config.tintOpacity && config.tintOpacity > 0) {
        const tintColorChroma = chroma(config.tintColor);
        const opacity = config.tintOpacity / 100;
        const blendMode = config.tintBlendMode || 'normal';
        
        // Apply the specified blending mode
        newColor = applyBlendMode(newColor, tintColorChroma, opacity, blendMode);
      }
      
      colors.push(newColor.hex());
    }
    
    return colors;
  } catch (error) {
    console.error('Error generating color ramp:', error);
    // Return a fallback grayscale ramp
    const fallbackColors: string[] = [];
    for (let i = 0; i < config.totalSteps; i++) {
      const lightness = (i / (config.totalSteps - 1)) * 0.8 + 0.1;
      fallbackColors.push(chroma.hsl(0, 0, lightness).hex());
    }
    return fallbackColors;
  }
};

export const exportToSvg = (colorRamps: ColorRampData[]): string => {
  const swatchSize = 60;
  const swatchGap = 4;
  const rampGap = 40;
  const labelHeight = 24;

  // Calculate dimensions for vertical layout
  const maxRampLength = Math.max(...colorRamps.map(ramp => ramp.colors.length));
  const totalWidth = colorRamps.length * (swatchSize + rampGap) - rampGap + 40; // 40 for padding
  const totalHeight = maxRampLength * (swatchSize + swatchGap) - swatchGap + labelHeight + 40; // 40 for padding

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .ramp-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; fill: #374151; }
      .color-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; fill: #6B7280; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
`;

  colorRamps.forEach((ramp, rampIndex) => {
    const rampX = 20 + rampIndex * (swatchSize + rampGap);
    // Add ramp label (centered above column)
    svgContent += `  <text x="${rampX + swatchSize / 2}" y="${labelHeight}" text-anchor="middle" class="ramp-label">${ramp.name}</text>\n`;

    // Add color swatches (stacked vertically)
    ramp.colors.forEach((color, colorIndex) => {
      const x = rampX;
      const y = labelHeight + 8 + colorIndex * (swatchSize + swatchGap);
      svgContent += `  <rect x="${x}" y="${y}" width="${swatchSize}" height="${swatchSize}" fill="${color}" rx="4"/>\n`;
    });
  });

  svgContent += '</svg>';
  return svgContent;
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
