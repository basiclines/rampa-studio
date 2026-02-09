#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';
import chroma from 'chroma-js';
import { 
  generateColorRamp,
  getComplementaryColors,
  getTriadColors,
  getAnalogousColors,
  getSplitComplementaryColors,
  getSquareColors,
  getCompoundColors,
} from '../../src/engine/ColorEngine';
import type { ColorRampConfig } from '../../src/entities/ColorRampEntity';
import { parsePercentRange, parseHueRange } from './utils/range-parser';
import { SCALE_TYPES, isValidScaleType } from './constants/scales';
import { BLEND_MODES, isValidBlendMode } from './constants/blend-modes';
import { HARMONY_TYPES, isValidHarmonyType, type HarmonyType } from './constants/harmonies';
import { OUTPUT_FORMATS, isValidOutputFormat, type OutputFormat } from './constants/output-formats';
import { formatJson } from './formatters/json';
import { formatCss } from './formatters/css';
import type { RampOutput, RampConfig } from './formatters/types';
import { coloredSquare, getColorLimitationNote, supportsTruecolor } from './utils/terminal-colors';
import { generateAccessibilityReport } from './accessibility/report';
import { parseAccessibilityFilter } from './accessibility/apca';
import { formatAccessibilityJson } from './formatters/accessibility-json';
import { formatAccessibilityText, formatAccessibilityCss } from './formatters/accessibility-text';

// Intercept --help and -h before citty processes them
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
}

// Custom help output with grouped sections
function showHelp(): void {
  // ANSI color codes
  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';

  const help = `
rampa v1.3.1
Generate mathematically accurate color palettes from a base color

USAGE
  ${cyan}rampa --color <color> [options]${reset}

BASE
  ${cyan}-C, --color <color>${reset}            ${dim}Base color (required)${reset}
  ${cyan}--size <number>${reset}                ${dim}Number of colors in palette (2-100, default: 10)${reset}
  ${cyan}-F, --format <type>${reset}            ${dim}Color format: hex, hsl, rgb, oklch (default: auto)${reset}

RANGES
  ${cyan}-L, --lightness <start:end>${reset}    ${dim}Lightness range 0-100 (default: 0:100)${reset}
  ${cyan}-S, --saturation <start:end>${reset}   ${dim}Saturation range 0-100 (default: 100:0)${reset}
  ${cyan}-H, --hue <start:end>${reset}          ${dim}Hue shift in degrees (default: -10:10)${reset}

SCALES
  ${cyan}--lightness-scale <type>${reset}       ${dim}Lightness curve (default: linear)${reset}
  ${cyan}--saturation-scale <type>${reset}      ${dim}Saturation curve (default: linear)${reset}
  ${cyan}--hue-scale <type>${reset}             ${dim}Hue curve (default: linear)${reset}

                                  ${dim}Types: linear, geometric, fibonacci, golden-ratio,${reset}
                                  ${dim}logarithmic, powers-of-2, musical-ratio, cielab-uniform,${reset}
                                  ${dim}ease-in, ease-out, ease-in-out${reset}

TINTING
  ${cyan}--tint-color <color>${reset}           ${dim}Tint color to blend over palette${reset}
  ${cyan}--tint-opacity <0-100>${reset}         ${dim}Tint strength (default: 0)${reset}
  ${cyan}--tint-blend <mode>${reset}            ${dim}Blend mode (default: normal)${reset}

                                  ${dim}Modes: normal, multiply, screen, overlay, darken,${reset}
                                  ${dim}lighten, color-dodge, color-burn, hard-light, soft-light,${reset}
                                  ${dim}difference, exclusion, hue, saturation, color, luminosity${reset}

HARMONIES
  ${cyan}--add <type>${reset}                   ${dim}Add harmony ramp (can repeat)${reset}

                                  ${dim}Types: complementary, triadic, analogous,${reset}
                                  ${dim}split-complementary, square, compound, shift:<degrees>${reset}

OUTPUT
  ${cyan}-O, --output <format>${reset}          ${dim}Output format (default: text)${reset}
  ${cyan}--preview / --no-preview${reset}       ${dim}Show colored squares (default: true)${reset}
  ${cyan}-A, --accessibility [filter]${reset}    ${dim}Show APCA contrast report${reset}

                                  ${dim}Filters: preferred, body, large, bold, minimum, nontext${reset}
                                  ${dim}or a custom Lc value (e.g. 60)${reset}

                                  ${dim}Formats: text, json, css${reset}

OTHER
  ${cyan}-h, --help${reset}                     ${dim}Show this help${reset}
  ${cyan}-v, --version${reset}                  ${dim}Show version${reset}

EXAMPLES
  ${cyan}rampa -C "#3b82f6"${reset}
  ${cyan}rampa -C "#3b82f6" --size=5 -L 10:90${reset}
  ${cyan}rampa -C "#3b82f6" --add=complementary --add=triadic${reset}
  ${cyan}rampa -C "#3b82f6" --add=shift:45 --add=shift:90${reset}
  ${cyan}rampa -C "#3b82f6" -O css${reset}
  ${cyan}rampa -C "#3b82f6" --tint-color="#FF0000" --tint-opacity=15${reset}
  ${cyan}rampa -C "#3b82f6" -A${reset}
  ${cyan}rampa -C "#3b82f6" --add=complementary -O json -A${reset}
`;
  console.log(help.trim());
  process.exit(0);
}

