import type { RampOutput } from './types';

export function formatJson(ramps: RampOutput[]): string {
  return JSON.stringify({ ramps }, null, 2);
}
