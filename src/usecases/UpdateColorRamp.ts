import { ColorRampConfig } from '@/entities/ColorRamp';
import { useSaveColorRamp } from './SaveColorRamp';

export function useUpdateColorRamp() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, updates: Partial<ColorRampConfig>) => {
    updateColorRamps(prev => 
      prev.map(ramp => 
        ramp.id === id ? { ...ramp, ...updates } : ramp
      )
    );
  };
} 