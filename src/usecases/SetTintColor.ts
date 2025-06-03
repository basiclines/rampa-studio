import { useSaveColorRamp } from './SaveColorRamp';

export function useSetTintColor() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, tintColor: string) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, tintColor }
          : ramp
      )
    );
  };
} 