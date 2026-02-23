import { create } from 'zustand';
import type { InterpolationMode } from '@/engine/ColorSpaceEngine';

export type ColorSpaceType = 'linear' | 'cube';

export interface LinearConfig {
  fromColor: string;
  toColor: string;
  steps: number;
  interpolation: InterpolationMode;
}

export interface CubeConfig {
  corners: Record<string, string>;
  stepsPerAxis: number;
  interpolation: InterpolationMode;
}

type State = {
  spaceType: ColorSpaceType;
  linearConfig: LinearConfig;
  cubeConfig: CubeConfig;
};

type Actions = {
  setSpaceType: (type: ColorSpaceType) => void;
  setLinearConfig: (config: Partial<LinearConfig>) => void;
  setCubeConfig: (config: Partial<CubeConfig>) => void;
};

export const useColorSpaceStore = create<State & Actions>((set) => ({
  spaceType: 'linear',
  linearConfig: {
    fromColor: '#ffffff',
    toColor: '#000000',
    steps: 12,
    interpolation: 'oklch',
  },
  cubeConfig: {
    corners: {
      k: '#1e1e2e',
      r: '#f38ba8',
      g: '#a6e3a1',
      b: '#89b4fa',
      y: '#f9e2af',
      m: '#cba6f7',
      c: '#94e2d5',
      w: '#cdd6f4',
    },
    stepsPerAxis: 6,
    interpolation: 'oklch',
  },
  setSpaceType: (type) => set({ spaceType: type }),
  setLinearConfig: (config) =>
    set((state) => ({ linearConfig: { ...state.linearConfig, ...config } })),
  setCubeConfig: (config) =>
    set((state) => ({ cubeConfig: { ...state.cubeConfig, ...config } })),
}));
