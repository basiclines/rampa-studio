import type { RampOutput } from './types';
import chroma from 'chroma-js';

type ColorFormat = 'hex' | 'hsl' | 'rgb' | 'oklch';

function structuredColor(hex: string, format?: ColorFormat) {
  const c = chroma(hex);
  const [r, g, b] = c.rgb();
  const [hh, ss, ll] = c.hsl();
  const [ol, oc, oh] = c.oklch();
  const all = {
    hex: c.hex(),
    rgb: { r, g, b },
    hsl: { h: Math.round(hh || 0), s: parseFloat(ss.toFixed(2)), l: parseFloat(ll.toFixed(2)) },
    oklch: { l: parseFloat(ol.toFixed(3)), c: parseFloat(oc.toFixed(3)), h: Math.round(oh || 0) },
  };
  if (format) {
    return { [format]: all[format] };
  }
  return all;
}

export function formatJson(ramps: RampOutput[], format?: ColorFormat): string {
  const output = {
    ramps: ramps.map(ramp => ({
      name: ramp.name,
      baseColor: ramp.baseColor,
      config: ramp.config,
      colors: (ramp.rawColors || ramp.colors).map(c => structuredColor(c, format)),
    })),
  };
  return JSON.stringify(output, null, 2);
}
