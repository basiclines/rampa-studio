import { useEffect } from 'react';
import { useSaveColorRamp } from '@/state/SaveColorRampState';
import { useGenerateCSSVariables } from './GenerateCSSVariables';

/**
 * Usecase to automatically sync CSS variables with color ramps changes
 * This should be used in components that need to keep CSS variables updated
 */
export function useSyncCSSVariables() {
  const colorRamps = useSaveColorRamp(state => state.colorRamps);
  const generateCSSVariables = useGenerateCSSVariables();
  
  useEffect(() => {
    // Generate CSS variables whenever color ramps change
    generateCSSVariables(colorRamps);
  }, [colorRamps]);
  
  return {
    colorRamps,
    generateCSSVariables,
  };
}