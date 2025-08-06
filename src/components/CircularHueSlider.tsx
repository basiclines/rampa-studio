import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn, roundToOneDecimal } from '@/engine/utils';

interface CircularHueSliderProps {
  label: string;
  startValue: number;
  endValue: number;
  min: number;
  max: number;
  onValuesChange: (start: number, end: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
  gradientColors?: string[];
  referenceValue?: number;
  referenceColor?: string;
  totalSteps?: number;
  scaleType?: string;
}

const CircularHueSlider: React.FC<CircularHueSliderProps> = ({
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
  referenceColor = '#f97316',
  totalSteps,
  scaleType = 'linear',
}) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Constants for the circular slider
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = 90;
  const innerRadius = 65;
  const strokeWidth = outerRadius - innerRadius;

  // Convert value to angle (0-360 degrees)
  const valueToAngle = useCallback((value: number) => {
    // For hue slider, map the range to 0-360 degrees
    if (label === 'Hue' && min === -180 && max === 180) {
      // Map -180 to 180 range to 0-360 degrees
      return (value + 180) % 360;
    }
    return ((value - min) / (max - min)) * 360;
  }, [min, max, label]);

  // Convert angle to value
  const angleToValue = useCallback((angle: number) => {
    if (label === 'Hue' && min === -180 && max === 180) {
      // Map 0-360 degrees to -180 to 180 range
      const normalizedAngle = angle - 180;
      return Math.max(min, Math.min(max, normalizedAngle));
    }
    const normalizedAngle = (angle / 360) * (max - min) + min;
    return Math.max(min, Math.min(max, normalizedAngle));
  }, [min, max, label]);

  // Convert angle to SVG coordinates
  const angleToCoords = useCallback((angle: number, radius: number) => {
    const radians = (angle - 90) * (Math.PI / 180); // -90 to start at top
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  }, [centerX, centerY]);

  // Get mouse angle relative to center
  const getMouseAngle = useCallback((e: MouseEvent) => {
    if (!svgRef.current) return 0;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90; // +90 to start at top
    if (angle < 0) angle += 360;
    
    return angle;
  }, [centerX, centerY]);

