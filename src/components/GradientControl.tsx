
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
}

const GradientControl: React.FC<GradientControlProps> = ({
  label,
  startValue,
  endValue,
  min,
  max,
  onValuesChange,
  formatValue = (v) => v.toString(),
  className
}) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const valueToPosition = useCallback((value: number) => {
    return ((value - min) / (max - min)) * 100;
  }, [min, max]);

  const positionToValue = useCallback((position: number) => {
    const value = min + (position / 100) * (max - min);
    return Math.max(min, Math.min(max, value));
  }, [min, max]);

  const handleMouseDown = (type: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const newValue = positionToValue(100 - position); // Invert because top = max value

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

  const startPosition = 100 - valueToPosition(startValue); // Invert for visual representation
  const endPosition = 100 - valueToPosition(endValue);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-xs font-medium text-gray-700 text-center">{label}</div>
      <div 
        ref={containerRef}
        className="relative w-8 h-32 bg-gradient-to-t from-gray-200 to-gray-800 rounded border border-gray-300 mx-auto cursor-pointer select-none"
      >
        {/* Start point */}
        <div
          className="absolute w-6 h-3 bg-blue-500 border-2 border-white rounded shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 hover:bg-blue-600 transition-colors z-10"
          style={{ 
            left: '50%',
            top: `${startPosition}%`
          }}
          onMouseDown={handleMouseDown('start')}
        />
        
        {/* End point */}
        <div
          className="absolute w-6 h-3 bg-red-500 border-2 border-white rounded shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 hover:bg-red-600 transition-colors z-10"
          style={{ 
            left: '50%',
            top: `${endPosition}%`
          }}
          onMouseDown={handleMouseDown('end')}
        />
        
        {/* Gradient line between points */}
        <div
          className="absolute w-1 bg-gradient-to-t from-blue-500 to-red-500 left-1/2 transform -translate-x-1/2 opacity-60"
          style={{
            top: `${Math.min(startPosition, endPosition)}%`,
            height: `${Math.abs(endPosition - startPosition)}%`
          }}
        />
      </div>
      
      {/* Value display */}
      <div className="text-xs text-center space-y-1">
        <div className="text-red-600">End: {formatValue(endValue)}</div>
        <div className="text-blue-600">Start: {formatValue(startValue)}</div>
      </div>
    </div>
  );
};

export default GradientControl;
