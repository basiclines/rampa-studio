import { useSaveColorRamp } from './SaveColorRamp';

export function useSetRampBaseColor() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, baseColor: string) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id ? { ...ramp, baseColor } : ramp
      )
    );
  };
} 