import type { AccessibilityReport } from '../accessibility/report';

export function formatAccessibilityText(report: AccessibilityReport): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('# Accessibility Report (APCA)');
  lines.push(`${report.passingPairs} of ${report.totalPairs} pairs pass at least one level`);
  lines.push('');

  for (const level of report.levels) {
    if (level.pairs.length === 0) continue;

    lines.push(`## ${level.name} (Lc ≥ ${level.minLc}) — ${level.pairs.length} pairs`);

    for (const pair of level.pairs) {
      const a = `${pair.colorA.ramp}[${pair.colorA.index}]`;
      const b = `${pair.colorB.ramp}[${pair.colorB.index}]`;
      lines.push(`  ${pair.colorA.color} ↔ ${pair.colorB.color}  Lc ${pair.lcAB} / ${pair.lcBA}  (${a} ↔ ${b})`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function formatAccessibilityCss(report: AccessibilityReport): string {
  return '\n/*\n' + formatAccessibilityText(report) + '*/\n';
}
