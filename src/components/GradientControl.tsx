import React, { useState, useRef, useCallback } from 'react';
import { cn, roundToOneDecimal } from '@/engine/utils';
import { calculateScalePosition } from '@/engine/HarmonyEngine';
import { valueToPosition as engineValueToPosition, positionToValue as enginePositionToValue, isHueGradient } from '@/engine/GradientEngine';

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
    return engineValueToPosition({
      value,
      min,
      max,
      referenceValue,
      isHueGradient: isHueGradient(label, min, max),
      invertValues
    });
  }, [min, max, invertValues, label, referenceValue]);

  const positionToValue = useCallback((position: number) => {
    return enginePositionToValue({
      position,
      min,
      max,
      referenceValue,
      isHueGradient: isHueGradient(label, min, max),
      invertValues
    });
  }, [min, max, invertValues, label, referenceValue]);

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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="text-xs font-medium text-gray-700 text-center mb-2">{label}</div>
      <div 
        ref={containerRef}
        className="relative w-8 mx-auto cursor-pointer select-none flex-1"
        style={{ 
          background: gradientBackground,
          boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Step indicators */}
        {totalSteps && totalSteps > 1 && Array.from({ length: totalSteps - 2 }).map((_, i) => {
          const step = i + 1;
          const t = calculateScalePosition(step, totalSteps, scaleType);
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
            "absolute w-6 h-3 r-material-light-gradient r-slider-thumb cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-colors z-10"
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
            "absolute w-6 h-3 r-material-light-gradient r-slider-thumb  cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-colors z-10"
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
            <div className="text-black">{formatValue(roundToOneDecimal(endValue))}</div>
            <div className="text-gray-600">{formatValue(roundToOneDecimal(startValue))}</div>
          </>
        ) : (
          <>
            <div className="text-black">{formatValue(roundToOneDecimal(startValue))}</div>
            <div className="text-gray-600">{formatValue(roundToOneDecimal(endValue))}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default GradientControl;
