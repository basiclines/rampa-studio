import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { SaveColorRampState } from '@/state/SaveColorRampState';
import {
  getAnalogousColors,
  getTriadColors,
  getComplementaryColors,
  getSplitComplementaryColors,
  getSquareColors,
  getCompoundColors,
} from '@/engine/ColorEngine';
import { ColorSwatch } from '@/entities/ColorSwatchEntity';
import { DEFAULT_NEW_RAMP_VALUES } from '@/config/DefaultColorRampValues';

export type HarmonyType = 'analogous' | 'triad' | 'complementary' | 'split-complementary' | 'square' | 'compound';

export function createHarmonyRamps(
  colorRamps: ColorRampConfig[],
  baseRamp: ColorRampConfig,
  harmonyType: HarmonyType
): ColorRampConfig[] {
  let harmonyColors: string[] = [];
  let namePrefix = '';
  const mode = baseRamp.colorFormat === 'oklch' ? 'oklch' : 'hsl';

  switch (harmonyType) {
    case 'analogous':
      harmonyColors = getAnalogousColors(baseRamp.baseColor, 2, mode).slice(1);
      namePrefix = 'Analogue';
      break;
    case 'triad':
      harmonyColors = getTriadColors(baseRamp.baseColor, mode).slice(1);
      namePrefix = 'Triad';
      break;
    case 'complementary':
      harmonyColors = getComplementaryColors(baseRamp.baseColor, mode).slice(1);
      namePrefix = 'Complementary';
      break;
    case 'split-complementary':
      harmonyColors = getSplitComplementaryColors(baseRamp.baseColor, mode).slice(1);
      namePrefix = 'Split Comp.';
      break;
    case 'square':
      harmonyColors = getSquareColors(baseRamp.baseColor, mode).slice(1);
      namePrefix = 'Square';
      break;
    case 'compound':
      harmonyColors = getCompoundColors(baseRamp.baseColor, mode).slice(1);
      namePrefix = 'Compound';
      break;
  }

  const baseIndex = colorRamps.findIndex(r => r.id === baseRamp.id);
  const newRamps = harmonyColors.map((color, i) => {
    const swatches: ColorSwatch[] = Array.from({ length: baseRamp.totalSteps }, (_, idx) => ({
      color,
      colorFormat: baseRamp.colorFormat,
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
    ...colorRamps.slice(0, baseIndex + 1),
    ...newRamps,
    ...colorRamps.slice(baseIndex + 1),
  ];
}

export const useCreateHarmonyRamps = () => SaveColorRampState(createHarmonyRamps); 