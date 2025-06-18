import { useSaveColorRamp } from './SaveColorRamp';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ExportEngine } from '@/engine/ExportEngine';

export function useExportColorRampsToSvg() {
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    const allColors = colorRamps.map(ramp => ({
      name: ramp.name,
      colors: generateColorRamp(ramp),
    }));
    
    const svgContent = ExportEngine.exportToSvg(allColors);
    navigator.clipboard.writeText(svgContent);
    
    return svgContent;
  };
} 