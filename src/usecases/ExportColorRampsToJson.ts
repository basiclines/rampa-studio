import { useSaveColorRamp } from './SaveColorRamp';
import chroma from 'chroma-js';

function formatColor(color: string, format: 'hex' | 'hsl') {
  if (format === 'hsl') {
    const [h, s, l] = chroma(color).hsl();
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }
  return color;
}

export function useExportColorRampsToJson() {
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    const rampsWithFormattedColors = colorRamps.map(ramp => {
      const colorFormat = ramp.colorFormat || 'hex';
      return {
        ...ramp,
        swatches: ramp.swatches.map(swatch => ({
          ...swatch,
          color: formatColor(swatch.color, colorFormat)
        }))
      };
    });
    const jsonContent = JSON.stringify(rampsWithFormattedColors, null, 2);
    navigator.clipboard.writeText(jsonContent);
    return jsonContent;
  };
} 