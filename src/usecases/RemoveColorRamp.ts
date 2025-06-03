import { useColorRampsStore } from './ColorRampsStore';
import { useSelectColorRamp } from './SelectColorRamp';

export function useRemoveColorRamp() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);
  const { selectedRampId, selectColorRamp } = useSelectColorRamp();

  return (id: string) => {
    updateColorRamps(prev => prev.filter(ramp => ramp.id !== id));
    
    if (selectedRampId === id) {
      selectColorRamp(null);
    }
  };
} 