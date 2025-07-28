import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';
import { validateHexValue } from '@/engine/ColorValidationEngine';

export interface SetHEXColorValueParams {
  id: string;
  hexValue: string;
  colorType: 'base' | 'tint';
}

export function setHEXColorValue(
  colorRamps: ColorRampConfig[], 
  { id, hexValue, colorType }: SetHEXColorValueParams
): ColorRampConfig[] {
  // Validate the hex value
  const validation = validateHexValue(hexValue);
  
  if (!validation.isValid || !validation.formattedColor) {
    // Return original ramps if validation fails
    // In a real implementation, you might want to throw an error or handle this differently
    console.error('Invalid hex value:', validation.error);
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

export const useSetHEXColorValue = () => SaveColorRampState(setHEXColorValue); 