import { useColorRampsStore } from './ColorRampsStore';
import { generateColorRamp, exportToSvg } from '@/lib/colorUtils';

export function useExportColorRampsToSvg() {
  const colorRamps = useColorRampsStore(state => state.colorRamps);

  return () => {
    const allColors = colorRamps.map(ramp => ({
      name: ramp.name,
      colors: generateColorRamp(ramp),
    }));
    
    const svgContent = exportToSvg(allColors);
    navigator.clipboard.writeText(svgContent);
    
    return svgContent;
  };
} 