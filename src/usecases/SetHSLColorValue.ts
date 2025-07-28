import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';
import { validateHSLValues } from '@/engine/ColorValidationEngine';

export interface SetHSLColorValueParams {
  id: string;
  hue: string;
  saturation: string;
  lightness: string;
  colorType: 'base' | 'tint';
}

export function setHSLColorValue(
  colorRamps: ColorRampConfig[], 
  { id, hue, saturation, lightness, colorType }: SetHSLColorValueParams
): ColorRampConfig[] {
  // Validate the HSL values
  const validation = validateHSLValues(hue, saturation, lightness);
  
  if (!validation.isValid || !validation.formattedColor) {
    // Return original ramps if validation fails
    console.error('Invalid HSL values:', validation.error);
    return colorRamps;
  }

  return colorRamps.map(ramp => {
    if (ramp.id !== id) return ramp;
    
    if (colorType === 'base') {
      return { ...ramp, baseColor: validation.formattedColor };
    } else if (colorType === 'tint') {
      return { ...ramp, tintColor: validation.formattedColor };
    }
    
    return ramp;
  });
}

export const useSetHSLColorValue = () => SaveColorRampState(setHSLColorValue); 