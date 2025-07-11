import { create } from 'zustand';

export type MainTabType = 'colors' | 'ui';

interface MainTabState {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
}

export const useMainTabState = create<MainTabState>((set) => ({
  activeTab: 'colors',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));