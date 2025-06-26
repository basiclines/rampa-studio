import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setSaturationGradient(
  colorRamps: ColorRampConfig[],
  id: string,
  saturationStart: number,
  saturationEnd: number
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, saturationStart, saturationEnd } : ramp
  );
}

export const useSetSaturationGradient = () => SaveColorRampState(setSaturationGradient); 