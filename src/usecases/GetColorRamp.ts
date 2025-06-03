import { ColorRampConfig } from '@/entities/ColorRamp';

export function getColorRamp(ramps: ColorRampConfig[], id: string): ColorRampConfig | undefined {
  return ramps.find(ramp => ramp.id === id);
} 