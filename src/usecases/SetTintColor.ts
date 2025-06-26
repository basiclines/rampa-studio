import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setTintColor(
  colorRamps: ColorRampConfig[],
  id: string,
  tintColor: string
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, tintColor } : ramp
  );
}

export const useSetTintColor = () => SaveColorRampState(setTintColor); 