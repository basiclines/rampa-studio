import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { useSaveColorRamp } from './SaveColorRamp';
import { ColorSwatch } from '@/entities/ColorSwatchEntity';
import { DEFAULT_NEW_RAMP_VALUES } from '@/config/DefaultColorRampValues';

export function useAddColorRamp() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    const totalSteps = DEFAULT_NEW_RAMP_VALUES.totalSteps;
    const baseColor = DEFAULT_NEW_RAMP_VALUES.baseColor;
    const swatches: ColorSwatch[] = Array.from({ length: totalSteps }, (_, i) => ({
      color: baseColor,
      index: i,
      locked: false
    }));
    const newRamp: ColorRampConfig = {
      id: Date.now().toString(),
      name: `Ramp ${colorRamps.length + 1}`,
      baseColor,
      totalSteps,
      lightnessRange: DEFAULT_NEW_RAMP_VALUES.lightnessRange,
      chromaRange: DEFAULT_NEW_RAMP_VALUES.chromaRange,
      saturationRange: DEFAULT_NEW_RAMP_VALUES.saturationRange,
      swatches,
    };
    updateColorRamps(prev => [...prev, newRamp]);
  };
} 