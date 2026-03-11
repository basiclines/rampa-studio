import type { RampResult } from '../types';

export function formatJsonOutput(ramps: RampResult[], prefix?: string): string {
  const output = {
    ramps: ramps.map(ramp => ({
      name: prefix
        ? (ramps.length === 1 ? prefix : `${prefix}-${ramp.name}`)
        : ramp.name,
      baseColor: ramp.baseColor,
      colors: ramp.colors,
    })),
  };
  return JSON.stringify(output, null, 2);
}
