import { ComponentProvider } from '@/state/ComponentProviderState';
import { SHADCN_DEFAULT_THEME } from '@/uiproviders/ShadcnComponentKit';

/**
 * Get default CSS theme for a given component provider
 */
export const getProviderDefaultCSS = (provider: ComponentProvider): string => {
  switch (provider) {
    case 'shadcn':
      return SHADCN_DEFAULT_THEME;
    case 'bootstrap':
      return `/* Bootstrap Default Theme */
/* Coming soon! */

`;
    case 'radix':
      return `/* Radix Default Theme */
/* Coming soon! */

`;
    case 'tailwindui':
      return `/* TailwindUI Default Theme */
/* Coming soon! */

`;
    default:
      return SHADCN_DEFAULT_THEME;
  }
};

/**
 * Hook to get default CSS for the selected provider
 */
export const useGetProviderDefaultCSS = (provider: ComponentProvider): string => {
  return getProviderDefaultCSS(provider);
}; 