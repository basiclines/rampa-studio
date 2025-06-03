import { useColorRampsStore } from './ColorRampsStore';

export function useSetTintColor() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, tintColor: string) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { ...ramp, tintColor }
          : ramp
      )
    );
  };
} 