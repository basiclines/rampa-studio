import type { RampOutput } from './types';
import chroma from 'chroma-js';

function structuredColor(hex: string) {
  const c = chroma(hex);
  const [r, g, b] = c.rgb();
  const [hh, ss, ll] = c.hsl();
  const [ol, oc, oh] = c.oklch();
  return {
    hex: c.hex(),
    rgb: { r, g, b },
    hsl: { h: Math.round(hh || 0), s: Math.round(ss * 100), l: Math.round(ll * 100) },
    oklch: { l: parseFloat((ol * 100).toFixed(1)), c: parseFloat(oc.toFixed(3)), h: Math.round(oh || 0) },
  };
}

export function formatJson(ramps: RampOutput[]): string {
  const output = {
    ramps: ramps.map(ramp => ({
      name: ramp.name,
      baseColor: ramp.baseColor,
      config: ramp.config,
      colors: (ramp.rawColors || ramp.colors).map(c => structuredColor(c)),
    })),
  };
  return JSON.stringify(output, null, 2);
}
