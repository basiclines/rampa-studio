import React from 'react';
import { Label } from '@/components/ui/label';
import LabeledSlider from './LabeledSlider';

const HueControl = ({ ramp, onUpdate }) => (
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
);

export default HueControl; 