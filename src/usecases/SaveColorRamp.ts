import { create } from 'zustand';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { ColorSwatch } from '@/entities/ColorSwatchEntity';
import { DEFAULT_COLOR_RAMP_VALUES } from '@/config/DefaultColorRampValues';

interface State {
  colorRamps: ColorRampConfig[];
}

interface Actions {
  setColorRamps: (ramps: ColorRampConfig[]) => void;
  updateColorRamps: (updater: (ramps: ColorRampConfig[]) => ColorRampConfig[]) => void;
}

export const useSaveColorRamp = create<State & Actions>((set) => ({
  colorRamps: [
    {
      id: '1',
      name: 'Primary',
      baseColor: DEFAULT_COLOR_RAMP_VALUES.baseColor,
      totalSteps: DEFAULT_COLOR_RAMP_VALUES.totalSteps,
      lightnessRange: DEFAULT_COLOR_RAMP_VALUES.lightnessRange,
      lightnessAdvanced: DEFAULT_COLOR_RAMP_VALUES.lightnessAdvanced,
      chromaRange: DEFAULT_COLOR_RAMP_VALUES.chromaRange,
      chromaAdvanced: DEFAULT_COLOR_RAMP_VALUES.chromaAdvanced,
      saturationRange: DEFAULT_COLOR_RAMP_VALUES.saturationRange,
      saturationAdvanced: DEFAULT_COLOR_RAMP_VALUES.saturationAdvanced,
      swatches: Array.from({ length: DEFAULT_COLOR_RAMP_VALUES.totalSteps }, (_, i): ColorSwatch => ({
        color: DEFAULT_COLOR_RAMP_VALUES.baseColor,
        index: i,
        locked: false,
      })),
    },
  ],
  setColorRamps: (ramps) => set({ colorRamps: ramps }),
  updateColorRamps: (updater) => set((state) => ({ colorRamps: updater(state.colorRamps) })),
})); 