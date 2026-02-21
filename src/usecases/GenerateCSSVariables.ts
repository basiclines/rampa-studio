import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { CSSVariable, useCSSVariablesStore } from '@/state/CSSVariablesState';
import { generateColorRamp } from '@/engine/ColorEngine';

/**
 * Pure function to generate CSS variables from color ramps
 * Format: rampname-step (e.g., blue-10, blue-20)
 * Step number = swatch.index * 10
 */
export function generateCSSVariables(colorRamps: ColorRampConfig[]): CSSVariable[] {
  const variables: CSSVariable[] = [];
  
  colorRamps.forEach((ramp) => {
    // Sanitize ramp name for CSS (remove spaces, special characters)
    const sanitizedRampName = ramp.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Generate the actual colors using the color engine
    const generatedColors = generateColorRamp(ramp);
    
    generatedColors.forEach((color, index) => {
      const stepNumber = index * 10;
      const variableName = `--${sanitizedRampName}-${stepNumber}`;
      
      variables.push({
        name: variableName,
        value: color,
        rampName: sanitizedRampName,
        stepNumber: stepNumber,
      });
    });
  });
  
  return variables;
}

/**
 * Pure function to generate CSS code from CSS variables
 */
export function generateCSSCode(variables: CSSVariable[]): string {
  if (variables.length === 0) {
    return '/* No color ramps available */\n:root {\n  /* CSS variables will appear here when you create color ramps */\n}';
  }
  
  const cssLines = [':root {'];
  
  // Group variables by ramp name for better organization
  const variablesByRamp = variables.reduce((acc, variable) => {
    if (!acc[variable.rampName]) {
      acc[variable.rampName] = [];
    }
    acc[variable.rampName].push(variable);
    return acc;
  }, {} as Record<string, CSSVariable[]>);
  
  Object.entries(variablesByRamp).forEach(([rampName, rampVariables]) => {
    cssLines.push(`  /* ${rampName} color ramp */`);
    rampVariables
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .forEach((variable) => {
        cssLines.push(`  ${variable.name}: ${variable.value};`);
      });
    cssLines.push('');
  });
  
  // Remove last empty line and add closing brace
  if (cssLines[cssLines.length - 1] === '') {
    cssLines.pop();
  }
  cssLines.push('}');
  
  return cssLines.join('\n');
}

/**
 * Usecase to generate and update CSS variables from color ramps
 */
export function useGenerateCSSVariables() {
  const setCSSVariables = useCSSVariablesStore(state => state.setCSSVariables);
  const updateCSSCode = useCSSVariablesStore(state => state.updateCSSCode);
  
  return (colorRamps: ColorRampConfig[]) => {
    const variables = generateCSSVariables(colorRamps);
    const cssCode = generateCSSCode(variables);
    
    setCSSVariables(variables);
    updateCSSCode(cssCode);
  };
}