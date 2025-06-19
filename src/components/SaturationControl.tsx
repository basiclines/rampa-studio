import { Label } from '@/components/ui/label';
import LabeledSlider from './ui/LabeledSlider';

const SaturationControl = ({ ramp, onUpdate }) => (
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
);

export default SaturationControl; 