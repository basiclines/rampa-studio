import type { RampOutput } from '../formatters/types';
import { computeApca, getPassingLevels, APCA_LEVELS, type ApcaLevel } from './apca';
import chroma from 'chroma-js';

export interface ColorRef {
  ramp: string;
  index: number;
  color: string;
}

export interface ContrastPair {
  colorA: ColorRef;
  colorB: ColorRef;
  lcAB: number;  // A as text on B as background
  lcBA: number;  // B as text on A as background
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

// Deduplicate near-identical colors (deltaE < 3 in same ramp).
// Keeps first and last of each contiguous group.
function deduplicateColors(colors: ColorRef[]): ColorRef[] {
  if (colors.length <= 2) return colors;

  const keep = new Set<number>();
  keep.add(0);
  keep.add(colors.length - 1);

  for (let i = 1; i < colors.length; i++) {
    const prev = colors[i - 1];
    const curr = colors[i];

    // Always keep colors from different ramps
    if (curr.ramp !== prev.ramp) {
      keep.add(i);
      keep.add(i - 1);
      continue;
    }

    const de = chroma.deltaE(curr.color, prev.color);
    if (de >= 3) {
      keep.add(i);
    }
  }

  return colors.filter((_, i) => keep.has(i));
}

export function generateAccessibilityReport(ramps: RampOutput[], minLcFilter: number = 0): AccessibilityReport {
  const allColors = collectColors(ramps);
  const colors = deduplicateColors(allColors);
  // Unordered unique pairs count
  const totalPairs = (colors.length * (colors.length - 1)) / 2;

  // Initialize levels with empty arrays
  const levelMap = new Map<string, ContrastPair[]>();
  for (const level of APCA_LEVELS) {
    levelMap.set(level.id, []);
  }

  let passingPairs = 0;

  // Check unordered pairs (i < j), compute both directions
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const a = colors[i];
      const b = colors[j];
      const lcAB = computeApca(a.color, b.color);
      const lcBA = computeApca(b.color, a.color);

      // Use the best absolute contrast of the two directions for level assignment
      const bestAbsLc = Math.max(Math.abs(lcAB), Math.abs(lcBA));
      const passing = getPassingLevels(bestAbsLc);

      if (passing.length > 0) {
        passingPairs++;

        const pair: ContrastPair = {
          colorA: a,
          colorB: b,
          lcAB: Math.round(lcAB * 100) / 100,
          lcBA: Math.round(lcBA * 100) / 100,
        };

        // Assign to highest passing level only
        const highest = passing[0];
        levelMap.get(highest.id)!.push(pair);
      }
    }
  }

  const levels: AccessibilityLevel[] = APCA_LEVELS
    .filter(level => level.minLc >= minLcFilter)
    .map(level => ({
      id: level.id,
      name: level.name,
      minLc: level.minLc,
      pairs: levelMap.get(level.id)!,
    }));

  return {
    totalPairs,
    passingPairs,
    levels,
  };
}
