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
        fg: { ramp: pair.fg.ramp, index: pair.fg.index, color: pair.fg.color },
        bg: { ramp: pair.bg.ramp, index: pair.bg.index, color: pair.bg.color },
        lc: pair.lc,
      })),
    })),
  };
}
