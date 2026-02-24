import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { generateColorRamp } from '@/engine/ColorEngine';
import { generateLinearSpace, generateCubeSpace, generatePlaneSpace, type InterpolationMode } from '@/engine/ColorSpaceEngine';
import { ExportEngine } from '@/engine/ExportEngine';
import { generateCSSVariables, generateCSSCode } from './GenerateCSSVariables';
import type { LinearConfig, CubeConfig, PlaneConfig, ColorSpaceType } from '@/state/ColorSpaceState';
import chroma from 'chroma-js';

// SDK/CLI default values — only emit non-default params
const DEFAULTS = {
  totalSteps: 10,
  colorFormat: 'hex',
  lightnessStart: 0,
  lightnessEnd: 100,
  saturationStart: 100,
  saturationEnd: 0,
  chromaStart: -10,
  chromaEnd: 10,
  lightnessScaleType: 'linear',
  saturationScaleType: 'linear',
  hueScaleType: 'linear',
};

/** Config fingerprint for grouping (everything except id/name/baseColor/swatches) */
function configFingerprint(ramp: ColorRampConfig): string {
  return JSON.stringify({
    totalSteps: ramp.totalSteps,
    colorFormat: ramp.colorFormat,
    lightnessStart: ramp.lightnessStart,
    lightnessEnd: ramp.lightnessEnd,
    saturationStart: ramp.saturationStart,
    saturationEnd: ramp.saturationEnd,
    chromaStart: ramp.chromaStart,
    chromaEnd: ramp.chromaEnd,
    lightnessScaleType: ramp.lightnessScaleType,
    saturationScaleType: ramp.saturationScaleType,
    hueScaleType: ramp.hueScaleType,
    tintColor: ramp.tintColor,
    tintOpacity: ramp.tintOpacity,
    tintBlendMode: ramp.tintBlendMode,
  });
}

/** Known harmony angle patterns */
const HARMONY_PATTERNS: { type: string; angles: number[] }[] = [
  { type: 'complementary', angles: [180] },
  { type: 'analogous', angles: [30, 60] },
  { type: 'triadic', angles: [120, 240] },
  { type: 'split-complementary', angles: [150, 210] },
  { type: 'square', angles: [90, 180, 270] },
  { type: 'compound', angles: [180, 150, 210] },
];

/** Calculate hue shift in degrees between two colors */
function hueShift(base: string, target: string): number {
  const baseHue = chroma(base).hsl()[0] || 0;
  const targetHue = chroma(target).hsl()[0] || 0;
  let shift = targetHue - baseHue;
  // Normalize to 0-360
  shift = ((shift % 360) + 360) % 360;
  return Math.round(shift);
}

/** Try to detect a named harmony from hue shifts, otherwise use shift:N */
function detectHarmony(shifts: number[]): string[] {
  for (const pattern of HARMONY_PATTERNS) {
    if (shifts.length !== pattern.angles.length) continue;
    const matches = pattern.angles.every((angle, i) => Math.abs(shifts[i] - angle) <= 2);
    if (matches) return [pattern.type];
  }
  return shifts.map(s => `shift:${s}`);
}

interface RampGroup {
  primary: ColorRampConfig;
  derived: ColorRampConfig[];
  harmonies: string[]; // e.g. ['complementary'] or ['shift:90', 'shift:180', 'shift:270']
}

/** Group consecutive ramps that share the same config (except baseColor) */
function groupRamps(ramps: ColorRampConfig[]): RampGroup[] {
  const groups: RampGroup[] = [];
  let i = 0;
  while (i < ramps.length) {
    const primary = ramps[i];
    const fp = configFingerprint(primary);
    const derived: ColorRampConfig[] = [];
    let j = i + 1;
    while (j < ramps.length && configFingerprint(ramps[j]) === fp) {
      derived.push(ramps[j]);
      j++;
    }
    const shifts = derived.map(d => hueShift(primary.baseColor, d.baseColor));
    const harmonies = derived.length > 0 ? detectHarmony(shifts) : [];
    groups.push({ primary, derived, harmonies });
    i = j;
  }
  return groups;
}

/**
 * Plain text export — one ramp per block, colors listed vertically
 */
