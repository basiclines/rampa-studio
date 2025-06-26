import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';
import { useSelectColorRamp } from './SelectColorRamp';

export function removeColorRamp(
  colorRamps: ColorRampConfig[],
  id: string
): ColorRampConfig[] {
  return colorRamps.filter(ramp => ramp.id !== id);
}

export function useRemoveColorRamp() {
  const removeRamp = SaveColorRampState(removeColorRamp);
  const { selectedRampId, selectColorRamp } = useSelectColorRamp();

  return (id: string) => {
    removeRamp(id);
    
    if (selectedRampId === id) {
      selectColorRamp(null);
    }
  };
} 