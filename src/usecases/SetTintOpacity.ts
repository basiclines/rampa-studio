import { useSaveColorRamp } from './SaveColorRamp';

export function useSetTintOpacity() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, tintOpacity: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, tintOpacity }
          : ramp
      )
    );
  };
} 