import { ColorRampConfig } from '@/entities/ColorRamp';
import { useColorRampsStore } from './ColorRampsStore';

export function useDuplicateColorRamp() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (ramp: ColorRampConfig) => {
    const duplicatedRamp: ColorRampConfig = {
      ...ramp,
      id: Date.now().toString(),
      name: `${ramp.name} Copy`,
    };
    
    updateColorRamps(prev => [...prev, duplicatedRamp]);
  };
} 