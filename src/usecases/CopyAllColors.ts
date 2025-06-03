import { generateColorRamp } from '@/lib/colorUtils';
import { ColorRampConfig } from '@/entities/ColorRamp';

export function useCopyAllColors() {
  return (ramp: ColorRampConfig) => {
    const colors = generateColorRamp(ramp);
    const colorString = colors.join('\n');
    navigator.clipboard.writeText(colorString);
    return colors;
  };
} 