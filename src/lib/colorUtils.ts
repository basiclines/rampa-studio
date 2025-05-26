import chroma from 'chroma-js';

interface ColorRampConfig {
  id: string;
  name: string;
  baseColor: string;
  totalSteps: number;
  lightnessRange: number;
  chromaRange: number;
  saturationRange: number;
  lockedColors: { [index: number]: string };
}

interface ColorRampData {
  name: string;
  colors: string[];
}

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
    
    // Calculate step sizes
    const lightnessStep = (config.lightnessRange / 100) / (config.totalSteps - 1);
    const hueStep = config.chromaRange / (config.totalSteps - 1);
    const saturationStep = (config.saturationRange / 100) / (config.totalSteps - 1);
    
    // Generate colors from darkest to lightest
    for (let i = 0; i < config.totalSteps; i++) {
      // Check if this color index is locked
      if (config.lockedColors && config.lockedColors[i]) {
        colors.push(config.lockedColors[i]);
        continue;
      }
      
      const position = i - middleIndex;
      
      // Calculate adjustments based on position
      const lightnessAdjustment = position * lightnessStep;
      const hueAdjustment = position * hueStep;
      const saturationAdjustment = Math.abs(position) * saturationStep;
      
      // Apply adjustments
      let newLightness = baseLightness + lightnessAdjustment;
      let newHue = (baseHue + hueAdjustment) % 360;
      if (newHue < 0) newHue += 360;
      let newSaturation = baseSaturation - saturationAdjustment;
      
      // Clamp values to valid ranges
      newLightness = Math.max(0.05, Math.min(0.95, newLightness));
      newSaturation = Math.max(0.1, Math.min(1, newSaturation));
      
      // Create the new color
      const newColor = chroma.hsl(newHue, newSaturation, newLightness);
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
