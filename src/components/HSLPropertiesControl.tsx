import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import SegmentedControl from './SegmentedControl';
import LabeledSlider from './LabeledSlider';
import LightnessSlider from './LightnessSlider';
import HueSlider from './HueSlider';
import SaturationSlider from './SaturationSlider';
import { ColorRampConfig } from '@/types/colorRamp';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from './ui/select';

interface HSLPropertiesControlProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  lightnessScale: string;
  setLightnessScale: (scale: string) => void;
  hueScale: string;
  setHueScale: (scale: string) => void;
  saturationScale: string;
  setSaturationScale: (scale: string) => void;
  previewScaleType?: string | null;
  setPreviewScaleType?: (type: string | null) => void;
}

const SCALE_TYPES = [
  { value: 'linear', label: 'Linear' },
  { value: 'geometric', label: 'Geometric' },
  { value: 'fibonacci', label: 'Fibonacci' },
  { value: 'golden-ratio', label: 'Golden Ratio' },
  { value: 'logarithmic', label: 'Logarithmic' },
  { value: 'powers-of-2', label: 'Powers of 2' },
  { value: 'musical-ratio', label: 'Musical Ratio' },
  { value: 'cielab-uniform', label: 'CIELAB Uniform Steps' },
  { value: 'ease-in', label: 'Ease-in' },
  { value: 'ease-out', label: 'Ease-out' },
  { value: 'ease-in-out', label: 'Ease-in-out' },
];

const HSLPropertiesControl: React.FC<HSLPropertiesControlProps> = ({
  ramp,
  onUpdate,
  lightnessScale,
  setLightnessScale,
  hueScale,
  setHueScale,
  saturationScale,
  setSaturationScale,
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
    onUpdate({
      lightnessScaleType: value,
      hueScaleType: value,
      saturationScaleType: value,
    });
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

  return (
    <div className="pb-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Properties</div>
        <SegmentedControl value={isAdvanced ? 'gradient' : 'simple'} onChange={handleModeChange} />
      </div>
      {isAdvanced ? (
        <>
          {/* Unified scale type selector with hover preview */}
          <div className="mb-4">
            <Select
              value={unifiedScaleType}
              onValueChange={handleScaleTypeChange}
              onOpenChange={open => {
                if (!open && setPreviewScaleType) setPreviewScaleType(null);
              }}
            >
              <SelectTrigger className="w-full h-10 border border-gray-300 focus:border-blue-500 text-center text-gray-600 shadow-sm">
                <SelectValue placeholder="Select scale type" className="text-center text-gray-600" />
              </SelectTrigger>
              <SelectContent
                className="bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto z-50"
                onPointerLeave={() => setPreviewScaleType && setPreviewScaleType(null)}
              >
                {SCALE_TYPES.map(type => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    onPointerEnter={() => setPreviewScaleType && setPreviewScaleType(type.value)}
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onChange={value => onUpdate({ chromaRange: value })}
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
              onChange={value => onUpdate({ saturationRange: value })}
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
              onChange={value => onUpdate({ lightnessRange: value })}
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