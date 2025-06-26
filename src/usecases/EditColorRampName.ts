import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function editColorRampName(
  colorRamps: ColorRampConfig[],
  id: string,
  name: string
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, name } : ramp
  );
}

export const useEditColorRampName = () => SaveColorRampState(editColorRampName); 