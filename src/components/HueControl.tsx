import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import SegmentedControl from './SegmentedControl';
import { ColorRampConfig } from '@/types/colorRamp';

const HueControl = ({
  ramp,
  onUpdate,
  calculateAdvancedDefaults,
  resetAttribute,
  setHueScale,
  hueScale,
  IMPLEMENTED_SCALES,
  SCALE_TYPES,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>
        {ramp.chromaAdvanced ? 'Hue Range' : `Hue Shift: ${Math.round(ramp.chromaRange)}°`}
      </Label>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => resetAttribute('hue')}
          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
        >
          <span className="sr-only">Reset</span>
          ↺
        </Button>
        <SegmentedControl
          value={ramp.chromaAdvanced ? 'gradient' : 'simple'}
          onChange={mode => {
            if (mode === 'simple') {
              onUpdate({ chromaAdvanced: false });
            } else if (mode === 'gradient') {
              const updates: Partial<ColorRampConfig> = { chromaAdvanced: true };
              const defaults = calculateAdvancedDefaults('hue');
              updates.chromaStart = ramp.chromaStart ?? defaults.start;
              updates.chromaEnd = ramp.chromaEnd ?? defaults.end;
              onUpdate(updates);
            }
          }}
        />
      </div>
    </div>
    {ramp.chromaAdvanced ? (
      <>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Start</Label>
            <Input
              type="number"
              value={ramp.chromaStart ?? calculateAdvancedDefaults('hue').start}
              onChange={e => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onUpdate({ chromaStart: 0 });
                  return;
                }
                const value = parseFloat(inputValue);
                if (!isNaN(value)) {
                  const roundedValue = Math.round(value);
                  onUpdate({ chromaStart: roundedValue });
                }
              }}
              step={1}
              className="text-center text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">End</Label>
            <Input
              type="number"
              value={ramp.chromaEnd ?? calculateAdvancedDefaults('hue').end}
              onChange={e => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onUpdate({ chromaEnd: 0 });
                  return;
                }
                const value = parseFloat(inputValue);
                if (!isNaN(value)) {
                  const roundedValue = Math.round(value);
                  onUpdate({ chromaEnd: roundedValue });
                }
              }}
              step={1}
              className="text-center text-xs"
            />
          </div>
        </div>
        <div className="mt-2">
          <Label className="text-xs">Scale Type</Label>
          <select
            className="w-full border rounded px-2 py-1 text-xs mt-1"
            value={hueScale}
            onChange={e => {
              setHueScale(e.target.value);
              onUpdate({ hueScaleType: e.target.value });
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
        <Slider
          value={[ramp.chromaRange]}
          onValueChange={([value]) => {
            const roundedValue = Math.round(value);
            onUpdate({ chromaRange: roundedValue });
          }}
          max={180}
          min={-180}
          step={1}
          className="flex-1"
        />
        <Input
          type="number"
          value={Math.round(ramp.chromaRange)}
          onChange={e => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value) && value >= -180 && value <= 180) {
              const roundedValue = Math.round(value);
              onUpdate({ chromaRange: roundedValue });
            }
          }}
          min={-180}
          max={180}
          step={1}
          className="w-16 text-center"
        />
      </div>
    )}
  </div>
);

export default HueControl; 