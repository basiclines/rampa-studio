
import React from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateHueGradient, calculateAdvancedDefaults } from '@/lib/gradientUtils';

interface ColorRampConfig {
  baseColor: string;
  chromaRange: number;
  chromaStart?: number;
  chromaEnd?: number;
}

interface HueSliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
}

const HueSlider: React.FC<HueSliderProps> = ({ ramp, onUpdate }) => {
  const defaults = calculateAdvancedDefaults(ramp.baseColor, 'hue', ramp.chromaRange);
  
  const getReferenceValue = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [h] = baseColor.hsl();
      const baseHue = h || 0;
      // Map the 0-360 hue to the gradient position (0-360 scale)
      return baseHue;
    } catch {
      return 0;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <GradientControl
        label="Hue"
        startValue={ramp.chromaStart ?? defaults.start}
        endValue={ramp.chromaEnd ?? defaults.end}
        min={-180}
        max={180}
        onValuesChange={(start, end) => onUpdate({ chromaStart: start, chromaEnd: end })}
        formatValue={(v) => `${Math.round(v)}°`}
        gradientColors={generateHueGradient(ramp.baseColor)}
        referenceValue={getReferenceValue()}
        referenceColor={ramp.baseColor}
        className="h-full flex-1"
      />
    </div>
  );
};

export default HueSlider;
