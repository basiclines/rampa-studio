import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import SegmentedControl from './SegmentedControl';
import { ColorRampConfig } from '@/types/colorRamp';
import LabeledSlider from './LabeledSlider';

const SaturationControl = ({
  ramp,
  onUpdate,
  calculateAdvancedDefaults,
  resetAttribute,
  setSaturationScale,
  saturationScale,
  IMPLEMENTED_SCALES,
  SCALE_TYPES,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>
        Saturation
      </Label>
      <div className="flex gap-1">
        <SegmentedControl
          value={ramp.saturationAdvanced ? 'gradient' : 'simple'}
          onChange={mode => {
            if (mode === 'simple') {
              onUpdate({ saturationAdvanced: false });
            } else if (mode === 'gradient') {
              const updates: Partial<ColorRampConfig> = { saturationAdvanced: true };
              const defaults = calculateAdvancedDefaults('saturation');
              updates.saturationStart = ramp.saturationStart ?? defaults.start;
              updates.saturationEnd = ramp.saturationEnd ?? defaults.end;
              onUpdate(updates);
            }
          }}
        />
      </div>
    </div>
    {ramp.saturationAdvanced ? (
      <>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Start (%)</Label>
            <Input
              type="number"
              value={ramp.saturationStart ?? calculateAdvancedDefaults('saturation').start}
              onChange={e => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onUpdate({ saturationStart: 0 });
                  return;
                }
                const value = parseFloat(inputValue);
                if (!isNaN(value)) {
                  const roundedValue = Math.round(value * 10) / 10;
                  onUpdate({ saturationStart: roundedValue });
                }
              }}
              step={0.1}
              className="text-center text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">End (%)</Label>
            <Input
              type="number"
              value={ramp.saturationEnd ?? calculateAdvancedDefaults('saturation').end}
              onChange={e => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onUpdate({ saturationEnd: 0 });
                  return;
                }
                const value = parseFloat(inputValue);
                if (!isNaN(value)) {
                  const roundedValue = Math.round(value * 10) / 10;
                  onUpdate({ saturationEnd: roundedValue });
                }
              }}
              step={0.1}
              className="text-center text-xs"
            />
          </div>
        </div>
        <div className="mt-2">
          <Label className="text-xs">Scale Type</Label>
          <select
            className="w-full border rounded px-2 py-1 text-xs mt-1"
            value={saturationScale}
            onChange={e => {
              setSaturationScale(e.target.value);
              onUpdate({ saturationScaleType: e.target.value });
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
          value={Math.round(ramp.saturationRange * 10) / 10}
          onChange={value => onUpdate({ saturationRange: value })}
          min={0}
          max={100}
          step={0.1}
          formatValue={v => `${v}%`}
          ariaLabel="Saturation Range"
        />
      </div>
    )}
  </div>
);

export default SaturationControl; 