
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
  invertValues = false
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
      return Math.max(min, Math.min(max, value));
    }
    const value = min + (position / 100) * (max - min);
    return Math.max(min, Math.min(max, value));
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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="text-xs font-medium text-gray-700 text-center mb-2">{label}</div>
      <div 
        ref={containerRef}
        className="relative w-8 rounded border border-gray-300 mx-auto cursor-pointer select-none flex-1"
        style={{ 
          background: gradientBackground,
          minHeight: '200px'
        }}
      >
        {/* Reference line (for base color value) */}
        {referencePosition !== null && (
          <div
            className="absolute w-full z-20"
            style={{ 
              top: `${referencePosition}%`,
              transform: 'translateY(-4px)',
              backgroundColor: referenceColor,
              height: '8px',
              border: '2px solid white'
            }}
          />
        )}

        {/* Start point */}
        <div
          className="absolute w-6 h-3 bg-black border-2 border-white rounded shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 hover:bg-gray-800 transition-colors z-10"
          style={{ 
            left: '50%',
            top: `${startPosition}%`
          }}
          onMouseDown={handleMouseDown('start')}
        />
        
        {/* End point */}
        <div
          className="absolute w-6 h-3 bg-gray-500 border-2 border-white rounded shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 hover:bg-gray-600 transition-colors z-10"
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
        <div className="text-black">Start: {formatValue(startValue)}</div>
        <div className="text-gray-600">End: {formatValue(endValue)}</div>
      </div>
    </div>
  );
};

export default GradientControl;
