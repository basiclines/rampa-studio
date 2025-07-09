import React from 'react';
import { Label } from '@/components/ui/label';
import { ColorFormat } from '@/entities/ColorRampEntity';
import LabeledSlider from './ui/LabeledSlider';

interface LightnessControlProps {
  ramp: any;
  onUpdate: (updates: any) => void;
  colorFormat?: ColorFormat;
}

const LightnessControl: React.FC<LightnessControlProps> = ({ ramp, onUpdate, colorFormat = 'hex' }) => (
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