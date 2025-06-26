import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { useSaveColorRamp } from './SaveColorRamp';


export function lockRampColor(
  colorRamps: ColorRampConfig[], 
  id: string, 
  colorIndex: number, 
  color: string
): ColorRampConfig[] {
  return colorRamps.map(ramp => {
    if (ramp.id !== id) return ramp;
    const newSwatches = ramp.swatches.map((swatch, i) =>
      i === colorIndex
        ? { ...swatch, color, locked: !swatch.locked }
        : swatch
    );
    return { ...ramp, swatches: newSwatches };
  });
}

export function useLockRampColor() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, colorIndex: number, color: string) => {
    updateColorRamps(prev => lockRampColor(prev, id, colorIndex, color));
  };
} 