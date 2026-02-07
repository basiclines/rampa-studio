import type { RampOutput } from '../formatters/types';
import { computeApca, getPassingLevels, APCA_LEVELS, type ApcaLevel } from './apca';

export interface ColorRef {
  ramp: string;
  index: number;
  color: string;
}

export interface ContrastPair {
  fg: ColorRef;
  bg: ColorRef;
  lc: number;
}

export interface AccessibilityLevel {
  id: string;
  name: string;
  minLc: number;
  pairs: ContrastPair[];
}

export interface AccessibilityReport {
  totalPairs: number;
  passingPairs: number;
  levels: AccessibilityLevel[];
}

// Build a flat list of all colors with their ramp reference.
function collectColors(ramps: RampOutput[]): ColorRef[] {
  const refs: ColorRef[] = [];
  for (const ramp of ramps) {
    for (let i = 0; i < ramp.colors.length; i++) {
      refs.push({ ramp: ramp.name, index: i, color: ramp.colors[i] });
    }
  }
  return refs;
}

export function generateAccessibilityReport(ramps: RampOutput[]): AccessibilityReport {
  const colors = collectColors(ramps);
  const totalPairs = colors.length * (colors.length - 1); // exclude self-pairs

  // Initialize levels with empty arrays
  const levelMap = new Map<string, ContrastPair[]>();
  for (const level of APCA_LEVELS) {
    levelMap.set(level.id, []);
  }

  const seenPassing = new Set<string>();

  // Check all ordered pairs (fg, bg) excluding self
  // Each pair is assigned only to its highest passing level
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < colors.length; j++) {
      if (i === j) continue;

      const fg = colors[i];
      const bg = colors[j];
      const lc = computeApca(fg.color, bg.color);
      const passing = getPassingLevels(lc);

      if (passing.length > 0) {
        const key = `${i}:${j}`;
        seenPassing.add(key);

        const pair: ContrastPair = {
          fg,
          bg,
          lc: Math.round(lc * 100) / 100,
        };

        // APCA_LEVELS is sorted highest-first, so passing[0] is the highest level
        const highest = passing[0];
        levelMap.get(highest.id)!.push(pair);
      }
    }
  }

  const levels: AccessibilityLevel[] = APCA_LEVELS.map(level => ({
    id: level.id,
    name: level.name,
    minLc: level.minLc,
    pairs: levelMap.get(level.id)!,
  }));

  return {
    totalPairs,
    passingPairs: seenPassing.size,
    levels,
  };
}
