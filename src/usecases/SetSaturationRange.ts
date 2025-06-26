import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setSaturationRange(
  colorRamps: ColorRampConfig[],
  id: string,
  saturationRange: number
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, saturationRange } : ramp
  );
}

export const useSetSaturationRange = () => SaveColorRampState(setSaturationRange); 