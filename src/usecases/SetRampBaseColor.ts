import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { useSaveColorRamp } from './SaveColorRamp';

export function setRampBaseColor(
  colorRamps: ColorRampConfig[], 
  id: string, 
  baseColor: string
): ColorRampConfig[] {
  return colorRamps.map(ramp =>
    ramp.id === id ? { ...ramp, baseColor } : ramp
  );
}

export function useSetRampBaseColor() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, baseColor: string) => {
    updateColorRamps(prev => setRampBaseColor(prev, id, baseColor));
  };
} 