  const handleMouseDown = (type: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const angle = getMouseAngle(e);
    const newValue = roundToOneDecimal(angleToValue(angle));

    if (isDragging === 'start') {
      onValuesChange(newValue, endValue);
    } else {
      onValuesChange(startValue, newValue);
    }
  }, [isDragging, getMouseAngle, angleToValue, startValue, endValue, onValuesChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate angles for start, end, and reference values
  const startAngle = valueToAngle(startValue);
  const endAngle = valueToAngle(endValue);
  const referenceAngle = referenceValue !== undefined ? (() => {
    if (label === 'Hue' && min === -180 && max === 180) {
      // For hue slider, referenceValue is 0-360 but we need to map it to our circle
      return referenceValue;
    }
    return valueToAngle(referenceValue);
  })() : null;

  // Calculate handler positions
  const startCoords = angleToCoords(startAngle, (outerRadius + innerRadius) / 2);
  const endCoords = angleToCoords(endAngle, (outerRadius + innerRadius) / 2);
  const referenceCoords = referenceAngle !== null ? angleToCoords(referenceAngle, (outerRadius + innerRadius) / 2) : null;

  // Create the gradient stops for the circular gradient
  const createGradientStops = () => {
    if (!gradientColors || gradientColors.length === 0) {
      // Default hue gradient
      const stops = [];
      for (let i = 0; i <= 12; i++) {
        const hue = (i / 12) * 360;
        stops.push(`hsl(${hue}, 70%, 60%)`);
      }
      return stops;
    }
    return gradientColors;
  };

  const gradientStops = createGradientStops();

  // Create SVG path for the donut
  const createDonutPath = () => {
    const outerCircle = `M ${centerX - outerRadius} ${centerY} A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius} ${centerY} A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - outerRadius} ${centerY}`;
    const innerCircle = `M ${centerX - innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY}`;
    return `${outerCircle} ${innerCircle}`;
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="text-xs font-medium text-gray-700 text-center mb-4">{label}</div>
      
      <div ref={containerRef} className="relative">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className="cursor-pointer select-none"
        >
          {/* Define gradients */}
          <defs>
            {/* Create multiple radial segments to simulate conic gradient */}
            {Array.from({ length: 36 }, (_, i) => {
              const angle = (i / 36) * 360;
              const nextAngle = ((i + 1) / 36) * 360;
              const hue = gradientColors && gradientColors.length > 0 
                ? gradientColors[Math.floor((i / 36) * gradientColors.length)]
                : `hsl(${angle}, 70%, 60%)`;
              
              return (
                <linearGradient key={`segment-${i}`} id={`hueSegment${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={hue} />
                  <stop offset="100%" stopColor={hue} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Background donut - create segments for hue wheel */}
          {Array.from({ length: 36 }, (_, i) => {
            const angle = (i / 36) * 360;
            const nextAngle = ((i + 1) / 36) * 360;
            
            const startCoord = angleToCoords(angle, (outerRadius + innerRadius) / 2);
            const endCoord = angleToCoords(nextAngle, (outerRadius + innerRadius) / 2);
            
            const hue = gradientColors && gradientColors.length > 0 
              ? gradientColors[Math.floor((i / 36) * gradientColors.length)]
              : `hsl(${angle}, 70%, 60%)`;
            
            const pathData = [
              `M ${startCoord.x} ${startCoord.y}`,
              `A ${(outerRadius + innerRadius) / 2} ${(outerRadius + innerRadius) / 2} 0 0 1 ${endCoord.x} ${endCoord.y}`
            ].join(' ');

            return (
              <path
                key={`hue-segment-${i}`}
                d={pathData}
                fill="none"
                stroke={hue}
                strokeWidth={strokeWidth}
                style={{ 
                  filter: 'drop-shadow(0 0 0 1px rgba(0, 0, 0, 0.1))'
                }}
              />
            );
          })}

          {/* Step indicators */}
          {totalSteps && totalSteps > 1 && Array.from({ length: totalSteps }).map((_, i) => {
            const angle = (i / totalSteps) * 360;
            const innerCoord = angleToCoords(angle, innerRadius - 2);
            const outerCoord = angleToCoords(angle, outerRadius + 2);
            
            return (
              <line
                key={i}
                x1={innerCoord.x}
                y1={innerCoord.y}
                x2={outerCoord.x}
                y2={outerCoord.y}
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="1"
              />
            );
          })}

          {/* Reference indicator */}
          {referenceCoords && (
            <g style={{ pointerEvents: 'none' }}>
              <circle
                cx={referenceCoords.x}
                cy={referenceCoords.y}
                r="8"
                fill={referenceColor}
                stroke="white"
                strokeWidth="3"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))' }}
              />
              <circle
                cx={referenceCoords.x}
                cy={referenceCoords.y}
                r="4"
                fill="white"
                fillOpacity="0.9"
              />
            </g>
          )}

          {/* Start handler */}
          <circle
            cx={startCoords.x}
            cy={startCoords.y}
            r="8"
            style={{ 
              fill: 'white',
              stroke: 'rgba(0, 0, 0, 0.4)',
              strokeWidth: '2',
              cursor: isDragging === 'start' ? 'grabbing' : 'grab',
              filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))'
            }}
            onMouseDown={handleMouseDown('start')}
          />

          {/* End handler */}
          <circle
            cx={endCoords.x}
            cy={endCoords.y}
            r="8"
            style={{ 
              fill: 'white',
              stroke: 'rgba(0, 0, 0, 0.4)',
              strokeWidth: '2',
              cursor: isDragging === 'end' ? 'grabbing' : 'grab',
              filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))'
            }}
            onMouseDown={handleMouseDown('end')}
          />

          {/* Arc between handlers to show the range */}
          {(() => {
            const radius = (outerRadius + innerRadius) / 2;
            const startCoord = angleToCoords(startAngle, radius);
            const endCoord = angleToCoords(endAngle, radius);
            
            // Determine if we should draw the long arc or short arc
            let angleDiff = endAngle - startAngle;
            if (angleDiff < 0) angleDiff += 360;
            
            const largeArcFlag = angleDiff > 180 ? 1 : 0;
            
            const pathData = [
              `M ${startCoord.x} ${startCoord.y}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endCoord.x} ${endCoord.y}`
            ].join(' ');

            return (
              <g style={{ pointerEvents: 'none' }}>
                {/* Background arc */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="4"
                />
                {/* Foreground arc */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.6)"
                  strokeWidth="2"
                />
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Value display */}
      <div className="text-xs text-center space-y-1 mt-4">
        <div className="text-black">{formatValue(roundToOneDecimal(startValue))}</div>
        <div className="text-gray-600">{formatValue(roundToOneDecimal(endValue))}</div>
      </div>
    </div>
  );
};

export default CircularHueSlider;