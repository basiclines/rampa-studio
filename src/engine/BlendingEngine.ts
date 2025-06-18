import chroma from 'chroma-js';
import { BlendMode } from '@/entities/BlendModeEntity';

// Helper function to clamp values between 0 and 255
const clamp = (value: number): number => Math.max(0, Math.min(255, value));

// Helper function to apply blending modes
export const applyBlendMode = (
  baseColor: chroma.Color,
  tintColor: chroma.Color,
  opacity: number,
  blendMode: BlendMode
): chroma.Color => {
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