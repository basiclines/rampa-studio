import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { useSaveColorRamp } from './SaveColorRamp';

export function useDuplicateColorRamp() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (ramp: ColorRampConfig) => {
    const duplicatedRamp: ColorRampConfig = {
      ...ramp,
      id: Date.now().toString(),
      name: `${ramp.name} Copy`,
    };
    
    updateColorRamps(prev => [...prev, duplicatedRamp]);
  };
} 