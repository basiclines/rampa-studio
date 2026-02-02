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

type ColorFormat = 'hex' | 'hsl' | 'rgb' | 'oklch';

// Help text for each flag
const FLAG_HELP = {
  base: `
--base, -b <color>  Base color for the palette

Examples:
  rampa --base="#3b82f6"
  rampa -b "rgb(59, 130, 246)"
  rampa -b "hsl(217, 91%, 60%)"
  rampa -b blue
`,
  size: `
--size <number>  Number of colors in palette (2-100)

Examples:
  rampa -b "#3b82f6" --size=5
  rampa -b "#3b82f6" --size=12
  rampa -b "#3b82f6" --size=20
`,
  format: `
--format, -f <type>  Output color format

Available formats: hex, hsl, rgb, oklch

Examples:
  rampa -b "#3b82f6" --format=hsl
  rampa -b "#3b82f6" -f oklch
  rampa -b "#3b82f6" -f rgb
`,
  lightness: `
--lightness, -l <start:end>  Lightness range (0-100)

Examples:
  rampa -b "#3b82f6" --lightness=10:90
  rampa -b "#3b82f6" -l 20:80
  rampa -b "#3b82f6" -l 0:50      # Dark palette
  rampa -b "#3b82f6" -l 50:100    # Light palette
`,
  saturation: `
--saturation, -S <start:end>  Saturation range (0-100)

Examples:
  rampa -b "#3b82f6" --saturation=20:80
  rampa -b "#3b82f6" -S 100:0     # Vibrant to muted
  rampa -b "#3b82f6" -S 50:50     # Constant saturation
`,
  hue: `
--hue, -H <start:end>  Hue shift in degrees (can be negative)

Examples:
  rampa -b "#3b82f6" --hue=-30:30
  rampa -b "#3b82f6" -H 0:0       # No hue shift
  rampa -b "#3b82f6" -H -45:45    # Wide hue variation
`,
  'lightness-scale': `
--lightness-scale <type>  Distribution curve for lightness

Available scales:
  ${SCALE_TYPES.join(', ')}

Examples:
  rampa -b "#3b82f6" --lightness-scale=fibonacci
  rampa -b "#3b82f6" --lightness-scale=ease-in-out
  rampa -b "#3b82f6" --lightness-scale=golden-ratio
`,
  'saturation-scale': `
--saturation-scale <type>  Distribution curve for saturation

Available scales:
  ${SCALE_TYPES.join(', ')}

Examples:
  rampa -b "#3b82f6" --saturation-scale=ease-out
  rampa -b "#3b82f6" --saturation-scale=logarithmic
`,
  'hue-scale': `
--hue-scale <type>  Distribution curve for hue

Available scales:
  ${SCALE_TYPES.join(', ')}

Examples:
  rampa -b "#3b82f6" --hue-scale=fibonacci
  rampa -b "#3b82f6" --hue-scale=ease-in
`,
  'tint-color': `
--tint-color <color>  Tint color to blend over the palette

Examples:
  rampa -b "#3b82f6" --tint-color="#FF6600" --tint-opacity=20
  rampa -b "#3b82f6" --tint-color="orange" --tint-opacity=15
`,
  'tint-opacity': `
--tint-opacity <number>  Tint strength (0-100)

Examples:
  rampa -b "#3b82f6" --tint-color="#FF6600" --tint-opacity=10
  rampa -b "#3b82f6" --tint-color="#FF6600" --tint-opacity=30
  rampa -b "#3b82f6" --tint-color="#FF6600" --tint-opacity=50
`,
  'tint-blend': `
--tint-blend <mode>  Blend mode for tinting

Available modes:
  ${BLEND_MODES.join(', ')}

Examples:
  rampa -b "#3b82f6" --tint-color="#FF0000" --tint-opacity=20 --tint-blend=multiply
  rampa -b "#3b82f6" --tint-color="#FF0000" --tint-opacity=20 --tint-blend=overlay
  rampa -b "#3b82f6" --tint-color="#FF0000" --tint-opacity=20 --tint-blend=screen
`,
  add: `
--add <harmony>  Add harmony ramps (can be used multiple times)

Available harmonies:
  ${HARMONY_TYPES.join(', ')}

Examples:
  rampa -b "#3b82f6" --add=complementary
  rampa -b "#3b82f6" --add=triadic
  rampa -b "#3b82f6" --add=complementary --add=analogous
  rampa -b "#3b82f6" --add=split-complementary --add=square
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

// Add colored square using ANSI 24-bit true color
function coloredOutput(color: string, format: ColorFormat): string {
  const c = chroma(color);
  const [r, g, b] = c.rgb();
  const square = `\x1b[38;2;${r};${g};${b}m■\x1b[0m`;
  return `${square} ${formatColor(color, format)}`;
}

const validFormats = ['hex', 'hsl', 'rgb', 'oklch'];

const main = defineCommand({
  meta: {
    name: 'rampa',
    version: '0.1.0',
    description: 'Generate mathematically accurate color palettes from a base color',
  },
  args: {
    base: {
      type: 'string',
      alias: 'b',
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
      alias: 'f',
      description: 'Output format: hex, hsl, rgb, oklch (default: same as input)',
    },
    lightness: {
      type: 'string',
      alias: 'l',
      description: 'Lightness range start:end (0-100, default: 0:100)',
      default: '0:100',
    },
    saturation: {
      type: 'string',
      alias: 'S',
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
      description: 'Add harmony ramp (repeatable: complementary, triadic, etc.)',
    },
    name: {
      type: 'string',
      description: 'Name for the ramp (used in output headers)',
      default: 'ramp',
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

    // Detect input format before validation
    const detectedFormat = detectColorFormat(args.base);
    
    // Validate base color
    let validatedColor: string;
    try {
      validatedColor = chroma(args.base).hex();
    } catch {
      showFlagHelp('base');
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
    for (const h of addValues) {
      if (!isValidHarmonyType(h)) {
        console.error(`Error: Invalid harmony type "${h}"\n`);
        showFlagHelp('add');
      }
      if (!harmonies.includes(h as HarmonyType)) {
        harmonies.push(h as HarmonyType);
      }
    }

    // Warn if tint options used without tint-color
    if (!tintColor && tintOpacity > 0) {
      console.error('Warning: --tint-opacity has no effect without --tint-color');
    }
    if (!tintColor && tintBlend !== 'normal') {
      console.error('Warning: --tint-blend has no effect without --tint-color');
    }

    const rampName = args.name;

    // Helper to build config for a given base color
    const buildConfig = (baseColor: string): ColorRampConfig => ({
      id: 'cli',
      name: rampName,
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

    // Helper to output a ramp
    const outputRamp = (name: string, colors: string[], isFirst: boolean) => {
      if (!isFirst || harmonies.length > 0) {
        if (!isFirst) console.log('');
        console.log(`# ${name}`);
      }
      colors.forEach((color) => {
        if (args.preview) {
          console.log(coloredOutput(color, outputFormat));
        } else {
          console.log(formatColor(color, outputFormat));
        }
      });
    };

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

    // Generate and output base ramp
    const baseColors = generateColorRamp(buildConfig(validatedColor));
    outputRamp('base', baseColors, true);

    // Generate and output harmony ramps
    for (const harmony of harmonies) {
      const harmonyColors = getHarmonyColors(harmony, validatedColor);
      harmonyColors.forEach((harmonyBaseColor, index) => {
        const suffix = harmonyColors.length > 1 ? `-${index + 1}` : '';
        const harmonyRampColors = generateColorRamp(buildConfig(harmonyBaseColor));
        outputRamp(`${harmony}${suffix}`, harmonyRampColors, false);
      });
    }
  },
});

runMain(main);
