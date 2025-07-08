import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

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
        ? { ...swatch, color, colorFormat: ramp.colorFormat, locked: !swatch.locked }
        : swatch
    );
    return { ...ramp, swatches: newSwatches };
  });
}

export const useLockRampColor = () => SaveColorRampState(lockRampColor); 