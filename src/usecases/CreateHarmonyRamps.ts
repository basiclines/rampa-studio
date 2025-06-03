import { ColorRampConfig } from '@/entities/ColorRamp';
import { useSaveColorRamp } from './SaveColorRamp';
import {
  getAnalogousColors,
  getTriadColors,
  getComplementaryColors,
  getSplitComplementaryColors,
  getSquareColors,
  getCompoundColors,
} from '@/lib/colorUtils';
import { ColorSwatch } from '@/entities/ColorSwatch';
import { DEFAULT_NEW_RAMP_VALUES } from '@/config/DefaultColorRampValues';

export type HarmonyType = 'analogous' | 'triad' | 'complementary' | 'split-complementary' | 'square' | 'compound';

export function useCreateHarmonyRamps() {
  const updateColorRamps = useSaveColorRamp(state => state.updateColorRamps);

  return (baseRamp: ColorRampConfig, harmonyType: HarmonyType) => {
    let harmonyColors: string[] = [];
    let namePrefix = '';

    switch (harmonyType) {
      case 'analogous':
        harmonyColors = getAnalogousColors(baseRamp.baseColor, 2).slice(1);
        namePrefix = 'Analogue';
        break;
      case 'triad':
        harmonyColors = getTriadColors(baseRamp.baseColor).slice(1);
        namePrefix = 'Triad';
        break;
      case 'complementary':
        harmonyColors = getComplementaryColors(baseRamp.baseColor).slice(1);
        namePrefix = 'Complementary';
        break;
      case 'split-complementary':
        harmonyColors = getSplitComplementaryColors(baseRamp.baseColor).slice(1);
        namePrefix = 'Split Comp.';
        break;
      case 'square':
        harmonyColors = getSquareColors(baseRamp.baseColor).slice(1);
        namePrefix = 'Square';
        break;
      case 'compound':
        harmonyColors = getCompoundColors(baseRamp.baseColor).slice(1);
        namePrefix = 'Compound';
        break;
    }

    updateColorRamps(prev => {
      const baseIndex = prev.findIndex(r => r.id === baseRamp.id);
      const newRamps = harmonyColors.map((color, i) => {
        const swatches: ColorSwatch[] = Array.from({ length: baseRamp.totalSteps }, (_, idx) => ({
          color,
          index: idx,
          locked: false
        }));
        return {
          ...baseRamp,
          id: Date.now().toString() + '-' + harmonyType.charAt(0) + i,
          name: `${namePrefix} ${i + 1}`,
          baseColor: color,
          swatches,
        };
      });

      return [
        ...prev.slice(0, baseIndex + 1),
        ...newRamps,
        ...prev.slice(baseIndex + 1),
      ];
    });
  };
} 