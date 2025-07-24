import React, { useEffect } from 'react';
import { useGenerateScopedCSS } from '@/usecases/GenerateScopedCSS';

const STYLE_ID = 'component-preview-scoped-styles';

/**
 * Component that injects scoped CSS styles into the document head
 * Uses @scope rule to ensure styles only apply to .component-preview containers
 */
const ScopedStyleInjector: React.FC = () => {
  const scopedCSS = useGenerateScopedCSS();

  useEffect(() => {
    // Remove existing style element if it exists
    const existingStyle = document.getElementById(STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new style element if we have CSS
    if (scopedCSS && scopedCSS.trim()) {
      const styleElement = document.createElement('style');
      styleElement.id = STYLE_ID;
      styleElement.textContent = scopedCSS;
      document.head.appendChild(styleElement);
    }

    // Cleanup on unmount
    return () => {
      const styleElement = document.getElementById(STYLE_ID);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [scopedCSS]);

  // This component doesn't render anything visible
  return null;
};

export default ScopedStyleInjector; 