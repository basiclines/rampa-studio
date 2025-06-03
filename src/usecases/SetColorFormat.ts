import { useColorRampsStore } from './ColorRampsStore';

export function useSetColorFormat() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

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