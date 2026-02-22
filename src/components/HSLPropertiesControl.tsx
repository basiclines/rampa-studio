import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import SegmentedControl from './SegmentedControl';
import LabeledSlider from './ui/LabeledSlider';
import LightnessSlider from './LightnessSlider';
import HueSlider from './HueSlider';
import SaturationSlider from './SaturationSlider';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import StepSlider from './ui/StepSlider';

interface HSLPropertiesControlProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  onScaleTypeChange: (scaleType: string) => void;
  previewScaleType?: string | null;
  setPreviewScaleType?: (type: string | null) => void;
}

const SCALE_TYPES = [
  { value: 'linear', label: 'Linear' },
  { value: 'geometric', label: 'Geometric' },
  { value: 'fibonacci', label: 'Fibonacci' },
  { value: 'logarithmic', label: 'Logarithmic' },
  { value: 'powers-of-2', label: 'Powers of 2' },
  { value: 'musical-ratio', label: 'Musical Ratio' },
  { value: 'ease-in', label: 'Ease-in' },
  { value: 'ease-out', label: 'Ease-out' },
  { value: 'ease-in-out', label: 'Ease-in-out' },
];

const HSLPropertiesControl: React.FC<HSLPropertiesControlProps> = ({
  ramp,
  onUpdate,
  onScaleTypeChange,
  previewScaleType,
  setPreviewScaleType,
}) => {
  // Use a single value for all three scale types (default to lightness or linear)
  const unifiedScaleType = ramp.lightnessScaleType || ramp.hueScaleType || ramp.saturationScaleType || 'linear';

  // The scale type to use for preview (hovered or actual)
  const previewType = previewScaleType || unifiedScaleType;

  const handleScaleTypeChange = (value: string) => {
    onScaleTypeChange(value);
    setPreviewScaleType && setPreviewScaleType(null); // clear preview after selection
  };

  return (
    <div className="pb-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Distribution</div>
      </div>
      {/* Unified scale type selector with hover preview */}
      <div className="mb-4">
        <StepSlider
          options={SCALE_TYPES}
          value={unifiedScaleType}
          onChange={handleScaleTypeChange}
          onPreview={setPreviewScaleType}
          ariaLabel="Scale Type"
        />
      </div>
      {/* Sliders */}
      <div className="flex flex-row w-full flex-1" style={{ minHeight: 200 }}>
        <HueSlider
          ramp={{ ...ramp, hueScaleType: previewType }}
          onUpdate={onUpdate}
          className="flex-1 h-full"
        />
        <SaturationSlider
          ramp={{ ...ramp, saturationScaleType: previewType }}
          onUpdate={onUpdate}
          className="flex-1 h-full"
        />
        <LightnessSlider
          ramp={{ ...ramp, lightnessScaleType: previewType }}
          onUpdate={onUpdate}
          className="flex-1 h-full"
        />
      </div>
    </div>
  );
};

export default HSLPropertiesControl; 