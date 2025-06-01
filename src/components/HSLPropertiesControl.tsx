import React from 'react';
import { Label } from '@/components/ui/label';
import SegmentedControl from './SegmentedControl';
import LabeledSlider from './LabeledSlider';
import LightnessSlider from './LightnessSlider';
import HueSlider from './HueSlider';
import SaturationSlider from './SaturationSlider';
import { ColorRampConfig } from '@/types/colorRamp';

interface HSLPropertiesControlProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  lightnessScale: string;
  setLightnessScale: (scale: string) => void;
  hueScale: string;
  setHueScale: (scale: string) => void;
  saturationScale: string;
  setSaturationScale: (scale: string) => void;
}

const HSLPropertiesControl: React.FC<HSLPropertiesControlProps> = ({
  ramp,
  onUpdate,
  lightnessScale,
  setLightnessScale,
  hueScale,
  setHueScale,
  saturationScale,
  setSaturationScale,
}) => {
  // Unified advanced mode: if any advanced is on, all are on
  const isAdvanced = ramp.lightnessAdvanced || ramp.chromaAdvanced || ramp.saturationAdvanced;

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
        <div className="flex flex-row w-full flex-1 h-0">
          <HueSlider ramp={ramp} onUpdate={onUpdate} className="flex-1 h-full" />
          <SaturationSlider ramp={ramp} onUpdate={onUpdate} className="flex-1 h-full" />
          <LightnessSlider ramp={ramp} onUpdate={onUpdate} className="flex-1 h-full" />
        </div>
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