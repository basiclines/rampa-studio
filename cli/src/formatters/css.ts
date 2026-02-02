import type { RampOutput } from './types';

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function calculateStep(index: number): number {
  return index;
}

export function formatCss(ramps: RampOutput[]): string {
  const lines: string[] = [':root {'];
  
  ramps.forEach((ramp, rampIndex) => {
    const name = sanitizeName(ramp.name);
    if (rampIndex > 0) lines.push('');
    lines.push(`  /* ${name} */`);
    
    ramp.colors.forEach((color, colorIndex) => {
      const step = calculateStep(colorIndex);
      lines.push(`  --${name}-${step}: ${color};`);
    });
  });
  
  lines.push('}');
  return lines.join('\n');
}
