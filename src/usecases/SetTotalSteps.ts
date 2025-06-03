import { useSaveColorRamp } from './SaveColorRamp';

export function useSetTotalSteps() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, totalSteps: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, totalSteps }
          : ramp
      )
    );
  };
} 