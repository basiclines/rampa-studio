
import React from 'react';
import LightnessSlider from '@/components/LightnessSlider';
import HueSlider from '@/components/HueSlider';
import SaturationSlider from '@/components/SaturationSlider';

interface ColorRampConfig {
  id: string;
  name: string;
  baseColor: string;
  totalSteps: number;
  lightnessRange: number;
  lightnessStart?: number;
  lightnessEnd?: number;
  lightnessAdvanced?: boolean;
  chromaRange: number;
  chromaStart?: number;
  chromaEnd?: number;
  chromaAdvanced?: boolean;
  saturationRange: number;
  saturationStart?: number;
  saturationEnd?: number;
  saturationAdvanced?: boolean;
  tintColor?: string;
  tintOpacity?: number;
  tintBlendMode?: 'normal' | 'multiply' | 'overlay';
  lockedColors: { [index: number]: string };
}

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
