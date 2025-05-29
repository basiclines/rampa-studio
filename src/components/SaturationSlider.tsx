import React, { useEffect } from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateSaturationGradient, calculateAdvancedDefaults } from '@/lib/gradientUtils';

interface ColorRampConfig {
  baseColor: string;
  saturationRange: number;
  saturationStart?: number;
  saturationEnd?: number;
  totalSteps: number;
  saturationScaleType: string;
}

interface SaturationSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
}

const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

const SaturationSlider: React.FC<SaturationSliderProps> = ({ ramp, onUpdate }) => {
  const defaults = calculateAdvancedDefaults(ramp.baseColor, 'saturation', ramp.saturationRange);
  
  // Clear advanced values when range changes to force recalculation
  useEffect(() => {
    if (ramp.saturationStart !== undefined || ramp.saturationEnd !== undefined) {
      onUpdate({ 
        saturationStart: undefined, 
        saturationEnd: undefined 
      });
    }
  }, [ramp.saturationRange]);
  
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [, s] = baseColor.hsl();
      return roundToOneDecimal((s || 0.5) * 100);
    } catch {
      return 50;
    }
  };

  // Ensure all values are properly rounded
  const startValue = roundToOneDecimal(ramp.saturationStart ?? defaults.start);
  const endValue = roundToOneDecimal(ramp.saturationEnd ?? defaults.end);

  return (
    <div className="flex flex-col h-full">
      <GradientControl
        label="Saturation"
        startValue={startValue}
        endValue={endValue}
        min={0}
        max={100}
        onValuesChange={(start, end) => onUpdate({ 
          saturationStart: roundToOneDecimal(start), 
          saturationEnd: roundToOneDecimal(end) 
        })}
        formatValue={(v) => `${roundToOneDecimal(v)}%`}
        gradientColors={generateSaturationGradient(ramp.baseColor)}
        referenceValue={getReferenceValue()}
        referenceColor={ramp.baseColor}
        className="h-full flex-1"
        invertValues={true}
        totalSteps={ramp.totalSteps}
        scaleType={ramp.saturationScaleType}
      />
    </div>
  );
};

export default SaturationSlider;
