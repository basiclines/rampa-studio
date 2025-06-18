// Validation helpers
const isValidNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const clampValue = (value: number, min: number, max: number): number => {
  if (!isValidNumber(value)) return min;
  return Math.max(min, Math.min(max, value));
};

// Scale calculation helpers with validation
export const calculateScalePosition = (i: number, steps: number, scaleType: string): number => {
  try {
    if (!isValidNumber(i) || !isValidNumber(steps) || steps <= 0) {
      return 0;
    }
    
    const linearPosition = i / (steps - 1);
    
    switch (scaleType) {
      case 'geometric':
        return calculateGeometricPosition(i, steps);
      case 'fibonacci':
        return calculateFibonacciPositions(steps)[i] || 0;
      case 'golden-ratio':
        return calculateGoldenRatioPositions(steps)[i] || 0;
      case 'logarithmic':
        return calculateLogarithmicPosition(i, steps);
      case 'powers-of-2':
        return calculatePowersOf2Position(i, steps);
      case 'musical-ratio':
        return calculateMusicalRatioPosition(i, steps);
      case 'cielab-uniform':
        return calculateCielabUniformPosition(i, steps);
      case 'ease-in':
        return calculateEaseInPosition(i, steps);
      case 'ease-out':
        return calculateEaseOutPosition(i, steps);
      case 'ease-in-out':
        return calculateEaseInOutPosition(i, steps);
      default:
        return linearPosition;
    }
  } catch (error) {
    console.error('Error calculating scale position:', error);
    return 0;
  }
};

export const calculateGeometricPosition = (i: number, steps: number): number => {
  try {
    const ratio = 3;
    if (steps <= 1) return 0;
    const min = 1;
    const max = Math.pow(ratio, steps - 1);
    const result = (Math.pow(ratio, i) - min) / (max - min);
    return clampValue(result, 0, 1);
  } catch (error) {
    console.error('Error calculating geometric position:', error);
    return 0;
  }
};

export const calculateFibonacciPositions = (steps: number): number[] => {
  try {
    const fibs = [0, 1];
    for (let i = 2; i < steps; i++) {
      fibs.push(fibs[i - 1] + fibs[i - 2]);
    }
    const min = fibs[0];
    const max = fibs[fibs.length - 1];
    return fibs.map(f => clampValue((f - min) / (max - min), 0, 1));
  } catch (error) {
    console.error('Error calculating Fibonacci positions:', error);
    return Array(steps).fill(0);
  }
};

export const calculateGoldenRatioPositions = (steps: number): number[] => {
  try {
    const phi = 1.61803398875;
    const vals = [];
    for (let i = 0; i < steps; i++) {
      vals.push(Math.pow(phi, i));
    }
    const min = vals[0];
    const max = vals[vals.length - 1];
    return vals.map(v => clampValue((v - min) / (max - min), 0, 1));
  } catch (error) {
    console.error('Error calculating golden ratio positions:', error);
    return Array(steps).fill(0);
  }
};

export const calculateLogarithmicPosition = (i: number, steps: number): number => {
  try {
    const min = 1;
    const max = steps;
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const x = i + 1;
    const result = (Math.log(x) - logMin) / (logMax - logMin);
    return clampValue(result, 0, 1);
  } catch (error) {
    console.error('Error calculating logarithmic position:', error);
    return 0;
  }
};

export const calculatePowersOf2Position = (i: number, steps: number): number => {
  try {
    const min = 1;
    const max = Math.pow(2, steps - 1);
    const result = (Math.pow(2, i) - min) / (max - min);
    return clampValue(result, 0, 1);
  } catch (error) {
    console.error('Error calculating powers of 2 position:', error);
    return 0;
  }
};

export const calculateMusicalRatioPosition = (i: number, steps: number): number => {
  try {
    const ratios = [1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 15/8, 2];
    let seq = [];
    if (steps <= ratios.length) {
      seq = ratios.slice(0, steps);
    } else {
      for (let j = 0; j < steps; j++) {
        seq.push(1 * Math.pow(2, j / (steps - 1)));
      }
    }
    const min = seq[0];
    const max = seq[seq.length - 1];
    const result = (seq[i] - min) / (max - min);
    return clampValue(result, 0, 1);
  } catch (error) {
    console.error('Error calculating musical ratio position:', error);
    return 0;
  }
};

export const calculateCielabUniformPosition = (i: number, steps: number): number => {
  try {
    const result = i / (steps - 1);
    return clampValue(result, 0, 1);
  } catch (error) {
    console.error('Error calculating CIELAB uniform position:', error);
    return 0;
  }
};

export const calculateEaseInPosition = (i: number, steps: number): number => {
  try {
    const t = i / (steps - 1);
    const result = t * t;
    return clampValue(result, 0, 1);
  } catch (error) {
    console.error('Error calculating ease-in position:', error);
    return 0;
  }
};

export const calculateEaseOutPosition = (i: number, steps: number): number => {
  try {
    const t = i / (steps - 1);
    const result = 1 - (1 - t) * (1 - t);
    return clampValue(result, 0, 1);
  } catch (error) {
    console.error('Error calculating ease-out position:', error);
    return 0;
  }
};

export const calculateEaseInOutPosition = (i: number, steps: number): number => {
  try {
    const t = i / (steps - 1);
    const result = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    return clampValue(result, 0, 1);
  } catch (error) {
    console.error('Error calculating ease-in-out position:', error);
    return 0;
  }
};

// Position calculation helper
export const calculatePositions = (i: number, config: { 
  totalSteps: number; 
  lightnessScaleType?: string; 
  hueScaleType?: string; 
  saturationScaleType?: string; 
}) => {
  const lightnessScale = config.lightnessScaleType || 'linear';
  const hueScale = config.hueScaleType || 'linear';
  const saturationScale = config.saturationScaleType || 'linear';

  return {
    lightness: calculateScalePosition(i, config.totalSteps, lightnessScale),
    hue: calculateScalePosition(i, config.totalSteps, hueScale),
    saturation: calculateScalePosition(i, config.totalSteps, saturationScale)
  };
}; 