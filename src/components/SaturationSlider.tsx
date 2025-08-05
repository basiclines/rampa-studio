import React from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateSaturationGradient } from '@/engine/GradientEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { cn, roundToOneDecimal } from '@/engine/utils';
import { useSetSaturationGradient } from '@/usecases/SetSaturationGradient';

interface SaturationSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  className?: string;
}

const SaturationSlider: React.FC<SaturationSliderProps> = ({ ramp, onUpdate, className }) => {
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [, s] = baseColor.hsl();
      return roundToOneDecimal((s || 0.5) * 100);
    } catch {
      return 50;
    }
  };

  const setSaturationGradient = useSetSaturationGradient();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <GradientControl
        label={ramp.colorFormat === 'oklch' ? 'Chroma' : 'Saturation'}
        startValue={roundToOneDecimal(ramp.saturationStart)}
        endValue={roundToOneDecimal(ramp.saturationEnd)}
        min={0}
        max={100}
        onValuesChange={(start, end) => setSaturationGradient(ramp.id, roundToOneDecimal(start), roundToOneDecimal(end))}
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
