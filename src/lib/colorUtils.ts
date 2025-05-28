import chroma from 'chroma-js';
import { ColorRampConfig } from '@/types/colorRamp';

interface ColorRampData {
  name: string;
  colors: string[];
}

// Helper function to clamp values between 0 and 255
const clamp = (value: number): number => Math.max(0, Math.min(255, value));

// Helper function to apply blending modes
const applyBlendMode = (baseColor: chroma.Color, tintColor: chroma.Color, opacity: number, blendMode: string): chroma.Color => {
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
    
    // Generate colors from darkest to lightest
    for (let i = 0; i < config.totalSteps; i++) {
      // Check if this color index is locked
      if (config.lockedColors && config.lockedColors[i]) {
        colors.push(config.lockedColors[i]);
        continue;
      }
      
      const position = i / (config.totalSteps - 1); // 0 to 1
      
      let newLightness: number;
      let newHue: number;
      let newSaturation: number;
      
      // Calculate lightness
      if (config.lightnessAdvanced && config.lightnessStart !== undefined && config.lightnessEnd !== undefined) {
        // Convert percentage values to 0-1 range
        const startLightness = config.lightnessStart / 100;
        const endLightness = config.lightnessEnd / 100;
        newLightness = startLightness + (endLightness - startLightness) * position;
      } else {
        const lightnessStep = (config.lightnessRange / 100) / (config.totalSteps - 1);
        const positionFromMiddle = i - middleIndex;
        const lightnessAdjustment = positionFromMiddle * lightnessStep;
        newLightness = baseLightness + lightnessAdjustment;
      }
      
      // Calculate hue
      if (config.chromaAdvanced && config.chromaStart !== undefined && config.chromaEnd !== undefined) {
        const hueRange = config.chromaEnd - config.chromaStart;
        newHue = (baseHue + config.chromaStart + hueRange * position) % 360;
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
        const invertedPosition = 1 - position;
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
  
  // Calculate dimensions
  const maxRampLength = Math.max(...colorRamps.map(ramp => ramp.colors.length));
  const totalWidth = maxRampLength * (swatchSize + swatchGap) - swatchGap + 40; // 40 for padding
  const totalHeight = colorRamps.length * (swatchSize + labelHeight + rampGap) - rampGap + 40; // 40 for padding
  
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
    const rampY = 20 + rampIndex * (swatchSize + labelHeight + rampGap);
    
    // Add ramp label
    svgContent += `  <text x="20" y="${rampY + 18}" class="ramp-label">${ramp.name}</text>\n`;
    
    // Add color swatches
    ramp.colors.forEach((color, colorIndex) => {
      const x = 20 + colorIndex * (swatchSize + swatchGap);
      const y = rampY + labelHeight + 4;
      
      svgContent += `  <rect x="${x}" y="${y}" width="${swatchSize}" height="${swatchSize}" fill="${color}" rx="4"/>\n`;
      svgContent += `  <text x="${x + swatchSize / 2}" y="${y + swatchSize + 14}" text-anchor="middle" class="color-label">${color}</text>\n`;
    });
  });
  
  svgContent += '</svg>';
  return svgContent;
};
