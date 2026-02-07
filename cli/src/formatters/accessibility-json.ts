import type { AccessibilityReport } from '../accessibility/report';

export function formatAccessibilityJson(report: AccessibilityReport): object {
  return {
    totalPairs: report.totalPairs,
    passingPairs: report.passingPairs,
    levels: report.levels.map(level => ({
      id: level.id,
      name: level.name,
      minLc: level.minLc,
      count: level.pairs.length,
      pairs: level.pairs.map(pair => ({
        colorA: { ramp: pair.colorA.ramp, index: pair.colorA.index, color: pair.colorA.color },
        colorB: { ramp: pair.colorB.ramp, index: pair.colorB.index, color: pair.colorB.color },
        lcAB: pair.lcAB,
        lcBA: pair.lcBA,
      })),
    })),
  };
}
