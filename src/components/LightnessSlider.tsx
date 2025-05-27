
import React from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateLightnessGradient, calculateAdvancedDefaults } from '@/lib/gradientUtils';

interface ColorRampConfig {
  baseColor: string;
  lightnessRange: number;
  lightnessStart?: number;
  lightnessEnd?: number;
}

interface LightnessSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
}

const LightnessSlider: React.FC<LightnessSliderProps> = ({ ramp, onUpdate }) => {
  const defaults = calculateAdvancedDefaults(ramp.baseColor, 'lightness', ramp.lightnessRange);
  
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [, , l] = baseColor.hsl();
      return (l || 0.5) * 100;
    } catch {
      return 50;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <GradientControl
        label="Lightness"
        startValue={ramp.lightnessStart ?? defaults.start}
        endValue={ramp.lightnessEnd ?? defaults.end}
        min={0}
        max={100}
        onValuesChange={(start, end) => onUpdate({ lightnessStart: start, lightnessEnd: end })}
        formatValue={(v) => `${Math.round(v * 10) / 10}%`}
        gradientColors={generateLightnessGradient(ramp.baseColor)}
        referenceValue={getReferenceValue()}
        referenceColor={ramp.baseColor}
        className="h-full flex-1"
      />
    </div>
  );
};

export default LightnessSlider;
