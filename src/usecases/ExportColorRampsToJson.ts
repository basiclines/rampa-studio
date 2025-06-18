import { useSaveColorRamp } from './SaveColorRamp';
import { generateColorRamp } from '@/engine/ColorEngine';

export function useExportColorRampsToJson() {
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    const rampsWithGeneratedColors = colorRamps.map(ramp => {
      const generatedColors = generateColorRamp(ramp);
      return {
        ...ramp,
        swatches: ramp.swatches.map((swatch, index) => ({
          ...swatch,
          color: generatedColors[index]
        }))
      };
    });
    
    const jsonContent = JSON.stringify(rampsWithGeneratedColors, null, 2);
    navigator.clipboard.writeText(jsonContent);
    return jsonContent;
  };
} 