export function generateTextExport(ramps: ColorRampConfig[]): string {
  return ramps.map(ramp => {
    const colors = generateColorRamp(ramp);
    const lines = [`${ramp.name}`, ...colors.map((c, i) => `  ${i.toString().padStart(2)}  ${c}`)];
    return lines.join('\n');
  }).join('\n\n');
}

/**
 * SVG export — reuses existing ExportEngine
 */
export function generateSvgExport(ramps: ColorRampConfig[]): string {
  const allColors = ramps.map(ramp => ({
    name: ramp.name,
    colors: generateColorRamp(ramp),
  }));
  return ExportEngine.exportToSvg(allColors);
}

/**
 * CSS export — CSS custom properties grouped by ramp
 */
export function generateCssExport(ramps: ColorRampConfig[]): string {
  const variables = generateCSSVariables(ramps);
  return generateCSSCode(variables);
}

/**
 * JSON export — clean output with ramp names and generated colors
 */
export function generateJsonExport(ramps: ColorRampConfig[]): string {
  const output = ramps.map(ramp => {
    const colors = generateColorRamp(ramp);
    return {
      name: ramp.name,
      baseColor: ramp.baseColor,
      format: ramp.colorFormat || 'hex',
      steps: ramp.totalSteps,
      colors,
    };
  });
  return JSON.stringify(output, null, 2);
}

/** Build shared SDK chain options (everything except baseColor and generate) */
function buildSdkOptions(ramp: ColorRampConfig): string {
  let chain = '';
  if (ramp.totalSteps !== DEFAULTS.totalSteps) {
    chain += `\n  .size(${ramp.totalSteps})`;
  }
  if (ramp.colorFormat && ramp.colorFormat !== DEFAULTS.colorFormat) {
    chain += `\n  .format('${ramp.colorFormat}')`;
  }
  if (ramp.lightnessStart !== DEFAULTS.lightnessStart || ramp.lightnessEnd !== DEFAULTS.lightnessEnd) {
    chain += `\n  .lightness(${ramp.lightnessStart}, ${ramp.lightnessEnd})`;
  }
  if (ramp.saturationStart !== DEFAULTS.saturationStart || ramp.saturationEnd !== DEFAULTS.saturationEnd) {
    chain += `\n  .saturation(${ramp.saturationStart}, ${ramp.saturationEnd})`;
  }
  if (ramp.chromaStart !== DEFAULTS.chromaStart || ramp.chromaEnd !== DEFAULTS.chromaEnd) {
    chain += `\n  .hue(${ramp.chromaStart}, ${ramp.chromaEnd})`;
  }
  if (ramp.lightnessScaleType && ramp.lightnessScaleType !== DEFAULTS.lightnessScaleType) {
    chain += `\n  .lightnessScale('${ramp.lightnessScaleType}')`;
  }
  if (ramp.saturationScaleType && ramp.saturationScaleType !== DEFAULTS.saturationScaleType) {
    chain += `\n  .saturationScale('${ramp.saturationScaleType}')`;
  }
  if (ramp.hueScaleType && ramp.hueScaleType !== DEFAULTS.hueScaleType) {
    chain += `\n  .hueScale('${ramp.hueScaleType}')`;
  }
  if (ramp.tintColor && ramp.tintOpacity && ramp.tintOpacity > 0) {
    chain += `\n  .tint('${ramp.tintColor}', ${ramp.tintOpacity}, '${ramp.tintBlendMode || 'normal'}')`;
  }
  return chain;
}

