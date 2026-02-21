import { create } from 'zustand';

export type MainTabType = 'colors' | 'ui' | 'colorSpaces';

type State = {
  activeTab: MainTabType;
};

type Actions = {
  setActiveTab: (tab: MainTabType) => void;
};

export const useMainTabStore = create<State & Actions>((set) => ({
  activeTab: 'colors',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));