type ColorFormat = 'hex' | 'hsl' | 'rgb' | 'oklch';

// Help text for each flag
const FLAG_HELP = {
  color: `
-C, --color <color>  Base color for the palette

Examples:
  rampa --color="#3b82f6"
  rampa -C "rgb(59, 130, 246)"
  rampa -C "hsl(217, 91%, 60%)"
  rampa -C blue
`,
  size: `
--size <number>  Number of colors in palette (2-100)

Examples:
  rampa -C "#3b82f6" --size=5
  rampa -C "#3b82f6" --size=12
  rampa -C "#3b82f6" --size=20
`,
  format: `
--format, -F <type>  Output color format

Available formats: hex, hsl, rgb, oklch

Examples:
  rampa -C "#3b82f6" --format=hsl
  rampa -C "#3b82f6" -F oklch
  rampa -C "#3b82f6" -F rgb
`,
  lightness: `
--lightness, -L <start:end>  Lightness range (0-100)

Examples:
  rampa -C "#3b82f6" --lightness=10:90
  rampa -C "#3b82f6" -L 20:80
  rampa -C "#3b82f6" -L 0:50      # Dark palette
  rampa -C "#3b82f6" -L 50:100    # Light palette
`,
  saturation: `
--saturation, -S <start:end>  Saturation range (0-100)

Examples:
  rampa -C "#3b82f6" --saturation=20:80
  rampa -C "#3b82f6" -S 100:0     # Vibrant to muted
  rampa -C "#3b82f6" -S 50:50     # Constant saturation
`,
  hue: `
--hue, -H <start:end>  Hue shift in degrees (can be negative)

Examples:
  rampa -C "#3b82f6" --hue=-30:30
  rampa -C "#3b82f6" -H 0:0       # No hue shift
  rampa -C "#3b82f6" -H -45:45    # Wide hue variation
`,
  'lightness-scale': `
--lightness-scale <type>  Distribution curve for lightness

Available scales:
  ${SCALE_TYPES.join(', ')}

Examples:
  rampa -C "#3b82f6" --lightness-scale=fibonacci
  rampa -C "#3b82f6" --lightness-scale=ease-in-out
  rampa -C "#3b82f6" --lightness-scale=golden-ratio
`,
  'saturation-scale': `
--saturation-scale <type>  Distribution curve for saturation

Available scales:
  ${SCALE_TYPES.join(', ')}

Examples:
  rampa -C "#3b82f6" --saturation-scale=ease-out
  rampa -C "#3b82f6" --saturation-scale=logarithmic
`,
  'hue-scale': `
--hue-scale <type>  Distribution curve for hue

Available scales:
  ${SCALE_TYPES.join(', ')}

Examples:
  rampa -C "#3b82f6" --hue-scale=fibonacci
  rampa -C "#3b82f6" --hue-scale=ease-in
`,
  'tint-color': `
--tint-color <color>  Tint color to blend over the palette

Examples:
  rampa -C "#3b82f6" --tint-color="#FF6600" --tint-opacity=20
  rampa -C "#3b82f6" --tint-color="orange" --tint-opacity=15
`,
  'tint-opacity': `
--tint-opacity <number>  Tint strength (0-100)

Examples:
  rampa -C "#3b82f6" --tint-color="#FF6600" --tint-opacity=10
  rampa -C "#3b82f6" --tint-color="#FF6600" --tint-opacity=30
  rampa -C "#3b82f6" --tint-color="#FF6600" --tint-opacity=50
`,
  'tint-blend': `
--tint-blend <mode>  Blend mode for tinting

Available modes:
  ${BLEND_MODES.join(', ')}

Examples:
  rampa -C "#3b82f6" --tint-color="#FF0000" --tint-opacity=20 --tint-blend=multiply
  rampa -C "#3b82f6" --tint-color="#FF0000" --tint-opacity=20 --tint-blend=overlay
  rampa -C "#3b82f6" --tint-color="#FF0000" --tint-opacity=20 --tint-blend=screen
`,
  add: `
--add <type>  Add harmony ramps (can be used multiple times)

Available types:
  ${HARMONY_TYPES.join(', ')}
  shift:<degrees>  - Custom hue rotation (e.g., shift:45, shift:-30)

Examples:
  rampa -C "#3b82f6" --add=complementary
  rampa -C "#3b82f6" --add=triadic
  rampa -C "#3b82f6" --add=complementary --add=analogous
  rampa -C "#3b82f6" --add=shift:45           # Warm shift
  rampa -C "#3b82f6" --add=shift:-30          # Cool shift
  rampa -C "#3b82f6" --add=shift:45 --add=shift:90
`,
  output: `
--output, -O <format>  Output format

Available formats: ${OUTPUT_FORMATS.join(', ')}

Examples:
  rampa -C "#3b82f6" --output=text
  rampa -C "#3b82f6" --output=json
  rampa -C "#3b82f6" --output=css
  rampa -C "#3b82f6" -O json --add=complementary
`,
  accessibility: `
-A, --accessibility [filter]  Show APCA contrast report

Filters (optional):
  preferred   Lc ≥ 90  Preferred body text
  body        Lc ≥ 75  Body text
  large       Lc ≥ 60  Large text
  bold        Lc ≥ 45  Large/bold text
  minimum     Lc ≥ 30  Minimum text
  nontext     Lc ≥ 15  Non-text
  <number>    Custom Lc threshold (e.g. 60)

Examples:
  rampa -C "#3b82f6" -A
  rampa -C "#3b82f6" -A body
  rampa -C "#3b82f6" -A=large
  rampa -C "#3b82f6" --accessibility=75
  rampa -C "#3b82f6" -O json -A preferred
`,
};

