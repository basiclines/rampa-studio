import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GradientControlProps {
  label: string;
  startValue: number;
  endValue: number;
  min: number;
  max: number;
  onValuesChange: (start: number, end: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
  gradientColors?: string[]; // Array of colors representing the gradient
  referenceValue?: number; // Optional reference value to mark on the gradient
  referenceColor?: string; // Color to use for the reference indicator
  invertValues?: boolean; // New prop to invert the value mapping
  totalSteps?: number; // Number of steps to show as indicators
  scaleType?: string; // linear, geometric, fibonacci, etc
  swapHandlerColors?: boolean; // If true, swap the colors of the start/end handlers
}

const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

const GradientControl: React.FC<GradientControlProps> = ({
  label,
  startValue,
  endValue,
  min,
  max,
  onValuesChange,
  formatValue = (v) => v.toString(),
  className,
  gradientColors,
  referenceValue,
  referenceColor = '#f97316', // Default to orange if no color provided
  invertValues = false,
  totalSteps,
  scaleType = 'linear',
  swapHandlerColors = false,
}) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const valueToPosition = useCallback((value: number) => {
    if (invertValues) {
      // For inverted sliders, map values in reverse
      return ((max - value) / (max - min)) * 100;
    }
    return ((value - min) / (max - min)) * 100;
  }, [min, max, invertValues]);

  const positionToValue = useCallback((position: number) => {
    if (invertValues) {
      // For inverted sliders, map position in reverse
      const value = max - (position / 100) * (max - min);
      return roundToOneDecimal(Math.max(min, Math.min(max, value)));
    }
    const value = min + (position / 100) * (max - min);
    return roundToOneDecimal(Math.max(min, Math.min(max, value)));
  }, [min, max, invertValues]);

  const handleMouseDown = (type: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const newValue = positionToValue(position);

    if (isDragging === 'start') {
      onValuesChange(newValue, endValue);
    } else {
      onValuesChange(startValue, newValue);
    }
  }, [isDragging, positionToValue, startValue, endValue, onValuesChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const startPosition = valueToPosition(startValue);
  const endPosition = valueToPosition(endValue);
  
  // Special handling for hue slider reference value
  const referencePosition = referenceValue !== undefined ? (() => {
    if (label === 'Hue' && min === -180 && max === 180) {
      // For hue slider, referenceValue is 0-360 but slider is -180 to 180
      // Map 0-360 to 0-100% position on the gradient
      return (referenceValue / 360) * 100;
    }
    return valueToPosition(referenceValue);
  })() : null;

  // Create gradient background based on gradientColors or fallback to gray
  const gradientBackground = gradientColors && gradientColors.length > 0 
    ? `linear-gradient(to bottom, ${gradientColors.join(', ')})` 
    : 'linear-gradient(to bottom, #374151, #e5e7eb)';

  // Step position helpers
  function geometricPosition(i: number, steps: number) {
    const ratio = 3;
    if (steps <= 1) return 0;
    const min = 1;
    const max = Math.pow(ratio, steps - 1);
    return (Math.pow(ratio, i) - min) / (max - min);
  }
  function fibonacciPositions(steps: number): number[] {
    const fibs = [0, 1];
    for (let i = 2; i < steps; i++) {
      fibs.push(fibs[i - 1] + fibs[i - 2]);
    }
    const min = fibs[0];
    const max = fibs[fibs.length - 1];
    return fibs.map(f => (f - min) / (max - min));
  }
  function goldenRatioPositions(steps: number): number[] {
    // Golden ratio phi
    const phi = (1 + Math.sqrt(5)) / 2;
    // Generate a sequence where each step is phi^i
    const seq = [];
    for (let i = 0; i < steps; i++) {
      seq.push(Math.pow(phi, i));
    }
    const min = seq[0];
    const max = seq[seq.length - 1];
    return seq.map(v => (v - min) / (max - min));
  }
  function logarithmicPositions(steps: number): number[] {
    // Avoid log(0) by starting at 1
    const min = 1;
    const max = steps;
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    return Array.from({ length: steps }, (_, i) => {
      const x = i + 1;
      return (Math.log(x) - logMin) / (logMax - logMin);
    });
  }
  function powersOf2Positions(steps: number): number[] {
    // Generate a sequence where each step is 2^i
    const seq = [];
    for (let i = 0; i < steps; i++) {
      seq.push(Math.pow(2, i));
    }
    const min = seq[0];
    const max = seq[seq.length - 1];
    return seq.map(v => (v - min) / (max - min));
  }
  function musicalRatioPositions(steps: number): number[] {
    // Use a set of common musical ratios (just intonation, normalized)
    // If more steps are needed, interpolate linearly between them
    const ratios = [1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 15/8, 2];
    let seq = [];
    if (steps <= ratios.length) {
      seq = ratios.slice(0, steps);
    } else {
      // Interpolate between 1 and 2 for extra steps
      for (let i = 0; i < steps; i++) {
        seq.push(1 * Math.pow(2, i / (steps - 1)));
      }
    }
    const min = seq[0];
    const max = seq[seq.length - 1];
    return seq.map(v => (v - min) / (max - min));
  }
  function cielabUniformPositions(steps: number): number[] {
    // Placeholder: uniform linear distribution (true CIELAB would require color math)
    return Array.from({ length: steps }, (_, i) => i / (steps - 1));
  }
  function easeInPositions(steps: number): number[] {
    // Quadratic ease-in: t^2
    return Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      return t * t;
    });
  }
  function easeOutPositions(steps: number): number[] {
    // Quadratic ease-out: 1 - (1-t)^2
    return Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      return 1 - (1 - t) * (1 - t);
    });
  }
  function easeInOutPositions(steps: number): number[] {
    // Quadratic ease-in-out
    return Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    });
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="text-xs font-medium text-gray-700 text-center mb-2">{label}</div>
      <div 
        ref={containerRef}
        className="relative w-8 mx-auto cursor-pointer select-none flex-1"
        style={{ 
          background: gradientBackground
        }}
      >
        {/* Step indicators */}
        {totalSteps && totalSteps > 1 && Array.from({ length: totalSteps - 2 }).map((_, i) => {
          const step = i + 1;
          let t = step / (totalSteps - 1);
          if (scaleType === 'geometric') {
            t = geometricPosition(step, totalSteps);
          } else if (scaleType === 'fibonacci') {
            t = fibonacciPositions(totalSteps)[step];
          } else if (scaleType === 'golden-ratio') {
            t = goldenRatioPositions(totalSteps)[step];
          } else if (scaleType === 'logarithmic') {
            t = logarithmicPositions(totalSteps)[step];
          } else if (scaleType === 'powers-of-2') {
            t = powersOf2Positions(totalSteps)[step];
          } else if (scaleType === 'musical-ratio') {
            t = musicalRatioPositions(totalSteps)[step];
          } else if (scaleType === 'cielab-uniform') {
            t = cielabUniformPositions(totalSteps)[step];
          } else if (scaleType === 'ease-in') {
            t = easeInPositions(totalSteps)[step];
          } else if (scaleType === 'ease-out') {
            t = easeOutPositions(totalSteps)[step];
          } else if (scaleType === 'ease-in-out') {
            t = easeInOutPositions(totalSteps)[step];
          }
          const value = startValue + ((endValue - startValue) * t);
          const percent = valueToPosition(value);
          return (
            <div
              key={step}
              className="absolute left-0 w-full h-px bg-white/70 z-10 pointer-events-none"
              style={{ top: `${percent}%` }}
            />
          );
        })}

        {/* Reference line (for base color value) */}
        {referencePosition !== null && (
          <div
            className="absolute w-full z-20"
            style={{ 
              top: `${referencePosition}%`,
              transform: 'translateY(-4px)',
              backgroundColor: referenceColor,
              height: '8px',
              border: '2px solid white',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Start point */}
        <div
          className={cn(
            "absolute w-6 h-3 border-2 border-white rounded shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-colors z-10",
            swapHandlerColors
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-black hover:bg-gray-800"
          )}
          style={{ 
            left: '50%',
            top: `${startPosition}%`
          }}
          onMouseDown={handleMouseDown('start')}
        />
        
        {/* End point (always show) */}
        <div
          className={cn(
            "absolute w-6 h-3 border-2 border-white rounded shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-colors z-10",
            swapHandlerColors
              ? "bg-black hover:bg-gray-800"
              : "bg-gray-500 hover:bg-gray-600"
          )}
          style={{ 
            left: '50%',
            top: `${endPosition}%`
          }}
          onMouseDown={handleMouseDown('end')}
        />
        
        {/* Gradient line between points */}
        <div
          className="absolute w-1 bg-gradient-to-b from-black to-gray-500 left-1/2 transform -translate-x-1/2 opacity-60"
          style={{
            top: `${Math.min(startPosition, endPosition)}%`,
            height: `${Math.abs(endPosition - startPosition)}%`
          }}
        />
      </div>
      
      {/* Value display */}
      <div className="text-xs text-center space-y-1 mt-2">
        {swapHandlerColors ? (
          <>
            <div className="text-black">Start: {formatValue(roundToOneDecimal(endValue))}</div>
            {scaleType === 'linear' && (
              <div className="text-gray-600">End: {formatValue(roundToOneDecimal(startValue))}</div>
            )}
          </>
        ) : (
          <>
            <div className="text-black">Start: {formatValue(roundToOneDecimal(startValue))}</div>
            {scaleType === 'linear' && (
              <div className="text-gray-600">End: {formatValue(roundToOneDecimal(endValue))}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GradientControl;
