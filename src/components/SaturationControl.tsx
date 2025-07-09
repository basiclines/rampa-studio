import React from 'react';
import { Label } from '@/components/ui/label';
import { ColorFormat } from '@/entities/ColorRampEntity';
import LabeledSlider from './ui/LabeledSlider';

interface SaturationControlProps {
  ramp: any;
  onUpdate: (updates: any) => void;
  colorFormat?: ColorFormat;
}

const SaturationControl: React.FC<SaturationControlProps> = ({ ramp, onUpdate, colorFormat = 'hex' }) => {
  const isOklch = colorFormat === 'oklch';
  const label = isOklch ? 'Chroma' : 'Saturation';
  const ariaLabel = isOklch ? 'Chroma Range' : 'Saturation Range';

  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      <LabeledSlider
        value={Math.round((ramp.saturationRange || 0) * 10) / 10}
        onChange={value => onUpdate({ saturationRange: value })}
        min={0}
        max={100}
        step={0.1}
        formatValue={v => `${v}%`}
        ariaLabel={ariaLabel}
      />
    </div>
  );
};

export default SaturationControl; 