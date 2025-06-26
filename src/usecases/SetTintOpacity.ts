import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setTintOpacity(
  colorRamps: ColorRampConfig[],
  id: string,
  tintOpacity: number
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, tintOpacity } : ramp
  );
}

export const useSetTintOpacity = () => SaveColorRampState(setTintOpacity); 