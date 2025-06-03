import { useSaveColorRamp } from './SaveColorRamp';

export function useSetColorRampScale() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

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