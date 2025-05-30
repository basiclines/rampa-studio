import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import SegmentedControl from './SegmentedControl';
import { ColorRampConfig } from '@/types/colorRamp';
import LabeledSlider from './LabeledSlider';

const LightnessControl = ({
  ramp,
  onUpdate,
  calculateAdvancedDefaults,
  resetAttribute,
  setLightnessScale,
  lightnessScale,
  IMPLEMENTED_SCALES,
  SCALE_TYPES,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>
        Lightness
      </Label>
      <div className="flex gap-1">
        <SegmentedControl
          value={ramp.lightnessAdvanced ? 'gradient' : 'simple'}
          onChange={mode => {
            if (mode === 'simple') {
              onUpdate({ lightnessAdvanced: false });
            } else if (mode === 'gradient') {
              const updates: Partial<ColorRampConfig> = { lightnessAdvanced: true };
              const defaults = calculateAdvancedDefaults('lightness');
              updates.lightnessStart = ramp.lightnessStart ?? defaults.start;
              updates.lightnessEnd = ramp.lightnessEnd ?? defaults.end;
              onUpdate(updates);
            }
          }}
        />
      </div>
    </div>
    {ramp.lightnessAdvanced ? (
      <>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Start (%)</Label>
            <Input
              type="number"
              value={ramp.lightnessStart ?? calculateAdvancedDefaults('lightness').start}
              onChange={e => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onUpdate({ lightnessStart: 0 });
                  return;
                }
                const value = parseFloat(inputValue);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  const roundedValue = Math.round(value * 10) / 10;
                  onUpdate({ lightnessStart: roundedValue });
                }
              }}
              min={0}
              max={100}
              step={0.1}
              className="text-center text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">End (%)</Label>
            <Input
              type="number"
              value={ramp.lightnessEnd ?? calculateAdvancedDefaults('lightness').end}
              onChange={e => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onUpdate({ lightnessEnd: 0 });
                  return;
                }
                const value = parseFloat(inputValue);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  const roundedValue = Math.round(value * 10) / 10;
                  onUpdate({ lightnessEnd: roundedValue });
                }
              }}
              min={0}
              max={100}
              step={0.1}
              className="text-center text-xs"
            />
          </div>
        </div>
        <div className="mt-2">
          <Label className="text-xs">Scale Type</Label>
          <select
            className="w-full border rounded px-2 py-1 text-xs mt-1"
            value={lightnessScale}
            onChange={e => {
              setLightnessScale(e.target.value);
              onUpdate({ lightnessScaleType: e.target.value });
            }}
          >
            {SCALE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}{!IMPLEMENTED_SCALES.includes(type.value) ? ' (soon)' : ''}</option>
            ))}
          </select>
        </div>
      </>
    ) : (
      <div className="flex gap-2 items-center">
        <LabeledSlider
          value={Math.round(ramp.lightnessRange * 10) / 10}
          onChange={value => onUpdate({ lightnessRange: value })}
          min={0}
          max={100}
          step={0.1}
          formatValue={v => `${v}%`}
          ariaLabel="Lightness Range"
        />
      </div>
    )}
  </div>
);

export default LightnessControl; 