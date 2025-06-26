import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function duplicateColorRamp(
  colorRamps: ColorRampConfig[],
  ramp: ColorRampConfig
): ColorRampConfig[] {
  const duplicatedRamp: ColorRampConfig = {
    ...ramp,
    id: Date.now().toString(),
    name: `${ramp.name} Copy`,
  };
  
  return [...colorRamps, duplicatedRamp];
}

export const useDuplicateColorRamp = () => SaveColorRampState(duplicateColorRamp); 