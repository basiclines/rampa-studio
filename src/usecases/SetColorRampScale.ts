import { useColorRampsStore } from './ColorRampsStore';

export function useSetColorRampScale() {
  const updateColorRamps = useColorRampsStore(state => state.updateColorRamps);

  return (id: string, scaleType: string) => {
    updateColorRamps(prev =>
      prev.map(ramp =>
        ramp.id === id
          ? { 
              ...ramp, 
              lightnessScaleType: scaleType,
              hueScaleType: scaleType,
              saturationScaleType: scaleType
            }
          : ramp
      )
    );
  };
} 