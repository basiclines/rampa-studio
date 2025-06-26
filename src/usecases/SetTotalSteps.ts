import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setTotalSteps(
  colorRamps: ColorRampConfig[], 
  id: string, 
  totalSteps: number
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, totalSteps } : ramp
  );
}

export const useSetTotalSteps = () => SaveColorRampState(setTotalSteps); 