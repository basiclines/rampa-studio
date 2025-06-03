import { useColorRampsStore } from './ColorRampsStore';
import { BlendMode } from '@/entities/BlendMode';

export function useSetTintBlendMode() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, tintBlendMode: BlendMode) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, tintBlendMode }
          : ramp
      )
    );
  };
} 