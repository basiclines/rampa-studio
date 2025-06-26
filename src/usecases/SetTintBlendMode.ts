import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';
import { BlendMode } from '@/entities/BlendModeEntity';

export function setTintBlendMode(
  colorRamps: ColorRampConfig[],
  id: string,
  tintBlendMode: BlendMode
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, tintBlendMode } : ramp
  );
}

export const useSetTintBlendMode = () => SaveColorRampState(setTintBlendMode); 