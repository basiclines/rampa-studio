import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setLightnessGradient(
  colorRamps: ColorRampConfig[],
  id: string,
  lightnessStart: number,
  lightnessEnd: number
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, lightnessStart, lightnessEnd } : ramp
  );
}

export const useSetLightnessGradient = () => SaveColorRampState(setLightnessGradient); 