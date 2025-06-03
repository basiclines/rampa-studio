import { ColorRampConfig } from '@/entities/ColorRamp';
import { useColorRampsStore } from './ColorRampsStore';

export function useUpdateColorRamp() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, updates: Partial<ColorRampConfig>) => {
    updateColorRamps(prev => 
      prev.map(ramp => 
        ramp.id === id ? { ...ramp, ...updates } : ramp
      )
    );
  };
} 