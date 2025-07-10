import React from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateLightnessGradient } from '@/engine/GradientEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { cn, roundToOneDecimal } from '@/engine/utils';
import { useSetLightnessGradient } from '@/usecases/SetLightnessGradient';

interface LightnessSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  className?: string;
}

const LightnessSlider: React.FC<LightnessSliderProps> = ({ ramp, onUpdate, className }) => {
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [, , l] = baseColor.hsl();
      return roundToOneDecimal((l || 0.5) * 100);
    } catch {
      return 50;
    }
  };

  const setLightnessGradient = useSetLightnessGradient();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <GradientControl
        label="Lightness"
        startValue={roundToOneDecimal(ramp.lightnessStart)}
        endValue={roundToOneDecimal(ramp.lightnessEnd)}
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
