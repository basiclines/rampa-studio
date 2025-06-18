import React, { useEffect } from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateHueGradient, calculateAdvancedDefaults } from '@/engine/GradientEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { cn } from '@/engine/utils';
import { useSetChromaGradient } from '@/usecases/SetChromaGradient';

interface HueSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  className?: string;
}

const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

const HueSlider: React.FC<HueSliderProps> = ({ ramp, onUpdate, className }) => {
  const defaults = calculateAdvancedDefaults(ramp.baseColor, 'hue', ramp.chromaRange);
  
  // Clear advanced values when range changes to force recalculation
  useEffect(() => {
    if (ramp.chromaStart !== undefined || ramp.chromaEnd !== undefined) {
      onUpdate({ 
        chromaStart: undefined, 
        chromaEnd: undefined 
      });
    }
  }, [ramp.chromaRange]);
  
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [h] = baseColor.hsl();
      const baseHue = h || 0;
      // Map the 0-360 hue to the gradient position (0-360 scale)
      return roundToOneDecimal(baseHue);
    } catch {
      return 0;
    }
  };

  // Ensure all values are properly rounded
  const startValue = roundToOneDecimal(ramp.chromaStart ?? defaults.start);
  const endValue = roundToOneDecimal(ramp.chromaEnd ?? defaults.end);

  const setChromaGradient = useSetChromaGradient();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <GradientControl
        label="Hue"
        startValue={startValue}
        endValue={endValue}
        min={-180}
        max={180}
        onValuesChange={(start, end) => setChromaGradient(ramp.id, roundToOneDecimal(start), roundToOneDecimal(end))}
        formatValue={(v) => `${roundToOneDecimal(v)}°`}
        gradientColors={generateHueGradient(ramp.baseColor)}
        referenceValue={getReferenceValue()}
        referenceColor={ramp.baseColor}
        className="h-full flex-1"
        totalSteps={ramp.totalSteps}
        scaleType={ramp.hueScaleType}
      />
    </div>
  );
};

export default HueSlider;
