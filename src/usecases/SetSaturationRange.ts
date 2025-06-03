import { useSaveColorRamp } from './SaveColorRamp';

export function useSetSaturationRange() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, saturationRange: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, saturationRange }
          : ramp
      )
    );
  };
} 