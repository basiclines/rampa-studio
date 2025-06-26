import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setChromaGradient(
  colorRamps: ColorRampConfig[],
  id: string,
  chromaStart: number,
  chromaEnd: number
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, chromaStart, chromaEnd } : ramp
  );
}

export const useSetChromaGradient = () => SaveColorRampState(setChromaGradient); 