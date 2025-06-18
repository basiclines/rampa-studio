import { ColorRampConfig } from '@/entities/ColorRampEntity';
import chroma from 'chroma-js';

interface ColorRampData {
  name: string;
  colors: string[];
}

export class ExportEngine {
  /**
   * Export color ramps to SVG format
   */
  static exportToSvg(colorRamps: ColorRampData[]): string {
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
  }

  /**
   * Export complete color ramp state to JSON format
   */
  static exportToJson(colorRamps: ColorRampConfig[]): string {
    return JSON.stringify(colorRamps, null, 2);
  }

  /**
   * Convert ColorRampConfig array to ColorRampData array
   */
  static prepareColorRampsForExport(configs: ColorRampConfig[]): ColorRampData[] {
    return configs.map(config => ({
      name: config.name,
      colors: config.swatches.map(swatch => swatch.color)
    }));
  }

  /**
   * Formats a color string as either hex or HSL (rounded values).
   * @param color - The color string (hex or any chroma-js compatible input)
   * @param format - 'hex' or 'hsl'
   * @returns Formatted color string
   */
  static formatColorValues(color: string, format: 'hex' | 'hsl'): string {
    if (format === 'hsl') {
      const hsl = chroma(color).hsl().slice(0, 3);
      const h = isNaN(hsl[0]) ? 0 : Math.round(hsl[0]);
      const s = Math.round(hsl[1] * 100);
      const l = Math.round(hsl[2] * 100);
      return `${h}, ${s}, ${l}`;
    }
    return color;
  }
} 