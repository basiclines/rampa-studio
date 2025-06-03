import { useSaveColorRamp } from './SaveColorRamp';
import { BlendMode } from '@/entities/BlendMode';

export function useSetTintBlendMode() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

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