import { useSaveColorRamp } from './SaveColorRamp';

export function useExportColorRampsToJson() {
  const colorRamps = useSaveColorRamp(state => state.colorRamps);

  return () => {
    const jsonContent = JSON.stringify(colorRamps, null, 2);
    navigator.clipboard.writeText(jsonContent);
    return jsonContent;
  };
} 