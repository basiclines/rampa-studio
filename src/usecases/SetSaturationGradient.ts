import { useSaveColorRamp } from './SaveColorRamp';

export function useSetSaturationGradient() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, saturationStart: number, saturationEnd: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, saturationStart, saturationEnd }
          : ramp
      )
    );
  };
} 