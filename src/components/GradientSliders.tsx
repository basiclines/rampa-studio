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
  return (
    <div className="flex gap-2 h-full min-h-[400px]">
      <LightnessSlider ramp={ramp} onUpdate={onUpdate} />
      <HueSlider ramp={ramp} onUpdate={onUpdate} />
      <SaturationSlider ramp={ramp} onUpdate={onUpdate} />
    </div>
  );
};

export default GradientSliders;
