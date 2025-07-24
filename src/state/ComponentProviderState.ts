import { create } from 'zustand';

export type ComponentProvider = 'shadcn' | 'bootstrap' | 'radix' | 'tailwindui';

interface ComponentProviderState {
  selectedProvider: ComponentProvider;
  setSelectedProvider: (provider: ComponentProvider) => void;
}

export const useComponentProviderState = create<ComponentProviderState>((set) => ({
  selectedProvider: 'shadcn',
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
})); 