import { useSaveColorRamp } from './SaveColorRamp';

export function useSetColorFormat() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (id: string, colorFormat: 'hex' | 'hsl') => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, colorFormat }
          : ramp
      )
    );
  };
} 