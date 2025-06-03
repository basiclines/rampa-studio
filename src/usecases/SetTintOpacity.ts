import { useColorRampsStore } from './ColorRampsStore';

export function useSetTintOpacity() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, tintOpacity: number) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, tintOpacity }
          : ramp
      )
    );
  };
} 