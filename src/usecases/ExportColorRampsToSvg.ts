import { useSaveColorRamp } from '@/state/SaveColorRampState';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ExportEngine } from '@/engine/ExportEngine';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

export function exportColorRampsToSvg(colorRamps: ColorRampConfig[]): string {
  const allColors = colorRamps.map(ramp => ({
    name: ramp.name,
    colors: generateColorRamp(ramp),
  }));
  
  return ExportEngine.exportToSvg(allColors);
}

export function useExportColorRampsToSvg() {
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    const svgContent = exportColorRampsToSvg(colorRamps);
    navigator.clipboard.writeText(svgContent);
    
    return svgContent;
  };
} 