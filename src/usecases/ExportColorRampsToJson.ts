import { useSaveColorRamp } from '@/state/SaveColorRampState';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

export function exportColorRampsToJson(colorRamps: ColorRampConfig[]): string {
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
  
  return JSON.stringify(rampsWithGeneratedColors, null, 2);
}

export function useExportColorRampsToJson() {
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    const jsonContent = exportColorRampsToJson(colorRamps);
    navigator.clipboard.writeText(jsonContent);
    return jsonContent;
  };
} 