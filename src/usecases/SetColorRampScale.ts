import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';

export function setColorRampScale(
  colorRamps: ColorRampConfig[],
  id: string,
  scaleType: string
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id
      ? { 
          ...ramp, 
          lightnessScaleType: scaleType,
          hueScaleType: scaleType,
          saturationScaleType: scaleType
        }
      : ramp
  );
}

export const useSetColorRampScale = () => SaveColorRampState(setColorRampScale); 