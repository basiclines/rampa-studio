import { useGetCSSCode } from './GetCSSVariables';
import { useGetUserCSS, useIsUserCSSModified } from './GetUserCSS';

/**
 * Usecase to generate CSS code with @scope rule for component preview
 * Combines CSS variables (global) and user's custom CSS (scoped to .component-preview)
 */
export function useGenerateScopedCSS() {
  const generatedCSSVariables = useGetCSSCode();
  const userCSS = useGetUserCSS();
  const isUserModified = useIsUserCSSModified();
  
  const generateScopedCSS = (): string => {
    let scopedCSS = '';
    
    // Always add CSS variables at the root level (global)
    if (generatedCSSVariables) {
      scopedCSS += `${generatedCSSVariables}\n\n`;
    }
    
    // Add user's custom CSS inside @scope rule if they have modifications
    if (isUserModified && userCSS) {
      scopedCSS += `@scope (.component-preview) {\n`;
      
      // Process user CSS to ensure it's properly indented inside @scope
      const processedUserCSS = userCSS
        .split('\n')
        .map(line => {
          // Don't indent :root rules or empty lines
          if (line.trim().startsWith(':root') || line.trim() === '') {
            return line;
          }
          // Add indentation for other rules
          return `  ${line}`;
        })
        .join('\n');
      
      scopedCSS += `${processedUserCSS}\n`;
      scopedCSS += `}\n`;
    }
    
    return scopedCSS;
  };
  
  return generateScopedCSS();
} 