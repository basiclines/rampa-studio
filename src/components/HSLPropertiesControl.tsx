import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import SegmentedControl from './SegmentedControl';
import LabeledSlider from './ui/LabeledSlider';
import LightnessSlider from './LightnessSlider';
import HueSlider from './HueSlider';
import SaturationSlider from './SaturationSlider';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import StepSlider from './ui/StepSlider';
import { useSetLightnessRange } from '@/usecases/SetLightnessRange';
import { useSetChromaRange } from '@/usecases/SetChromaRange';
import { useSetSaturationRange } from '@/usecases/SetSaturationRange';

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
  // Unified advanced mode: if any advanced is on, all are on
  const isAdvanced = ramp.lightnessAdvanced || ramp.chromaAdvanced || ramp.saturationAdvanced;

  // Use a single value for all three scale types (default to lightness or linear)
  const unifiedScaleType = ramp.lightnessScaleType || ramp.hueScaleType || ramp.saturationScaleType || 'linear';

  // The scale type to use for preview (hovered or actual)
  const previewType = previewScaleType || unifiedScaleType;

  const handleScaleTypeChange = (value: string) => {
    onScaleTypeChange(value);
    setPreviewScaleType && setPreviewScaleType(null); // clear preview after selection
  };

  const handleModeChange = (mode: 'simple' | 'gradient') => {
    if (mode === 'simple') {
      onUpdate({
        lightnessAdvanced: false,
        chromaAdvanced: false,
        saturationAdvanced: false,
      });
    } else {
      onUpdate({
        lightnessAdvanced: true,
        chromaAdvanced: true,
        saturationAdvanced: true,
      });
    }
  };

  const handleSetLightnessRange = useSetLightnessRange();
  const handleSetChromaRange = useSetChromaRange();
  const handleSetSaturationRange = useSetSaturationRange();

  return (
    <div className="pb-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Distribution</div>
        <SegmentedControl value={isAdvanced ? 'gradient' : 'simple'} onChange={handleModeChange} />
      </div>
      {isAdvanced ? (
        <>
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
          <div className="flex flex-row w-full flex-1 h-0">
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
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1 block">Hue</Label>
            <LabeledSlider
              value={Math.round((ramp.chromaRange || 0))}
              onChange={value => handleSetChromaRange(ramp.id, value)}
              min={-180}
              max={180}
              step={1}
              formatValue={v => `${v}°`}
              ariaLabel="Hue Shift"
            />
          </div>
          <div>
            <Label className="mb-1 block">Saturation</Label>
            <LabeledSlider
              value={Math.round((ramp.saturationRange || 0) * 10) / 10}
              onChange={value => handleSetSaturationRange(ramp.id, value)}
              min={0}
              max={100}
              step={0.1}
              formatValue={v => `${v}%`}
              ariaLabel="Saturation Range"
            />
          </div>
          <div>
            <Label className="mb-1 block">Lightness</Label>
            <LabeledSlider
              value={Math.round((ramp.lightnessRange || 0) * 10) / 10}
              onChange={value => handleSetLightnessRange(ramp.id, value)}
              min={0}
              max={100}
              step={0.1}
              formatValue={v => `${v}%`}
              ariaLabel="Lightness Range"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HSLPropertiesControl; 