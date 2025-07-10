import React from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateHueGradient } from '@/engine/GradientEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { cn, roundToOneDecimal } from '@/engine/utils';
import { useSetChromaGradient } from '@/usecases/SetChromaGradient';

interface HueSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  className?: string;
}

const HueSlider: React.FC<HueSliderProps> = ({ ramp, onUpdate, className }) => {
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [h] = baseColor.hsl();
      const baseHue = h || 0;
      return roundToOneDecimal(baseHue);
    } catch {
      return 0;
    }
  };

  const setChromaGradient = useSetChromaGradient();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <GradientControl
        label="Hue"
        startValue={roundToOneDecimal(ramp.chromaStart)}
        endValue={roundToOneDecimal(ramp.chromaEnd)}
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
