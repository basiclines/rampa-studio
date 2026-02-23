import { describe, it, expect } from 'bun:test';
import { generateCSSVariables, generateCSSCode } from '../src/usecases/GenerateCSSVariables';
import { ColorRampConfig } from '../src/entities/ColorRampEntity';

describe('CSS Variables Generation', () => {
  const mockColorRamp: ColorRampConfig = {
    id: '1',
    name: 'Blue Primary',
    baseColor: '#3b82f6',
    colorFormat: 'hex',
    totalSteps: 3,
    lightnessStart: 90,
    lightnessEnd: 10,
    chromaStart: 0.1,
    chromaEnd: 0.3,
    saturationStart: 100,
    saturationEnd: 100,
    swatches: [
      { color: '#dbeafe', colorFormat: 'hex', index: 0 },
      { color: '#3b82f6', colorFormat: 'hex', index: 1 },
      { color: '#1e40af', colorFormat: 'hex', index: 2 },
    ],
  };

  it('should generate CSS variables from color ramps', () => {
    const variables = generateCSSVariables([mockColorRamp]);
    
    expect(variables).toHaveLength(3);
    expect(variables[0]).toEqual({
      name: '--blue-primary-0',
      value: '#cee0fd',
      rampName: 'blue-primary',
      stepNumber: 0,
    });
    expect(variables[1]).toEqual({
      name: '--blue-primary-10',
      value: '#0b63f4',
      rampName: 'blue-primary',
      stepNumber: 10,
    });
    expect(variables[2]).toEqual({
      name: '--blue-primary-20',
      value: '#021431',
      rampName: 'blue-primary',
      stepNumber: 20,
    });
  });

  it('should sanitize ramp names for CSS variables', () => {
    const rampWithSpecialChars: ColorRampConfig = {
      ...mockColorRamp,
      name: 'My Super@Color! Ramp#123',
      swatches: [
        { color: '#ff0000', colorFormat: 'hex', index: 0 },
      ],
    };

    const variables = generateCSSVariables([rampWithSpecialChars]);
    
    expect(variables[0].name).toBe('--my-supercolor-ramp123-0');
    expect(variables[0].rampName).toBe('my-supercolor-ramp123');
  });

  it('should generate CSS code from variables', () => {
    const variables = generateCSSVariables([mockColorRamp]);
    const cssCode = generateCSSCode(variables);
    
    expect(cssCode).toContain(':root {');
    expect(cssCode).toContain('/* blue-primary color ramp */');
    expect(cssCode).toContain('--blue-primary-0: #cee0fd;');
    expect(cssCode).toContain('--blue-primary-10: #0b63f4;');
    expect(cssCode).toContain('--blue-primary-20: #021431;');
    expect(cssCode).toContain('}');
  });

  it('should handle empty color ramps', () => {
    const variables = generateCSSVariables([]);
    const cssCode = generateCSSCode(variables);
    
    expect(variables).toHaveLength(0);
    expect(cssCode).toContain('/* No color ramps available */');
    expect(cssCode).toContain('/* CSS variables will appear here when you create color ramps */');
  });

  it('should handle multiple color ramps', () => {
    const redRamp: ColorRampConfig = {
      ...mockColorRamp,
      id: '2',
      name: 'Red Secondary',
      swatches: [
        { color: '#fecaca', colorFormat: 'hex', index: 0 },
        { color: '#ef4444', colorFormat: 'hex', index: 1 },
      ],
    };

    const variables = generateCSSVariables([mockColorRamp, redRamp]);
    
    expect(variables).toHaveLength(6); // 3 blue + 3 red (totalSteps: 3 inherited)
    expect(variables.some(v => v.name === '--blue-primary-0')).toBe(true);
    expect(variables.some(v => v.name === '--red-secondary-0')).toBe(true);
    expect(variables.some(v => v.name === '--red-secondary-10')).toBe(true);
  });
});