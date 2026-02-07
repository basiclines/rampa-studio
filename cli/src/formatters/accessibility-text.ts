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
      const dir = pair.lc >= 0 ? '→' : '←';
      lines.push(`  ${pair.fg.color} on ${pair.bg.color}  Lc ${pair.lc}  (${pair.fg.ramp}[${pair.fg.index}] ${dir} ${pair.bg.ramp}[${pair.bg.index}])`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function formatAccessibilityCss(report: AccessibilityReport): string {
  return '\n/*\n' + formatAccessibilityText(report) + '*/\n';
}