// Show help for a specific flag
function showFlagHelp(flag: keyof typeof FLAG_HELP): void {
  console.log(FLAG_HELP[flag]);
  process.exit(0);
}

// Check if a value looks like it needs help (empty, undefined, or just the flag)
function needsHelp(value: string | undefined): boolean {
  return !value || value === '' || value === 'true';
}

// Detect input color format
function detectColorFormat(input: string): ColorFormat {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.startsWith('hsl')) return 'hsl';
  if (trimmed.startsWith('rgb')) return 'rgb';
  if (trimmed.startsWith('oklch')) return 'oklch';
  return 'hex';
}

// Format color for output
function formatColor(color: string, format: ColorFormat): string {
  const c = chroma(color);
  switch (format) {
    case 'hsl': {
      const [h, s, l] = c.hsl();
      return `hsl(${Math.round(h || 0)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }
    case 'rgb': {
      const [r, g, b] = c.rgb();
      return `rgb(${r}, ${g}, ${b})`;
    }
    case 'oklch': {
      const [l, c_, h] = c.oklch();
      return `oklch(${(l * 100).toFixed(1)}% ${c_.toFixed(3)} ${Math.round(h || 0)})`;
    }
    default:
      return c.hex();
  }
}

const validFormats = ['hex', 'hsl', 'rgb', 'oklch'];

const main = defineCommand({
  meta: {
    name: 'rampa',
    version: '1.3.1',
    description: 'Generate mathematically accurate color palettes from a base color',
  },
  args: {
    color: {
      type: 'string',
      alias: ['C', 'c'],
      description: 'Base color (hex, hsl, rgb, oklch)',
      required: true,
    },
    size: {
      type: 'string',
      description: 'Number of colors in palette (2-100)',
      default: '10',
    },
    format: {
      type: 'string',
      alias: ['F', 'f'],
      description: 'Output format: hex, hsl, rgb, oklch (default: same as input)',
    },
    lightness: {
      type: 'string',
      alias: ['L', 'l'],
      description: 'Lightness range start:end (0-100, default: 0:100)',
      default: '0:100',
    },
    saturation: {
      type: 'string',
      alias: ['S', 's'],
      description: 'Saturation range start:end (0-100, default: 100:0)',
      default: '100:0',
    },
    hue: {
      type: 'string',
      alias: 'H',
      description: 'Hue shift range start:end in degrees (default: -10:10)',
      default: '-10:10',
    },
    'lightness-scale': {
      type: 'string',
      description: 'Lightness distribution curve (default: linear)',
      default: 'linear',
    },
    'saturation-scale': {
      type: 'string',
      description: 'Saturation distribution curve (default: linear)',
      default: 'linear',
    },
    'hue-scale': {
      type: 'string',
      description: 'Hue distribution curve (default: linear)',
      default: 'linear',
    },
    preview: {
      type: 'boolean',
      description: 'Show colored squares preview (default: true)',
      default: true,
    },
    'tint-color': {
      type: 'string',
      description: 'Tint color to blend over palette',
    },
    'tint-opacity': {
      type: 'string',
      description: 'Tint strength 0-100 (default: 0)',
      default: '0',
    },
    'tint-blend': {
      type: 'string',
      description: 'Blend mode for tinting (default: normal)',
      default: 'normal',
    },
    add: {
      type: 'string',
      description: 'Add harmony ramp (repeatable: complementary, triadic, shift:N, etc.)',
    },
    output: {
      type: 'string',
      alias: ['O', 'o'],
      description: 'Output format: text, json, css (default: text)',
      default: 'text',
    },
    accessibility: {
      type: 'string',
      alias: ['A', 'a'],
      description: 'Show APCA contrast report. Optional: filter by level name or Lc value',
    },
  },
  run({ args }) {
    // Check for help requests on specific flags (when used without proper value)
    if (needsHelp(args.size) && args.size !== '10') showFlagHelp('size');
    if (args.format !== undefined && needsHelp(args.format)) showFlagHelp('format');
    if (needsHelp(args.lightness) && args.lightness !== '0:100') showFlagHelp('lightness');
    if (needsHelp(args.saturation) && args.saturation !== '100:0') showFlagHelp('saturation');
    if (needsHelp(args.hue) && args.hue !== '-10:10') showFlagHelp('hue');
    if (needsHelp(args['lightness-scale']) && args['lightness-scale'] !== 'linear') showFlagHelp('lightness-scale');
    if (needsHelp(args['saturation-scale']) && args['saturation-scale'] !== 'linear') showFlagHelp('saturation-scale');
    if (needsHelp(args['hue-scale']) && args['hue-scale'] !== 'linear') showFlagHelp('hue-scale');
    if (args['tint-color'] !== undefined && needsHelp(args['tint-color'])) showFlagHelp('tint-color');
    if (needsHelp(args['tint-opacity']) && args['tint-opacity'] !== '0') showFlagHelp('tint-opacity');
    if (needsHelp(args['tint-blend']) && args['tint-blend'] !== 'normal') showFlagHelp('tint-blend');
    if (args.add !== undefined && needsHelp(args.add)) showFlagHelp('add');
    if (needsHelp(args.output) && args.output !== 'text') showFlagHelp('output');

    // Detect input format before validation
    const detectedFormat = detectColorFormat(args.color);
    
    // Validate base color
    let validatedColor: string;
    try {
      validatedColor = chroma(args.color).hex();
    } catch {
      showFlagHelp('color');
    }

    // Validate size
    const size = parseInt(args.size, 10);
    if (isNaN(size) || size < 2 || size > 100) {
      console.error(`Error: Size must be a number between 2 and 100, got "${args.size}"\n`);
      showFlagHelp('size');
    }

    // Determine output format (flag overrides auto-detection)
    const outputFormat = (args.format?.toLowerCase() || detectedFormat) as ColorFormat;
    if (!validFormats.includes(outputFormat)) {
      console.error(`Error: Invalid format "${args.format}"\n`);
      showFlagHelp('format');
    }

    // Parse ranges
    let lightness, saturation, hue;
    try {
      lightness = parsePercentRange(args.lightness, 'lightness');
    } catch (e) {
      console.error(`Error: ${(e as Error).message}\n`);
      showFlagHelp('lightness');
    }
    try {
      saturation = parsePercentRange(args.saturation, 'saturation');
    } catch (e) {
      console.error(`Error: ${(e as Error).message}\n`);
      showFlagHelp('saturation');
    }
    try {
      hue = parseHueRange(args.hue);
    } catch (e) {
      console.error(`Error: ${(e as Error).message}\n`);
      showFlagHelp('hue');
    }

    // Validate scale types
    const lightnessScale = args['lightness-scale'];
    const saturationScale = args['saturation-scale'];
    const hueScale = args['hue-scale'];

    if (!isValidScaleType(lightnessScale)) {
      console.error(`Error: Invalid lightness-scale "${lightnessScale}"\n`);
      showFlagHelp('lightness-scale');
    }
    if (!isValidScaleType(saturationScale)) {
      console.error(`Error: Invalid saturation-scale "${saturationScale}"\n`);
      showFlagHelp('saturation-scale');
    }
    if (!isValidScaleType(hueScale)) {
      console.error(`Error: Invalid hue-scale "${hueScale}"\n`);
      showFlagHelp('hue-scale');
    }

    // Validate tinting options
    const tintColor = args['tint-color'];
    const tintOpacity = parseInt(args['tint-opacity'], 10);
    const tintBlend = args['tint-blend'];

    let validatedTintColor: string | undefined;
    if (tintColor) {
      try {
        validatedTintColor = chroma(tintColor).hex();
      } catch {
        console.error(`Error: Invalid tint-color "${tintColor}"\n`);
        showFlagHelp('tint-color');
      }
    }

    if (isNaN(tintOpacity) || tintOpacity < 0 || tintOpacity > 100) {
      console.error(`Error: tint-opacity must be between 0 and 100, got "${args['tint-opacity']}"\n`);
      showFlagHelp('tint-opacity');
    }

    if (!isValidBlendMode(tintBlend)) {
      console.error(`Error: Invalid tint-blend "${tintBlend}"\n`);
      showFlagHelp('tint-blend');
    }

    // Parse and validate harmony types
    const addValues = args.add ? (Array.isArray(args.add) ? args.add : [args.add]) : [];
    const harmonies: HarmonyType[] = [];
    const hueShifts: number[] = [];
    
    for (const value of addValues) {
      // Check if it's a shift value (shift:N format)
      if (value.startsWith('shift:')) {
        const shiftStr = value.slice(6); // Remove 'shift:' prefix
        const shift = parseFloat(shiftStr);
        if (isNaN(shift)) {
          console.error(`Error: Invalid shift value "${shiftStr}" - must be a number\n`);
          showFlagHelp('add');
        }
        // Normalize to 0-360 range (allowing negatives for input)
        const normalized = ((shift % 360) + 360) % 360;
        if (!hueShifts.includes(normalized)) {
          hueShifts.push(normalized);
        }
      } else {
        // It's a harmony type
        if (!isValidHarmonyType(value)) {
          console.error(`Error: Invalid harmony type "${value}"\n`);
          showFlagHelp('add');
        }
        if (!harmonies.includes(value as HarmonyType)) {
          harmonies.push(value as HarmonyType);
        }
      }
    }

    // Warn if tint options used without tint-color
    if (!tintColor && tintOpacity > 0) {
      console.error('Warning: --tint-opacity has no effect without --tint-color');
    }
    if (!tintColor && tintBlend !== 'normal') {
      console.error('Warning: --tint-blend has no effect without --tint-color');
    }

    // Validate output format
    const outputType = args.output;
    if (!isValidOutputFormat(outputType)) {
      console.error(`Error: Invalid output format "${outputType}"\n`);
      showFlagHelp('output');
    }

    // Helper to build config for a given base color
    const buildConfig = (baseColor: string): ColorRampConfig => ({
      id: 'cli',
      name: 'ramp',
      baseColor,
      colorFormat: 'hex',
      totalSteps: size,
      lightnessStart: lightness.start,
      lightnessEnd: lightness.end,
      chromaStart: hue.start,
      chromaEnd: hue.end,
      saturationStart: saturation.start,
      saturationEnd: saturation.end,
      lightnessScaleType: lightnessScale,
      saturationScaleType: saturationScale,
      hueScaleType: hueScale,
      tintColor: validatedTintColor,
      tintOpacity: tintOpacity,
      tintBlendMode: tintBlend,
      swatches: [],
    });

    // Helper to get harmony colors for a given type
    const getHarmonyColors = (type: HarmonyType, baseColor: string): string[] => {
      switch (type) {
        case 'complementary':
          return getComplementaryColors(baseColor).slice(1);
        case 'triadic':
          return getTriadColors(baseColor).slice(1);
        case 'analogous':
          return getAnalogousColors(baseColor).slice(1);
        case 'split-complementary':
          return getSplitComplementaryColors(baseColor).slice(1);
        case 'square':
          return getSquareColors(baseColor).slice(1);
        case 'compound':
          return getCompoundColors(baseColor).slice(1);
      }
    };

    // Build common config for RampOutput
    const buildRampConfig = (): RampConfig => ({
      size,
      lightness: { start: lightness.start, end: lightness.end },
      saturation: { start: saturation.start, end: saturation.end },
      hue: { start: hue.start, end: hue.end },
      scales: {
        lightness: lightnessScale,
        saturation: saturationScale,
        hue: hueScale,
      },
      tint: validatedTintColor ? {
        color: validatedTintColor,
        opacity: tintOpacity,
        blend: tintBlend,
      } : null,
    });

    // Collect all ramps
    const ramps: RampOutput[] = [];

    // Generate base ramp
    const baseColors = generateColorRamp(buildConfig(validatedColor));
    const formattedBaseColors = baseColors.map(c => formatColor(c, outputFormat));
    ramps.push({
      name: 'base',
      baseColor: formatColor(validatedColor, outputFormat),
      config: buildRampConfig(),
      colors: formattedBaseColors,
    });

    // Generate harmony ramps
    for (const harmony of harmonies) {
      const harmonyColors = getHarmonyColors(harmony, validatedColor);
      harmonyColors.forEach((harmonyBaseColor, index) => {
        const suffix = harmonyColors.length > 1 ? `-${index + 1}` : '';
        const harmonyRampColors = generateColorRamp(buildConfig(harmonyBaseColor));
        const formattedHarmonyColors = harmonyRampColors.map(c => formatColor(c, outputFormat));
        ramps.push({
          name: `${harmony}${suffix}`,
          baseColor: formatColor(harmonyBaseColor, outputFormat),
          config: buildRampConfig(),
          colors: formattedHarmonyColors,
        });
      });
    }

    // Generate shifted ramps
    for (const shift of hueShifts) {
      const baseChroma = chroma(validatedColor);
      const [h, s, l] = baseChroma.hsl();
      const shiftedHue = ((h || 0) + shift) % 360;
      const shiftedBaseColor = chroma.hsl(shiftedHue, s, l).hex();
      const shiftedRampColors = generateColorRamp(buildConfig(shiftedBaseColor));
      const formattedShiftedColors = shiftedRampColors.map(c => formatColor(c, outputFormat));
      ramps.push({
        name: `shift-${Math.round(shift)}`,
        baseColor: formatColor(shiftedBaseColor, outputFormat),
        config: buildRampConfig(),
        colors: formattedShiftedColors,
      });
    }

    // Parse accessibility filter if flag is present
    const accessibilityEnabled = args.accessibility !== undefined;
    const accessibilityFilter = accessibilityEnabled ? parseAccessibilityFilter(args.accessibility) : undefined;

    // Output based on format
    if (outputType === 'json') {
      if (accessibilityEnabled) {
        const report = generateAccessibilityReport(ramps, accessibilityFilter!);
        const output = { ramps: JSON.parse(formatJson(ramps)).ramps, accessibility: formatAccessibilityJson(report) };
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log(formatJson(ramps));
      }
    } else if (outputType === 'css') {
      let output = formatCss(ramps);
      if (accessibilityEnabled) {
        const report = generateAccessibilityReport(ramps, accessibilityFilter!);
        output += formatAccessibilityCss(report);
      }
      console.log(output);
    } else {
      // Text output
      const canShowPreview = args.preview && supportsTruecolor();
      
      if (args.preview && !canShowPreview) {
        const limitationNote = getColorLimitationNote();
        if (limitationNote) {
          console.log(limitationNote);
          console.log('');
        }
      }
      ramps.forEach((ramp, rampIndex) => {
        if (rampIndex > 0 || ramps.length > 1) {
          if (rampIndex > 0) console.log('');
          console.log(`# ${ramp.name}`);
        }
        ramp.colors.forEach((color) => {
          if (canShowPreview) {
            const c = chroma(color);
            const [r, g, b] = c.rgb();
            const square = coloredSquare(r, g, b);
            console.log(`${square} ${color}`);
          } else {
            console.log(color);
          }
        });
      });

      if (accessibilityEnabled) {
        const report = generateAccessibilityReport(ramps, accessibilityFilter!);
        console.log(formatAccessibilityText(report, { preview: canShowPreview }));
      }
    }
  },
});

runMain(main);
