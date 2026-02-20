import type { RampResult } from '../types';

export function formatJsonOutput(ramps: RampResult[]): string {
  const output = {
    ramps: ramps.map(ramp => ({
      name: ramp.name,
      baseColor: ramp.baseColor,
      colors: ramp.colors,
    })),
  };
  return JSON.stringify(output, null, 2);
}
