import { useSaveColorRamp } from './SaveColorRamp';

export function useSetLightnessRange() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, lightnessRange: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, lightnessRange }
          : ramp
      )
    );
  };
} 