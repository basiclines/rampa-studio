import { useSaveColorRamp } from './SaveColorRamp';

export function useSetChromaGradient() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, chromaStart: number, chromaEnd: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, chromaStart, chromaEnd }
          : ramp
      )
    );
  };
} 