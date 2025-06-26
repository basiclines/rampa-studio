import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setRampBaseColor(
  colorRamps: ColorRampConfig[], 
  id: string, 
  baseColor: string
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, baseColor } : ramp
  );
}

export const useSetRampBaseColor = () => SaveColorRampState(setRampBaseColor); 