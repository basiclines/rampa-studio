import { useGetCSSCode } from './GetCSSVariables';
import { useGetUserCSS, useIsUserCSSModified } from './GetUserCSS';

/**
 * Usecase to get the combined CSS code:
 * - If user has modified the CSS, return their custom code
 * - Otherwise, return the auto-generated CSS variables
 */
export function useGetCombinedCSS() {
  const generatedCSS = useGetCSSCode();
  const userCSS = useGetUserCSS();
  const isUserModified = useIsUserCSSModified();
  
  // If user has made modifications, use their custom CSS
  // Otherwise, use the auto-generated CSS
  return isUserModified && userCSS ? userCSS : generatedCSS;
}

/**
 * Usecase to get the initial CSS code for the editor
 * This should be used to populate the editor when it first loads
 */
export function useGetInitialCSS() {
  const userCSS = useGetUserCSS();
  
  return userCSS;
} 