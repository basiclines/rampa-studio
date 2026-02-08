import chroma from 'chroma-js';
import type { AccessibilityReport, ContrastPair } from '../accessibility/report';
import { coloredSquare } from '../utils/terminal-colors';

export interface AccessibilityTextOptions {
  preview?: boolean;
}

function formatLc(lc: number): string {
  const str = lc.toString();
  // Negative values already have the minus sign
  return lc >= 0 ? ` ${str}` : str;
}

function pairSquares(pair: ContrastPair): string {
  const [rA, gA, bA] = chroma(pair.colorA.color).rgb();
  const [rB, gB, bB] = chroma(pair.colorB.color).rgb();
  return `${coloredSquare(rA, gA, bA)}${coloredSquare(rB, gB, bB)}`;
}

export function formatAccessibilityText(report: AccessibilityReport, options: AccessibilityTextOptions = {}): string {
  const lines: string[] = [];
  const showPreview = options.preview ?? false;

  lines.push('');
  lines.push('# Accessibility Report (APCA)');
  lines.push(`${report.passingPairs} of ${report.totalPairs} pairs pass at least one level`);
  lines.push('');

  const filteredPairCount = report.levels.reduce((sum, l) => sum + l.pairs.length, 0);

  if (filteredPairCount === 0) {
    const filterDesc = report.filter.raw
      ? `filter: ${report.filter.raw}`
      : 'current filter';
    lines.push(`No pairs match the ${filterDesc}`);
    lines.push('');
    return lines.join('\n');
  }

  for (const level of report.levels) {
    if (level.pairs.length === 0) continue;

    lines.push(`## ${level.name} (Lc ≥ ${level.minLc}) — ${level.pairs.length} pairs`);

    // Compute max widths for alignment
    const maxColorA = Math.max(...level.pairs.map(p => p.colorA.color.length));
    const maxColorB = Math.max(...level.pairs.map(p => p.colorB.color.length));
    const maxLcAB = Math.max(...level.pairs.map(p => formatLc(p.lcAB).length));
    const maxLcBA = Math.max(...level.pairs.map(p => formatLc(p.lcBA).length));
    const maxRefA = Math.max(...level.pairs.map(p => `${p.colorA.ramp}[${p.colorA.index}]`.length));
    const maxRefB = Math.max(...level.pairs.map(p => `${p.colorB.ramp}[${p.colorB.index}]`.length));

    for (const pair of level.pairs) {
      const colA = pair.colorA.color.padEnd(maxColorA);
      const colB = pair.colorB.color.padEnd(maxColorB);
      const lcA = formatLc(pair.lcAB).padStart(maxLcAB);
      const lcB = formatLc(pair.lcBA).padStart(maxLcBA);
      const refA = `${pair.colorA.ramp}[${pair.colorA.index}]`.padEnd(maxRefA);
      const refB = `${pair.colorB.ramp}[${pair.colorB.index}]`.padEnd(maxRefB);

      const preview = showPreview ? `${pairSquares(pair)} ` : '';
      lines.push(`  ${preview}${colA} ↔ ${colB}  Lc ${lcA} / ${lcB}  ${refA} ↔ ${refB}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function formatAccessibilityCss(report: AccessibilityReport): string {
  return '\n/*\n' + formatAccessibilityText(report) + '*/\n';
}