/** Build shared CLI flags (everything except --color) */
function buildCliFlags(ramp: ColorRampConfig): string {
  let flags = '';
  if (ramp.totalSteps !== DEFAULTS.totalSteps) {
    flags += ` --size ${ramp.totalSteps}`;
  }
  if (ramp.colorFormat && ramp.colorFormat !== DEFAULTS.colorFormat) {
    flags += ` --format ${ramp.colorFormat}`;
  }
  if (ramp.lightnessStart !== DEFAULTS.lightnessStart || ramp.lightnessEnd !== DEFAULTS.lightnessEnd) {
    flags += ` --lightness ${ramp.lightnessStart}:${ramp.lightnessEnd}`;
  }
  if (ramp.saturationStart !== DEFAULTS.saturationStart || ramp.saturationEnd !== DEFAULTS.saturationEnd) {
    flags += ` --saturation ${ramp.saturationStart}:${ramp.saturationEnd}`;
  }
  if (ramp.chromaStart !== DEFAULTS.chromaStart || ramp.chromaEnd !== DEFAULTS.chromaEnd) {
    flags += ` --hue ${ramp.chromaStart}:${ramp.chromaEnd}`;
  }
  if (ramp.lightnessScaleType && ramp.lightnessScaleType !== DEFAULTS.lightnessScaleType) {
    flags += ` --lightness-scale ${ramp.lightnessScaleType}`;
  }
  if (ramp.saturationScaleType && ramp.saturationScaleType !== DEFAULTS.saturationScaleType) {
    flags += ` --saturation-scale ${ramp.saturationScaleType}`;
  }
  if (ramp.hueScaleType && ramp.hueScaleType !== DEFAULTS.hueScaleType) {
    flags += ` --hue-scale ${ramp.hueScaleType}`;
  }
  if (ramp.tintColor && ramp.tintOpacity && ramp.tintOpacity > 0) {
    flags += ` --tint-color "${ramp.tintColor}" --tint-opacity ${ramp.tintOpacity}`;
    if (ramp.tintBlendMode && ramp.tintBlendMode !== 'normal') {
      flags += ` --tint-blend ${ramp.tintBlendMode}`;
    }
  }
  return flags;
}

/**
 * SDK export — generates TypeScript code using rampa() builder
 * Groups harmony ramps into a single chain with .add()
 */
