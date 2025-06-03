import { useColorRampsStore } from './ColorRampsStore';

export function useLockAllRampColors() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, colors: string[], lock: boolean) => {
    updateColorRamps(prev =>
      prev.map(ramp => {
        if (ramp.id !== id) return ramp;
        const newSwatches = ramp.swatches.map((swatch, i) => ({
          ...swatch,
          color: colors[i],
          locked: lock
        }));
        return { ...ramp, swatches: newSwatches };
      })
    );
  };
} 