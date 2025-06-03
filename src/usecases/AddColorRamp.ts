import { ColorRampConfig } from '@/entities/ColorRamp';
import { useSaveColorRamp } from './SaveColorRamp';
import { ColorSwatch } from '@/entities/ColorSwatch';

export function useAddColorRamp() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    const totalSteps = 10;
    const baseColor = '#6366f1';
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
      lightnessRange: 80,
      chromaRange: 60,
      saturationRange: 40,
      swatches,
    };
    updateColorRamps(prev => [...prev, newRamp]);
  };
} 