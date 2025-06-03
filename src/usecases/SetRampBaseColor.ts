import { useColorRampsStore } from './ColorRampsStore';

export function useSetRampBaseColor() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, baseColor: string) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id ? { ...ramp, baseColor } : ramp
      )
    );
  };
} 