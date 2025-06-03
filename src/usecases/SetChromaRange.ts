import { useSaveColorRamp } from './SaveColorRamp';

export function useSetChromaRange() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, chromaRange: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, chromaRange }
          : ramp
      )
    );
  };
} 