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

const useSaveApplicationState = create<State & Actions>((set) => ({
  colorRamps: [
    {
      id: '1',
      name: 'Primary',
      baseColor: DEFAULT_COLOR_RAMP_VALUES.baseColor,
      colorFormat: DEFAULT_COLOR_RAMP_VALUES.colorFormat,
      totalSteps: DEFAULT_COLOR_RAMP_VALUES.totalSteps,
      lightnessStart: DEFAULT_COLOR_RAMP_VALUES.lightnessStart,
      lightnessEnd: DEFAULT_COLOR_RAMP_VALUES.lightnessEnd,
      chromaStart: DEFAULT_COLOR_RAMP_VALUES.chromaStart,
      chromaEnd: DEFAULT_COLOR_RAMP_VALUES.chromaEnd,
      saturationStart: DEFAULT_COLOR_RAMP_VALUES.saturationStart,
      saturationEnd: DEFAULT_COLOR_RAMP_VALUES.saturationEnd,
      swatches: Array.from({ length: DEFAULT_COLOR_RAMP_VALUES.totalSteps }, (_, i): ColorSwatch => ({
        color: DEFAULT_COLOR_RAMP_VALUES.baseColor,
        colorFormat: DEFAULT_COLOR_RAMP_VALUES.colorFormat,
        index: i,
      })),
    },
  ],
  setColorRamps: (ramps) => set({ colorRamps: ramps }),
  updateColorRamps: (updater) => set((state) => ({ colorRamps: updater(state.colorRamps) })),
}));

/**
 * Generic hook factory for color ramp actions.
 * Takes a pure function and returns a hook that applies it to the color ramps state.
 * This is the single entry point for all color ramp state modifications.
 */
export function SaveColorRampState<T extends any[]>(
  action: (colorRamps: ColorRampConfig[], ...args: T) => ColorRampConfig[]
) {
  const updateColorRamps = useSaveApplicationState(state => state.updateColorRamps);
  
  return (...args: T) => {
    updateColorRamps(prev => action(prev, ...args));
  };
}

// Export the store hook for read-only access (for components that need to read state)
export const useSaveColorRamp = useSaveApplicationState; 