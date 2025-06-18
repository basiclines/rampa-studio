import React from 'react';
import LightnessSlider from '@/components/LightnessSlider';
import HueSlider from '@/components/HueSlider';
import SaturationSlider from '@/components/SaturationSlider';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

interface GradientSlidersProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
}

const GradientSliders: React.FC<GradientSlidersProps> = ({ ramp, onUpdate }) => {
  const hasAdvancedMode = ramp.lightnessAdvanced || ramp.chromaAdvanced || ramp.saturationAdvanced;

  if (!hasAdvancedMode) {
    return null;
  }

  return (
    <div className="flex gap-2 h-full min-h-[400px]">
      {ramp.lightnessAdvanced && (
        <LightnessSlider ramp={ramp} onUpdate={onUpdate} />
      )}
      
      {ramp.chromaAdvanced && (
        <HueSlider ramp={ramp} onUpdate={onUpdate} />
      )}
      
      {ramp.saturationAdvanced && (
        <SaturationSlider ramp={ramp} onUpdate={onUpdate} />
      )}
    </div>
  );
};

export default GradientSliders;
