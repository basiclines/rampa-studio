import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setChromaRange(
  colorRamps: ColorRampConfig[],
  id: string,
  chromaRange: number
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, chromaRange } : ramp
  );
}

export const useSetChromaRange = () => SaveColorRampState(setChromaRange); 