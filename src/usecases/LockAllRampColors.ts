import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { useSaveColorRamp } from './SaveColorRamp';


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
      locked: lock
    }));
    return { ...ramp, swatches: newSwatches };
  });
}


export function useLockAllRampColors() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, colors: string[], lock: boolean) => {
    updateColorRamps(prev => lockAllRampColors(prev, id, colors, lock));
  };
} 