import { useCSSVariablesStore } from '@/state/CSSVariablesState';

export function useGetCSSVariables() {
  return useCSSVariablesStore(state => state.cssVariables);
}

export function useGetCSSCode() {
  return useCSSVariablesStore(state => state.cssCode);
}