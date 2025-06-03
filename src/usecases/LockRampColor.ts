import { useColorRampsStore } from './ColorRampsStore';

export function useLockRampColor() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, colorIndex: number, color: string) => {
    updateColorRamps(prev =>
      prev.map(ramp => {
        if (ramp.id !== id) return ramp;
        const newSwatches = ramp.swatches.map((swatch, i) =>
          i === colorIndex
            ? { ...swatch, color, locked: !swatch.locked }
            : swatch
        );
        return { ...ramp, swatches: newSwatches };
      })
    );
  };
} 