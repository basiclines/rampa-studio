import { useSaveColorRamp } from './SaveColorRamp';

export function useSetLightnessGradient() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, lightnessStart: number, lightnessEnd: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, lightnessStart, lightnessEnd }
          : ramp
      )
    );
  };
} 