import type { RampResult } from '../types';

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatCssOutput(ramps: RampResult[]): string {
  const lines: string[] = [':root {'];

  ramps.forEach((ramp, rampIndex) => {
    const name = sanitizeName(ramp.name);
    if (rampIndex > 0) lines.push('');
    lines.push(`  /* ${name} */`);

    ramp.colors.forEach((color, colorIndex) => {
      lines.push(`  --${name}-${colorIndex}: ${color};`);
    });
  });

  lines.push('}');
  return lines.join('\n');
}
