import { 
  useMode,
  modeOklch,
  modeRgb,
  formatHex, 
  formatRgb,
  parse,
  inGamut,
  toGamut,
  type Oklch,
  type Rgb
} from 'culori/fn';

// Create converters
const oklch = useMode(modeOklch);
const rgb = useMode(modeRgb);

/**
 * OKLCH color representation
 * L: Lightness (0-1, where 0 is black, 1 is white)
 * C: Chroma (0-0.4+, saturation/colorfulness)
 * H: Hue (0-360, degrees on color wheel)
 * alpha: Optional opacity (0-1)
 */
export interface OklchColor {
  l: number;    // 0-1 (lightness)
  c: number;    // 0-0.4+ (chroma) 
  h: number;    // 0-360 (hue)
  alpha?: number; // 0-1 (opacity)
}

/**
 * Centralized OKLCH rounding function for consistent precision across the app
 * 
 * **Use this for:**
 * - Display values (UI text, exports, user-facing strings)
 * - Final output formatting
 * - Reducing visual noise in the interface
 * 
 * **Precision:**
 * - L and C: 2 decimal places (0.68) - reduces visual noise
 * - H: Whole numbers (265) - sufficient for hue precision
 * - Alpha: 2 decimal places (0.85)
 * 
 * @param oklchColor - The OKLCH color to round
 * @returns Rounded OKLCH color optimized for display
 */
export function roundOklch(oklchColor: OklchColor): OklchColor {
  const { l, c, h, alpha } = oklchColor;
  
  return {
    l: Math.round(l * 100) / 100,      // 2 decimal places
    c: Math.round(c * 100) / 100,      // 2 decimal places  
    h: Math.round(h),                  // Whole numbers
    alpha: alpha !== undefined ? Math.round(alpha * 100) / 100 : alpha  // 2 decimal places
  };
}

/**
 * Higher precision rounding for internal calculations
 * 
 * **Use this for:**
 * - Intermediate calculations
 * - Gamut clamping operations
 * - Precision stabilization during transformations
 * - Internal state management
 * 
 * **Precision:**
 * - L and C: 3 decimal places (0.678) - better intermediate precision
 * - H: Whole numbers (265)
 * - Alpha: 3 decimal places (0.854)
 * 
 * @param oklchColor - The OKLCH color to round with higher precision
 * @returns Rounded OKLCH color optimized for calculations
 */
export function roundOklchPrecise(oklchColor: OklchColor): OklchColor {
  const { l, c, h, alpha } = oklchColor;
  
  return {
    l: Math.round(l * 1000) / 1000,    // 3 decimal places
    c: Math.round(c * 1000) / 1000,    // 3 decimal places  
    h: Math.round(h),                  // Whole numbers
    alpha: alpha !== undefined ? Math.round(alpha * 1000) / 1000 : alpha  // 3 decimal places
  };
}

/**
 * Convert any color string (hex, hsl, rgb, etc.) to OKLCH
 */
export function convertToOklch(color: string): OklchColor {
  try {
    const parsed = parse(color);
    if (!parsed) {
      throw new Error(`Invalid color: ${color}`);
    }
    
    const oklchColor = oklch(parsed);
    if (!oklchColor) {
      throw new Error(`Failed to convert to OKLCH: ${color}`);
    }

    return {
      l: oklchColor.l || 0,
      c: oklchColor.c || 0,
      h: oklchColor.h || 0,
      alpha: oklchColor.alpha
    };
  } catch (error) {
    console.error('Error converting to OKLCH:', error);
    // Return a safe fallback (middle gray)
    return { l: 0.5, c: 0, h: 0, alpha: 1 };
  }
}

/**
 * Convert OKLCH color to hex string
 */
export function convertFromOklch(oklchColor: OklchColor): string {
  try {
    const culoriOklch: Oklch = {
      mode: 'oklch',
      l: oklchColor.l,
      c: oklchColor.c,
      h: oklchColor.h,
      alpha: oklchColor.alpha
    };

    // Convert to RGB and then to hex for maximum compatibility
    const rgbColor = rgb(culoriOklch);
    if (!rgbColor) {
      throw new Error('Failed to convert OKLCH to RGB');
    }

    return formatHex(rgbColor);
  } catch (error) {
    console.error('Error converting from OKLCH:', error);
    // Return a safe fallback color
    return '#808080';
  }
}

/**
 * Format OKLCH color as CSS string
 */
