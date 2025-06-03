import { useColorRampsStore } from './ColorRampsStore';

export function useSetTotalSteps() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

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