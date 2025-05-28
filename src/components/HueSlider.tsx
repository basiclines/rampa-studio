
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

const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

const HueSlider: React.FC<HueSliderProps> = ({ ramp, onUpdate }) => {
  const defaults = calculateAdvancedDefaults(ramp.baseColor, 'hue', ramp.chromaRange);
  
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

  return (
    <div className="flex flex-col h-full">
      <GradientControl
        label="Hue"
        startValue={startValue}
        endValue={endValue}
        min={-180}
        max={180}
        onValuesChange={(start, end) => onUpdate({ 
          chromaStart: roundToOneDecimal(start), 
          chromaEnd: roundToOneDecimal(end) 
        })}
        formatValue={(v) => `${roundToOneDecimal(v)}°`}
        gradientColors={generateHueGradient(ramp.baseColor)}
        referenceValue={getReferenceValue()}
        referenceColor={ramp.baseColor}
        className="h-full flex-1"
      />
    </div>
  );
};

export default HueSlider;
