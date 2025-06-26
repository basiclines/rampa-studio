import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function updateColorRamp(
  colorRamps: ColorRampConfig[],
  id: string,
  updates: Partial<ColorRampConfig>
): ColorRampConfig[] {
  return colorRamps.map(ramp => 
    ramp.id === id ? { ...ramp, ...updates } : ramp
  );
}

export const useUpdateColorRamp = () => SaveColorRampState(updateColorRamp); 