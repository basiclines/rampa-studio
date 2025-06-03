import { useSaveColorRamp } from './SaveColorRamp';

export function useEditColorRampName() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, name: string) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id ? { ...ramp, name } : ramp
      )
    );
  };
} 