export function generateSdkExport(ramps: ColorRampConfig[]): string {
  const groups = groupRamps(ramps);
  const lines = [`import { rampa } from '@basiclines/rampa-sdk';`, ''];

  groups.forEach(group => {
    const { primary, harmonies } = group;
    const varName = primary.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    let chain = `const ${varName} = rampa('${primary.baseColor}')`;
    chain += buildSdkOptions(primary);

    for (const h of harmonies) {
      if (h.startsWith('shift:')) {
        const degrees = h.split(':')[1];
        chain += `\n  .add('shift', ${degrees})`;
      } else {
        chain += `\n  .add('${h}')`;
      }
    }

    chain += `\n  .generate();`;
    lines.push(chain);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * CLI export — generates rampa CLI commands with flags
 * Groups harmony ramps into a single command with --add
 */
export function generateCliExport(ramps: ColorRampConfig[]): string {
  const groups = groupRamps(ramps);

  return groups.map(group => {
    const { primary, harmonies } = group;
    let cmd = `rampa --color "${primary.baseColor}"`;
    cmd += buildCliFlags(primary);

    for (const h of harmonies) {
      cmd += ` --add ${h}`;
    }

    const names = [primary.name, ...group.derived.map(d => d.name)];
    return `# ${names.join(', ')}\n${cmd}`;
  }).join('\n\n');
}

// ── Color Space Exports ──────────────────────────────────────────────

export interface ColorSpaceExportData {
  spaceType: ColorSpaceType;
  linearConfig: LinearConfig;
  cubeConfig: CubeConfig;
  planeConfig?: PlaneConfig;
}

const CORNER_ORDER = ['k', 'r', 'g', 'b', 'y', 'm', 'c', 'w'] as const;

function getSpaceColors(data: ColorSpaceExportData): string[] {
  if (data.spaceType === 'linear') {
    const { fromColor, toColor, steps, interpolation } = data.linearConfig;
    return generateLinearSpace(fromColor, toColor, steps, interpolation);
  }
  if (data.spaceType === 'plane' && data.planeConfig) {
    const { dark, light, hue, stepsPerAxis, interpolation } = data.planeConfig;
    return generatePlaneSpace(dark, light, hue, stepsPerAxis, interpolation);
  }
  const { corners, stepsPerAxis, interpolation } = data.cubeConfig;
  const ordered = CORNER_ORDER.map(k => corners[k]) as [string, string, string, string, string, string, string, string];
  return generateCubeSpace(ordered, stepsPerAxis, interpolation);
}

export function generateSpaceTextExport(data: ColorSpaceExportData): string {
  const colors = getSpaceColors(data);
  const label = data.spaceType === 'linear' ? 'Linear Color Space' : data.spaceType === 'plane' ? 'Plane Color Space' : 'Cube Color Space';
  const lines = [label, ...colors.map((c, i) => `  ${i.toString().padStart(3)}  ${c}`)];
  return lines.join('\n');
}

export function generateSpaceCssExport(data: ColorSpaceExportData): string {
  const colors = getSpaceColors(data);
  const prefix = data.spaceType === 'linear' ? 'linear' : data.spaceType === 'plane' ? 'plane' : 'cube';
  const vars = colors.map((c, i) => `  --${prefix}-${i}: ${c};`);
  return `:root {\n${vars.join('\n')}\n}`;
}

export function generateSpaceJsonExport(data: ColorSpaceExportData): string {
  const colors = getSpaceColors(data);
  const output: Record<string, unknown> = {
    type: data.spaceType,
    colors,
  };
  if (data.spaceType === 'linear') {
    output.from = data.linearConfig.fromColor;
    output.to = data.linearConfig.toColor;
    output.steps = data.linearConfig.steps;
    output.interpolation = data.linearConfig.interpolation;
  } else if (data.spaceType === 'plane' && data.planeConfig) {
    output.dark = data.planeConfig.dark;
    output.light = data.planeConfig.light;
    output.hue = data.planeConfig.hue;
    output.stepsPerAxis = data.planeConfig.stepsPerAxis;
    output.interpolation = data.planeConfig.interpolation;
  } else {
    output.corners = data.cubeConfig.corners;
    output.stepsPerAxis = data.cubeConfig.stepsPerAxis;
    output.interpolation = data.cubeConfig.interpolation;
  }
  return JSON.stringify(output, null, 2);
}

export function generateSpaceSdkExport(data: ColorSpaceExportData): string {
  if (data.spaceType === 'plane' && data.planeConfig) {
    const { dark, light, hue, stepsPerAxis, interpolation } = data.planeConfig;
    const lines = [`import { PlaneColorSpace } from '@basiclines/rampa-sdk';`, ''];
    let chain = `const space = new PlaneColorSpace('${dark}', '${light}', '${hue}')`;
    if (interpolation !== 'oklch') {
      chain += `\n  .interpolation('${interpolation}')`;
    }
    chain += `\n  .size(${stepsPerAxis});`;
    lines.push(chain);
    return lines.join('\n');
  }

  const lines = [`import { LinearColorSpace, CubeColorSpace } from '@basiclines/rampa-sdk';`, ''];

  if (data.spaceType === 'linear') {
    const { fromColor, toColor, steps, interpolation } = data.linearConfig;
    let chain = `const space = new LinearColorSpace('${fromColor}', '${toColor}')`;
    if (interpolation !== 'oklch') {
      chain += `\n  .interpolation('${interpolation}')`;
    }
    chain += `\n  .size(${steps});`;
    lines.push(chain);
  } else {
    const { corners, stepsPerAxis, interpolation } = data.cubeConfig;
    const entries = CORNER_ORDER.map(k => `  ${k}: '${corners[k]}',`).join('\n');
    let chain = `const space = new CubeColorSpace({\n${entries}\n})`;
    if (interpolation !== 'oklch') {
      chain += `\n  .interpolation('${interpolation}')`;
    }
    chain += `\n  .size(${stepsPerAxis});`;
    lines.push(chain);
  }

  return lines.join('\n');
}

export function generateSpaceCliExport(data: ColorSpaceExportData): string {
  if (data.spaceType === 'linear') {
    const { fromColor, toColor, steps, interpolation } = data.linearConfig;
    let cmd = `rampa colorspace --linear '${fromColor}' '${toColor}' --size ${steps}`;
    if (interpolation !== 'oklch') {
      cmd += ` --interpolation ${interpolation}`;
    }
    return cmd;
  }

  if (data.spaceType === 'plane' && data.planeConfig) {
    const { dark, light, hue, stepsPerAxis, interpolation } = data.planeConfig;
    let cmd = `rampa colorspace --plane '${dark}' '${light}' '${hue}' --size ${stepsPerAxis}`;
    if (interpolation !== 'oklch') {
      cmd += ` --interpolation ${interpolation}`;
    }
    return cmd;
  }

  const { corners, stepsPerAxis, interpolation } = data.cubeConfig;
  const pairs = CORNER_ORDER.map(k => `${k}=${corners[k]}`).join(' ');
  let cmd = `rampa colorspace --cube ${pairs} --size ${stepsPerAxis}`;
  if (interpolation !== 'oklch') {
    cmd += ` --interpolation ${interpolation}`;
  }
  return cmd;
}
