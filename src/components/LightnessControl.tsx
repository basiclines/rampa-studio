import React from 'react';
import { Label } from '@/components/ui/label';
import LabeledSlider from './ui/LabeledSlider';

const LightnessControl = ({ ramp, onUpdate }) => (
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
);

export default LightnessControl; 