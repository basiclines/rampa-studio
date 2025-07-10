import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState, useSaveColorRamp } from '@/state/SaveColorRampState';
import { ColorSwatch } from '@/entities/ColorSwatchEntity';
import { DEFAULT_NEW_RAMP_VALUES } from '@/config/DefaultColorRampValues';

export function addColorRamp(
  colorRamps: ColorRampConfig[]
): ColorRampConfig[] {
  const totalSteps = DEFAULT_NEW_RAMP_VALUES.totalSteps;
  const baseColor = DEFAULT_NEW_RAMP_VALUES.baseColor;
  const colorFormat = DEFAULT_NEW_RAMP_VALUES.colorFormat;
  const swatches: ColorSwatch[] = Array.from({ length: totalSteps }, (_, i) => ({
    color: baseColor,
    colorFormat: colorFormat,
    index: i,
    locked: false
  }));
  const newRamp: ColorRampConfig = {
    id: Date.now().toString(),
    name: `Ramp ${colorRamps.length + 1}`,
    baseColor,
    colorFormat,
    totalSteps,
    lightnessStart: DEFAULT_NEW_RAMP_VALUES.lightnessStart,
    lightnessEnd: DEFAULT_NEW_RAMP_VALUES.lightnessEnd,
    chromaStart: DEFAULT_NEW_RAMP_VALUES.chromaStart,
    chromaEnd: DEFAULT_NEW_RAMP_VALUES.chromaEnd,
    saturationStart: DEFAULT_NEW_RAMP_VALUES.saturationStart,
    saturationEnd: DEFAULT_NEW_RAMP_VALUES.saturationEnd,
    swatches,
  };
  return [...colorRamps, newRamp];
}

export function useAddColorRamp() {
  const addRamp = SaveColorRampState(addColorRamp);
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    addRamp();
  };
} 