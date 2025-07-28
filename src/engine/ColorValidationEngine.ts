import chroma from 'chroma-js';
import { convertToOklch, formatOklchString, parseOklchString, type OklchColor } from './OklchEngine';
import { ColorFormat } from '@/entities/ColorRampEntity';

// Validation result type
export interface ColorValidationResult {
  isValid: boolean;
  error?: string;
  formattedColor?: string;
}

// HEX validation
export function validateHexValue(hexValue: string): ColorValidationResult {
  try {
    // Remove any whitespace
    const cleanHex = hexValue.trim();
    
    // Check if it's a valid hex format (3 or 6 characters)
    const hexRegex = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/;
    
    if (!hexRegex.test(cleanHex)) {
      return {
        isValid: false,
        error: 'Invalid hex format. Use 3 or 6 characters (0-9, A-F)'
      };
    }
    
    // Convert to full hex format
    const fullHex = cleanHex.length === 3 
      ? cleanHex.split('').map(c => c + c).join('')
      : cleanHex;
    
    const formattedColor = `#${fullHex.toUpperCase()}`;
    
    // Validate with chroma.js
    try {
      chroma(formattedColor);
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid color value'
      };
    }
    
    return {
      isValid: true,
      formattedColor
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid hex color'
    };
  }
}

// HSL validation
export interface HSLValues {
  hue: number;
  saturation: number;
  lightness: number;
}

export function validateHSLValues(hue: string, saturation: string, lightness: string): ColorValidationResult {
  try {
    // Parse values
    const h = parseFloat(hue.trim());
    const s = parseFloat(saturation.trim());
    const l = parseFloat(lightness.trim());
    
    // Check if all values are numbers
    if (isNaN(h) || isNaN(s) || isNaN(l)) {
      return {
        isValid: false,
        error: 'All values must be numbers'
      };
    }
    
    // Validate ranges
    if (h < 0 || h > 360) {
      return {
        isValid: false,
        error: 'Hue must be between 0 and 360'
      };
    }
    
    if (s < 0 || s > 100) {
      return {
        isValid: false,
        error: 'Saturation must be between 0 and 100'
      };
    }
    
    if (l < 0 || l > 100) {
      return {
        isValid: false,
        error: 'Lightness must be between 0 and 100'
      };
    }
    
    // Create the HSL color string
    const formattedColor = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    
    // Validate with chroma.js
    try {
      chroma(formattedColor);
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid HSL color'
      };
    }
    
    return {
      isValid: true,
      formattedColor
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid HSL values'
    };
  }
}

// OKLCH validation
export interface OKLCHValues {
  lightness: number;
  chroma: number;
  hue: number;
}

export function validateOKLCHValues(lightness: string, chroma: string, hue: string): ColorValidationResult {
  try {
    // Parse values
    const l = parseFloat(lightness.trim());
    const c = parseFloat(chroma.trim());
    const h = parseFloat(hue.trim());
    
    // Check if all values are numbers
    if (isNaN(l) || isNaN(c) || isNaN(h)) {
      return {
        isValid: false,
        error: 'All values must be numbers'
      };
    }
    
    // Validate ranges
    if (l < 0 || l > 1) {
      return {
        isValid: false,
        error: 'Lightness must be between 0 and 1'
      };
    }
    
    if (c < 0 || c > 0.5) {
      return {
        isValid: false,
        error: 'Chroma must be between 0 and 0.5'
      };
    }
    
    if (h < 0 || h > 360) {
      return {
        isValid: false,
        error: 'Hue must be between 0 and 360'
      };
    }
    
    // Create the OKLCH color
    const oklchColor: OklchColor = {
      l,
      c,
      h,
      alpha: 1
    };
    
    const formattedColor = formatOklchString(oklchColor);
    
    return {
      isValid: true,
      formattedColor
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid OKLCH values'
    };
  }
}

// Parse existing color values for editing
export function parseColorForEditing(color: string, format: ColorFormat): {
  hex?: string;
  hsl?: HSLValues;
  oklch?: OKLCHValues;
} {
  try {
    switch (format) {
      case 'hex':
        // Remove # if present and convert to uppercase
        const hexValue = color.replace('#', '').toUpperCase();
        return { hex: hexValue };
      
      case 'hsl':
        const chromaColor = chroma(color);
        const [h, s, l] = chromaColor.hsl();
        return {
          hsl: {
            hue: Math.round(h || 0),
            saturation: Math.round((s || 0) * 100),
            lightness: Math.round((l || 0) * 100)
          }
        };
      
      case 'oklch':
        const oklchColor = color.startsWith('oklch(') 
          ? parseOklchString(color)
          : convertToOklch(color);
        
        if (oklchColor) {
          return {
            oklch: {
              lightness: parseFloat(oklchColor.l.toFixed(3)),
              chroma: parseFloat(oklchColor.c.toFixed(3)),
              hue: Math.round(oklchColor.h)
            }
          };
        }
        break;
    }
    
    return {};
  } catch (error) {
    console.error('Error parsing color for editing:', error);
    return {};
  }
}

// Input filtering functions
export function filterHexInput(value: string): string {
  // Only allow hexadecimal characters (0-9, A-F, a-f) and convert to uppercase
  return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 6);
}

export function filterNumericInput(value: string, allowDecimal: boolean = true): string {
  if (!allowDecimal) {
    // Only allow numbers for integer inputs
    return value.replace(/[^0-9]/g, '');
  }
  
  // For decimal inputs, allow numbers, dots, and commas
  let filtered = value.replace(/[^0-9.,]/g, '');
  
  // Replace comma with dot for decimal separator normalization
  filtered = filtered.replace(',', '.');
  
  // Ensure only one decimal point
  const parts = filtered.split('.');
  if (parts.length > 2) {
    filtered = parts[0] + '.' + parts.slice(1).join('');
  }
  
  return filtered;
} 