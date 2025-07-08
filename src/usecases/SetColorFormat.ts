import { ColorRampConfig, ColorFormat } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';
import { convertColorFormat } from '@/engine/ColorEngine';

export function setColorFormat(
  colorRamps: ColorRampConfig[],
  id: string,
  newColorFormat: ColorFormat
): ColorRampConfig[] {
  return colorRamps.map(ramp => {
    if (ramp.id !== id) return ramp;
    
    const currentFormat = ramp.colorFormat;
    
    // If format is the same, no conversion needed
    if (currentFormat === newColorFormat) {
      return { ...ramp, colorFormat: newColorFormat };
    }
    
    // Convert baseColor to new format
    const convertedBaseColor = convertColorFormat(ramp.baseColor, currentFormat, newColorFormat);
    
    // Convert all swatch colors to new format
    const convertedSwatches = ramp.swatches.map(swatch => ({
      ...swatch,
      color: convertColorFormat(swatch.color, swatch.colorFormat, newColorFormat),
      colorFormat: newColorFormat
    }));
    
    // Convert tintColor if it exists
    const convertedTintColor = ramp.tintColor 
      ? convertColorFormat(ramp.tintColor, currentFormat, newColorFormat)
      : ramp.tintColor;
    
    return {
      ...ramp,
      baseColor: convertedBaseColor,
      colorFormat: newColorFormat,
      swatches: convertedSwatches,
      tintColor: convertedTintColor
    };
  });
}

export const useSetColorFormat = () => SaveColorRampState(setColorFormat); 