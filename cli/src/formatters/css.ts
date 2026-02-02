import type { RampOutput } from './types';

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function calculateStep(index: number, total: number): number {
  if (total === 1) return 0;
  
  // Use clean multiples based on palette size
  if (total <= 11) {
    // Multiples of 10: 0, 10, 20, 30...
    return index * 10;
  }
  if (total <= 21) {
    // Multiples of 5: 0, 5, 10, 15...
    return index * 5;
  }
  // For larger palettes, just use index
  return index;
}

export function formatCss(ramps: RampOutput[]): string {
  const lines: string[] = [':root {'];
  
  ramps.forEach((ramp, rampIndex) => {
    const name = sanitizeName(ramp.name);
    if (rampIndex > 0) lines.push('');
    lines.push(`  /* ${name} */`);
    
    ramp.colors.forEach((color, colorIndex) => {
      const step = calculateStep(colorIndex, ramp.colors.length);
      lines.push(`  --${name}-${step}: ${color};`);
    });
  });
  
  lines.push('}');
  return lines.join('\n');
}
