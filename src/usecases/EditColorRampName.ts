import { useColorRampsStore } from './ColorRampsStore';

export function useEditColorRampName() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, name: string) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id ? { ...ramp, name } : ramp
      )
    );
  };
} 