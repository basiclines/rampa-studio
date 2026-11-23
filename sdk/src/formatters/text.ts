import type { RampResult } from '../types.js';

export function formatTextOutput(ramps: RampResult[]): string {
  return ramps.map(ramp => ramp.colors.join('\n')).join('\n\n');
}
