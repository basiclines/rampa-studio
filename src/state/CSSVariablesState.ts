import { create } from 'zustand';

export interface CSSVariable {
  name: string;
  value: string;
  rampName: string;
  stepNumber: number;
}

type State = {
  cssVariables: CSSVariable[];
  cssCode: string;
};

type Actions = {
  setCSSVariables: (variables: CSSVariable[]) => void;
  updateCSSCode: (code: string) => void;
};

export const useCSSVariablesStore = create<State & Actions>((set) => ({
  cssVariables: [],
  cssCode: '',
  setCSSVariables: (variables) => set({ cssVariables: variables }),
  updateCSSCode: (code) => set({ cssCode: code }),
}));