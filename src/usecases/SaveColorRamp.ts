import { create } from 'zustand';
import { ColorRampConfig } from '@/entities/ColorRamp';
import { ColorSwatch } from '@/entities/ColorSwatch';

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
      baseColor: '#3b82f6',
      totalSteps: 10,
      lightnessRange: 80,
      lightnessAdvanced: false,
      chromaRange: 0,
      chromaAdvanced: false,
      saturationRange: 40,
      saturationAdvanced: false,
      swatches: Array.from({ length: 10 }, (_, i) => ({
        color: '#3b82f6',
        index: i,
        locked: false
      })),
    },
  ],
  setColorRamps: (ramps) => set({ colorRamps: ramps }),
  updateColorRamps: (updater) => set((state) => ({ colorRamps: updater(state.colorRamps) })),
})); 