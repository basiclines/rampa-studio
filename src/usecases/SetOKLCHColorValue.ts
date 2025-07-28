import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';
import { validateOKLCHValues } from '@/engine/ColorValidationEngine';

export interface SetOKLCHColorValueParams {
  id: string;
  lightness: string;
  chroma: string;
  hue: string;
  colorType: 'base' | 'tint';
}

export function setOKLCHColorValue(
  colorRamps: ColorRampConfig[], 
  { id, lightness, chroma, hue, colorType }: SetOKLCHColorValueParams
): ColorRampConfig[] {
  // Validate the OKLCH values
  const validation = validateOKLCHValues(lightness, chroma, hue);
  
  if (!validation.isValid || !validation.formattedColor) {
    // Return original ramps if validation fails
    console.error('Invalid OKLCH values:', validation.error);
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

export const useSetOKLCHColorValue = () => SaveColorRampState(setOKLCHColorValue); 