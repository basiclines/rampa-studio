import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { generateColorRamp } from '@/engine/ColorEngine';
import { ExportEngine } from '@/engine/ExportEngine';
import { generateCSSVariables, generateCSSCode } from './GenerateCSSVariables';

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

/**
 * SDK export — generates TypeScript code using rampa() builder
 */
export function generateSdkExport(ramps: ColorRampConfig[]): string {
  const lines = [`import { rampa } from '@basiclines/rampa-sdk';`, ''];

  ramps.forEach(ramp => {
    const varName = ramp.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    let chain = `const ${varName} = rampa('${ramp.baseColor}')`;

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

    chain += `\n  .generate();`;
    lines.push(chain);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * CLI export — generates rampa CLI commands with flags
 */
export function generateCliExport(ramps: ColorRampConfig[]): string {
  return ramps.map(ramp => {
    let cmd = `rampa --color "${ramp.baseColor}"`;

    if (ramp.totalSteps !== DEFAULTS.totalSteps) {
      cmd += ` --size ${ramp.totalSteps}`;
    }
    if (ramp.colorFormat && ramp.colorFormat !== DEFAULTS.colorFormat) {
      cmd += ` --format ${ramp.colorFormat}`;
    }
    if (ramp.lightnessStart !== DEFAULTS.lightnessStart || ramp.lightnessEnd !== DEFAULTS.lightnessEnd) {
      cmd += ` --lightness ${ramp.lightnessStart}:${ramp.lightnessEnd}`;
    }
    if (ramp.saturationStart !== DEFAULTS.saturationStart || ramp.saturationEnd !== DEFAULTS.saturationEnd) {
      cmd += ` --saturation ${ramp.saturationStart}:${ramp.saturationEnd}`;
    }
    if (ramp.chromaStart !== DEFAULTS.chromaStart || ramp.chromaEnd !== DEFAULTS.chromaEnd) {
      cmd += ` --hue ${ramp.chromaStart}:${ramp.chromaEnd}`;
    }
    if (ramp.lightnessScaleType && ramp.lightnessScaleType !== DEFAULTS.lightnessScaleType) {
      cmd += ` --lightness-scale ${ramp.lightnessScaleType}`;
    }
    if (ramp.saturationScaleType && ramp.saturationScaleType !== DEFAULTS.saturationScaleType) {
      cmd += ` --saturation-scale ${ramp.saturationScaleType}`;
    }
    if (ramp.hueScaleType && ramp.hueScaleType !== DEFAULTS.hueScaleType) {
      cmd += ` --hue-scale ${ramp.hueScaleType}`;
    }
    if (ramp.tintColor && ramp.tintOpacity && ramp.tintOpacity > 0) {
      cmd += ` --tint-color "${ramp.tintColor}" --tint-opacity ${ramp.tintOpacity}`;
      if (ramp.tintBlendMode && ramp.tintBlendMode !== 'normal') {
        cmd += ` --tint-blend ${ramp.tintBlendMode}`;
      }
    }

    return `# ${ramp.name}\n${cmd}`;
  }).join('\n\n');
}
