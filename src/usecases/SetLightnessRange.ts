import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setLightnessRange(
  colorRamps: ColorRampConfig[],
  id: string,
  lightnessRange: number
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, lightnessRange } : ramp
  );
}

export const useSetLightnessRange = () => SaveColorRampState(setLightnessRange); 