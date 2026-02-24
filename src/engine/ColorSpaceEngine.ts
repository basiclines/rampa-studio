import { convertToOklch, convertFromOklch, constrainOklchValues, type OklchColor } from './OklchEngine';
import chroma from 'chroma-js';

export type InterpolationMode = 'oklch' | 'lab' | 'rgb';

/**
 * Mix two colors at ratio t using the specified interpolation mode.
 */
export function mixWithMode(
  color1: string,
  color2: string,
  t: number,
  mode: InterpolationMode = 'oklch'
): string {
  if (mode === 'oklch') {
    return mixOklch(color1, color2, t);
  }
  // chroma-js handles lab and rgb interpolation
  return chroma.mix(color1, color2, t, mode).hex();
}

/**
 * OKLCH mixing with shortest-arc hue interpolation.
 * Extracted from src/usecases/MixColors.ts for reuse.
 */
function mixOklch(color1: string, color2: string, t: number): string {
  const oklch1 = convertToOklch(color1);
  const oklch2 = convertToOklch(color2);

  let h1 = oklch1.h;
  let h2 = oklch2.h;
  let hueDiff = h2 - h1;
  if (hueDiff > 180) hueDiff -= 360;
  if (hueDiff < -180) hueDiff += 360;
  let h = h1 + t * hueDiff;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;

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

/**
 * Generate a linear color ramp between two colors.
 *
 * @param from - Start color (any CSS color string)
 * @param to - End color (any CSS color string)
 * @param steps - Number of colors to generate
 * @param mode - Interpolation mode (default: 'oklch')
 * @returns Array of hex color strings
 */
export function generateLinearSpace(
  from: string,
  to: string,
  steps: number,
  mode: InterpolationMode = 'oklch'
): string[] {
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0.5 : i / (steps - 1);
    colors.push(mixWithMode(from, to, t, mode));
  }
  return colors;
}

/**
 * Generate a 3D color cube via trilinear interpolation between 8 corners.
 *
 * Corners are ordered by binary position:
 *   [0] = (0,0,0)  origin
 *   [1] = (1,0,0)  x
 *   [2] = (0,1,0)  y
 *   [3] = (0,0,1)  z
 *   [4] = (1,1,0)  xy
 *   [5] = (1,0,1)  xz
 *   [6] = (0,1,1)  yz
 *   [7] = (1,1,1)  xyz
 *
 * @param corners - 8 corner colors in the order above
 * @param stepsPerAxis - Number of steps along each axis
 * @param mode - Interpolation mode (default: 'oklch')
 * @returns Array of hex colors, length = stepsPerAxis³
 */
export function generateCubeSpace(
  corners: [string, string, string, string, string, string, string, string],
  stepsPerAxis: number,
  mode: InterpolationMode = 'oklch'
): string[] {
  const [origin, x, y, z, xy, xz, yz, xyz] = corners;
  const mix = (a: string, b: string, t: number) => mixWithMode(a, b, t, mode);
  const max = stepsPerAxis - 1;
  const colors: string[] = [];

  for (let xi = 0; xi < stepsPerAxis; xi++) {
    const tx = max === 0 ? 0 : xi / max;
    // Interpolate 4 edges along x axis
    const c_x0y0 = mix(origin, x, tx);
    const c_x0y1 = mix(y, xy, tx);
    const c_x1y0 = mix(z, xz, tx);
    const c_x1y1 = mix(yz, xyz, tx);

    for (let yi = 0; yi < stepsPerAxis; yi++) {
      const ty = max === 0 ? 0 : yi / max;
      // Interpolate 2 edges along y axis
      const c_z0 = mix(c_x0y0, c_x0y1, ty);
      const c_z1 = mix(c_x1y0, c_x1y1, ty);

      for (let zi = 0; zi < stepsPerAxis; zi++) {
        const tz = max === 0 ? 0 : zi / max;
        // Interpolate along z axis
        colors.push(mix(c_z0, c_z1, tz));
      }
    }
  }

  return colors;
}

/**
 * Generate a 2D color plane via bilinear interpolation.
 *
 * The plane has 4 corners:
 *   (0,0) = dark    (bottom-left)   — origin
 *   (1,0) = dark    (bottom-right)  — saturation has no effect at lightness=0
 *   (0,1) = light   (top-left)      — achromatic light
 *   (1,1) = hue     (top-right)     — full saturation + full lightness
 *
 * X axis = saturation (0 → achromatic, max → chromatic)
 * Y axis = lightness  (0 → dark anchor, max → light/hue)
 *
 * At Y=0 the entire row converges to the dark anchor.
 *
 * @param dark - Dark anchor color (any CSS color string)
 * @param light - Light anchor color (any CSS color string)
 * @param hue - Chromatic hue color (any CSS color string)
 * @param stepsPerAxis - Number of steps along each axis
 * @param mode - Interpolation mode (default: 'oklch')
 * @returns Array of hex colors, length = stepsPerAxis²
 */
export function generatePlaneSpace(
  dark: string,
  light: string,
  hue: string,
  stepsPerAxis: number,
  mode: InterpolationMode = 'oklch'
): string[] {
  const mix = (a: string, b: string, t: number) => mixWithMode(a, b, t, mode);
  const max = stepsPerAxis - 1;
  const colors: string[] = [];

  for (let xi = 0; xi < stepsPerAxis; xi++) {
    const tx = max === 0 ? 0 : xi / max; // saturation
    // Bottom edge (Y=0): always dark anchor
    const bottom = dark;
    // Top edge (Y=1): light → hue
    const top = mix(light, hue, tx);

    for (let yi = 0; yi < stepsPerAxis; yi++) {
      const ty = max === 0 ? 0 : yi / max; // lightness
      colors.push(mix(bottom, top, ty));
    }
  }

  return colors;
}