export function formatOklchString(oklchColor: OklchColor): string {
  const rounded = roundOklch(oklchColor);
  const { l, c, h, alpha } = rounded;
  
  if (alpha !== undefined && alpha < 1) {
    return `oklch(${l} ${c} ${h} / ${alpha})`;
  }
  
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Validate if OKLCH values are within reasonable bounds
 */
export function isValidOklch(oklchColor: OklchColor): boolean {
  const { l, c, h, alpha } = oklchColor;
  
  return (
    typeof l === 'number' && l >= 0 && l <= 1 &&
    typeof c === 'number' && c >= 0 && c <= 1 && // Conservative upper bound
    typeof h === 'number' && h >= 0 && h <= 360 &&
    (alpha === undefined || (typeof alpha === 'number' && alpha >= 0 && alpha <= 1))
  );
}

/**
 * Check if OKLCH color is within sRGB gamut
 */
export function isInSrgbGamut(oklchColor: OklchColor): boolean {
  try {
    const culoriOklch: Oklch = {
      mode: 'oklch',
      l: oklchColor.l,
      c: oklchColor.c,
      h: oklchColor.h,
      alpha: oklchColor.alpha
    };

    return inGamut('rgb')(culoriOklch);
  } catch (error) {
    console.error('Error checking sRGB gamut:', error);
    return false;
  }
}

/**
 * Clamp OKLCH color to sRGB gamut
 */
export function clampOklchToSrgb(oklchColor: OklchColor): OklchColor {
  try {
    const culoriOklch: Oklch = {
      mode: 'oklch',
      l: oklchColor.l,
      c: oklchColor.c,
      h: oklchColor.h,
      alpha: oklchColor.alpha
    };

    const clamped = toGamut('rgb', 'oklch')(culoriOklch);
    if (!clamped) {
      throw new Error('Failed to clamp to sRGB gamut');
    }

    return {
      l: clamped.l || 0,
      c: clamped.c || 0,
      h: clamped.h || 0,
      alpha: clamped.alpha
    };
  } catch (error) {
    console.error('Error clamping to sRGB:', error);
    return oklchColor; // Return original if clamping fails
  }
}

/**
 * Get maximum chroma for given lightness and hue within sRGB gamut
 * This is key for dynamic UI constraints
 */
export function getMaxChromaForLH(l: number, h: number): number {
  // Binary search for maximum chroma at this L,H combination
  let minChroma = 0;
  let maxChroma = 0.5; // Conservative upper bound
  let iterations = 0;
  const maxIterations = 20;
  
  // First, find rough upper bound
  while (iterations < maxIterations) {
    const testColor: OklchColor = { l, c: maxChroma, h };
    
    if (isInSrgbGamut(testColor)) {
      minChroma = maxChroma;
      maxChroma *= 2;
    } else {
      break;
    }
    iterations++;
  }
  
  // Binary search for precise maximum
  iterations = 0;
  while (iterations < maxIterations && (maxChroma - minChroma) > 0.001) {
    const midChroma = (minChroma + maxChroma) / 2;
    const testColor: OklchColor = { l, c: midChroma, h };
    
    if (isInSrgbGamut(testColor)) {
      minChroma = midChroma;
    } else {
      maxChroma = midChroma;
    }
    iterations++;
  }
  
  return Math.max(0, minChroma);
}

/**
 * Smooth chroma clamping that preserves as much chroma as possible
 */
export function clampChromaSmooth(oklchColor: OklchColor): OklchColor {
  const maxChroma = getMaxChromaForLH(oklchColor.l, oklchColor.h);
  
  if (oklchColor.c > maxChroma) {
    return {
      ...oklchColor,
      c: maxChroma
    };
  }
  
  return oklchColor;
}

/**
 * Check if current chroma is at or near maximum for given L,H
 */
export function isChromaAtMax(l: number, c: number, h: number): boolean {
  const maxChroma = getMaxChromaForLH(l, h);
  return c >= maxChroma * 0.95; // Within 5% of maximum
}

/**
 * Constrain OKLCH values to valid ranges with smooth fallbacks
 */
export function constrainOklchValues(oklchColor: OklchColor, preserveLC: boolean = false): OklchColor {
  let { l, c, h, alpha } = oklchColor;
  
  // Constrain lightness
  l = Math.max(0, Math.min(1, l));
  
  // Constrain hue (wrap around)
  h = ((h % 360) + 360) % 360;
  
  // Constrain alpha
  if (alpha !== undefined) {
    alpha = Math.max(0, Math.min(1, alpha));
  }
  
  // If we're only changing hue and want to preserve L,C as much as possible
  if (preserveLC) {
    // Add precision stabilization to prevent floating-point drift
    const stabilized = roundOklchPrecise({ l, c, h, alpha });
    
    // Only clamp chroma, don't apply full gamut clamping which might affect lightness
    const maxChroma = getMaxChromaForLH(stabilized.l, stabilized.h);
    const clampedC = Math.min(stabilized.c, maxChroma);
    
    return { ...stabilized, c: clampedC };
  }
  
  // Apply smooth chroma clamping
  const smoothClamped = clampChromaSmooth({ l, c, h, alpha });
  
  return smoothClamped;
}

/**
 * Parse OKLCH string (e.g., "oklch(0.7 0.15 180)")
 */
export function parseOklchString(oklchString: string): OklchColor | null {
  try {
    const parsed = parse(oklchString);
    if (!parsed || parsed.mode !== 'oklch') {
      return null;
    }
    
    const oklchParsed = parsed as Oklch;
    return {
      l: oklchParsed.l || 0,
      c: oklchParsed.c || 0,
      h: oklchParsed.h || 0,
      alpha: oklchParsed.alpha
    };
  } catch (error) {
    console.error('Error parsing OKLCH string:', error);
    return null;
  }
}