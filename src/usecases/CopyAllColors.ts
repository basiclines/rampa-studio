import { generateColorRamp } from '@/engine/ColorEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

export function useCopyAllColors() {
  return (ramp: ColorRampConfig) => {
    const colors = generateColorRamp(ramp);
    const colorString = colors.join('\n');
    navigator.clipboard.writeText(colorString);
    return colors;
  };
} 