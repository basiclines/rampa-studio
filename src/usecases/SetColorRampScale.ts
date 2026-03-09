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
          lightnessDistributionType: scaleType,
          hueDistributionType: scaleType,
          saturationDistributionType: scaleType
        }
      : ramp
  );
}

export const useSetColorRampScale = () => SaveColorRampState(setColorRampScale); 