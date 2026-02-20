import { convertToOklch, convertFromOklch, constrainOklchValues, type OklchColor } from '@/engine/OklchEngine';

/**
 * Mix two colors in OKLCH space at a given ratio.
 *
 * OKLCH interpolation produces perceptually uniform transitions:
 * lightness steps look even, hues travel the color wheel naturally,
 * and chroma stays vivid instead of dipping through gray.
 *
 * @param color1 - Start color (any CSS color string)
 * @param color2 - End color (any CSS color string)
 * @param t - Mix ratio from 0 (100% color1) to 1 (100% color2)
 * @returns Hex color string
 */
export function mixColors(color1: string, color2: string, t: number): string {
  const oklch1 = convertToOklch(color1);
  const oklch2 = convertToOklch(color2);

  // Interpolate hue along the shortest arc
  let h1 = oklch1.h;
  let h2 = oklch2.h;
  let hueDiff = h2 - h1;
  if (hueDiff > 180) hueDiff -= 360;
  if (hueDiff < -180) hueDiff += 360;
  let h = h1 + t * hueDiff;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;

  // Handle achromatic colors (chroma ≈ 0): skip hue interpolation
  if (oklch1.c < 0.002 && oklch2.c < 0.002) {
    h = 0;
  } else if (oklch1.c < 0.002) {
    h = oklch2.h;
  } else if (oklch2.c < 0.002) {
    h = oklch1.h;
  }

  const mixed: OklchColor = {
    l: oklch1.l + t * (oklch2.l - oklch1.l),
    c: oklch1.c + t * (oklch2.c - oklch1.c),
    h,
  };

  const constrained = constrainOklchValues(mixed);
  return convertFromOklch(constrained);
}
