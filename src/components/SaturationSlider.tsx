
import React from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateSaturationGradient, calculateAdvancedDefaults } from '@/lib/gradientUtils';

interface ColorRampConfig {
  baseColor: string;
  saturationRange: number;
  saturationStart?: number;
  saturationEnd?: number;
}

interface SaturationSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
}

const SaturationSlider: React.FC<SaturationSliderProps> = ({ ramp, onUpdate }) => {
  const defaults = calculateAdvancedDefaults(ramp.baseColor, 'saturation', ramp.saturationRange);
  
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [, s] = baseColor.hsl();
      return (s || 0.5) * 100;
    } catch {
      return 50;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <GradientControl
        label="Saturation"
        startValue={ramp.saturationStart ?? defaults.start}
        endValue={ramp.saturationEnd ?? defaults.end}
        min={0}
        max={100}
        onValuesChange={(start, end) => onUpdate({ saturationStart: start, saturationEnd: end })}
        formatValue={(v) => `${Math.round(v * 10) / 10}%`}
        gradientColors={generateSaturationGradient(ramp.baseColor)}
        referenceValue={getReferenceValue()}
        referenceColor={ramp.baseColor}
        className="h-full flex-1"
        invertValues={true}
      />
    </div>
  );
};

export default SaturationSlider;
