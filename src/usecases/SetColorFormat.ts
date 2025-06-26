import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setColorFormat(
  colorRamps: ColorRampConfig[],
  id: string,
  colorFormat: 'hex' | 'hsl'
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, colorFormat } : ramp
  );
}

export const useSetColorFormat = () => SaveColorRampState(setColorFormat); 