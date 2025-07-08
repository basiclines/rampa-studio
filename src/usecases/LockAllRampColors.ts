import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function lockAllRampColors(
  colorRamps: ColorRampConfig[], 
  id: string, 
  colors: string[], 
  lock: boolean
): ColorRampConfig[] {
  return colorRamps.map(ramp => {
    if (ramp.id !== id) return ramp;
    const newSwatches = ramp.swatches.map((swatch, i) => ({
      ...swatch,
      color: colors[i],
      colorFormat: ramp.colorFormat,
      locked: lock
    }));
    return { ...ramp, swatches: newSwatches };
  });
}

export const useLockAllRampColors = () => SaveColorRampState(lockAllRampColors); 