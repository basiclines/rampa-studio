import { useGetCSSCode } from './GetCSSVariables';
import { useGetUserCSS, useIsUserCSSModified } from './GetUserCSS';
import { useComponentProviderState } from '@/state/ComponentProviderState';
import { useGetProviderDefaultCSS } from './GetProviderDefaultCSS';

/**
 * Usecase to generate CSS code with @scope rule for component preview
 * Combines CSS variables (global), provider default CSS (scoped), and user's custom CSS (scoped)
 */
export function useGenerateScopedCSS() {
  const generatedCSSVariables = useGetCSSCode();
  const userCSS = useGetUserCSS();
  const isUserModified = useIsUserCSSModified();
  
  // Get provider-specific default CSS
  const { selectedProvider } = useComponentProviderState();
  const providerDefaultCSS = useGetProviderDefaultCSS(selectedProvider);
  
  const generateScopedCSS = (): string => {
    let scopedCSS = '';
    
    // Always add CSS variables at the root level (global)
    if (generatedCSSVariables) {
      scopedCSS += `${generatedCSSVariables}\n\n`;
    }
    
    // Add provider default CSS and user's custom CSS inside @scope rule
    const hasProviderCSS = providerDefaultCSS && providerDefaultCSS.trim();
    const hasUserCSS = isUserModified && userCSS && userCSS.trim();
    
    if (hasProviderCSS || hasUserCSS) {
      scopedCSS += `@scope (.component-preview) {\n`;
      
      // Add provider default CSS first
      if (hasProviderCSS) {
        const processedProviderCSS = providerDefaultCSS
          .split('\n')
          .map(line => {
            // Don't indent :root rules, comments, or empty lines
            if (line.trim().startsWith(':root') || line.trim().startsWith('/*') || line.trim() === '') {
              return line;
            }
            // Add indentation for other rules
            return `  ${line}`;
          })
          .join('\n');
        
        scopedCSS += `${processedProviderCSS}\n`;
      }
      
      // Add user's custom CSS after provider CSS
      if (hasUserCSS) {
        if (hasProviderCSS) {
          scopedCSS += `\n`;
        }
        
        const processedUserCSS = userCSS
          .split('\n')
          .map(line => {
            // Don't indent :root rules, comments, or empty lines
            if (line.trim().startsWith(':root') || line.trim().startsWith('/*') || line.trim() === '') {
              return line;
            }
            // Add indentation for other rules
            return `  ${line}`;
          })
          .join('\n');
        
        scopedCSS += `${processedUserCSS}\n`;
      }
      
      scopedCSS += `}\n`;
    }
    
    return scopedCSS;
  };
  
  return generateScopedCSS();
} 