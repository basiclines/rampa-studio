import React, { useEffect } from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateLightnessGradient, calculateAdvancedDefaults } from '@/engine/GradientEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { cn } from '@/engine/utils';
import { useSetLightnessGradient } from '@/usecases/SetLightnessGradient';

interface LightnessSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  className?: string;
}

const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

const LightnessSlider: React.FC<LightnessSliderProps> = ({ ramp, onUpdate, className }) => {
  const defaults = calculateAdvancedDefaults(ramp.baseColor, 'lightness', ramp.lightnessRange);
  
  // Clear advanced values when range changes to force recalculation
  useEffect(() => {
    if (ramp.lightnessStart !== undefined || ramp.lightnessEnd !== undefined) {
      onUpdate({ 
        lightnessStart: undefined, 
        lightnessEnd: undefined 
      });
    }
  }, [ramp.lightnessRange]);
  
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [, , l] = baseColor.hsl();
      return roundToOneDecimal((l || 0.5) * 100);
    } catch {
      return 50;
    }
  };

  // Ensure all values are properly rounded
  const startValue = roundToOneDecimal(ramp.lightnessStart ?? defaults.start);
  const endValue = roundToOneDecimal(ramp.lightnessEnd ?? defaults.end);

  const setLightnessGradient = useSetLightnessGradient();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <GradientControl
        label="Lightness"
        startValue={startValue}
        endValue={endValue}
        min={0}
        max={100}
        onValuesChange={(start, end) => setLightnessGradient(ramp.id, roundToOneDecimal(start), roundToOneDecimal(end))}
        formatValue={(v) => `${roundToOneDecimal(v)}%`}
        gradientColors={generateLightnessGradient(ramp.baseColor)}
        referenceValue={getReferenceValue()}
        referenceColor={ramp.baseColor}
        className="h-full flex-1"
        totalSteps={ramp.totalSteps}
        scaleType={ramp.lightnessScaleType}
      />
    </div>
  );
};

export default LightnessSlider;
