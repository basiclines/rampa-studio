import { defineCommand, runMain } from 'citty';
import chroma from 'chroma-js';
import { generateColorRamp } from '../../src/engine/ColorEngine';
import type { ColorRampConfig } from '../../src/entities/ColorRampEntity';
import { parsePercentRange, parseHueRange } from './utils/range-parser';
import { SCALE_TYPES, isValidScaleType, getScaleTypesHelp } from './constants/scales';

type ColorFormat = 'hex' | 'hsl' | 'rgb' | 'oklch';

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
  },
  run({ args }) {
    // Detect input format before validation
    const detectedFormat = detectColorFormat(args.base);
    
    // Validate base color
    let validatedColor: string;
    try {
      validatedColor = chroma(args.base).hex();
    } catch {
      console.error(`Error: Invalid color "${args.base}"\n`);
      console.error('Examples of valid colors:');
      console.error('  #FF0000');
      console.error('  #f00');
      console.error('  rgb(255, 0, 0)');
      console.error('  hsl(0, 100%, 50%)');
      console.error('  red');
      process.exit(1);
    }

    // Validate size
    const size = parseInt(args.size, 10);
    if (isNaN(size) || size < 2 || size > 100) {
      console.error(`Error: Size must be a number between 2 and 100, got "${args.size}"`);
      process.exit(1);
    }

    // Determine output format (flag overrides auto-detection)
    const outputFormat = (args.format?.toLowerCase() || detectedFormat) as ColorFormat;
    if (!validFormats.includes(outputFormat)) {
      console.error(`Error: Invalid format "${args.format}". Use: hex, hsl, rgb, oklch`);
      process.exit(1);
    }

    // Parse ranges
    let lightness, saturation, hue;
    try {
      lightness = parsePercentRange(args.lightness, 'lightness');
    } catch (e) {
      console.error(`Error: ${(e as Error).message}`);
      process.exit(1);
    }
    try {
      saturation = parsePercentRange(args.saturation, 'saturation');
    } catch (e) {
      console.error(`Error: ${(e as Error).message}`);
      process.exit(1);
    }
    try {
      hue = parseHueRange(args.hue);
    } catch (e) {
      console.error(`Error: ${(e as Error).message}`);
      process.exit(1);
    }

    // Validate scale types
    const lightnessScale = args['lightness-scale'];
    const saturationScale = args['saturation-scale'];
    const hueScale = args['hue-scale'];

    if (!isValidScaleType(lightnessScale)) {
      console.error(`Error: Invalid lightness-scale "${lightnessScale}"`);
      console.error(`Available: ${getScaleTypesHelp()}`);
      process.exit(1);
    }
    if (!isValidScaleType(saturationScale)) {
      console.error(`Error: Invalid saturation-scale "${saturationScale}"`);
      console.error(`Available: ${getScaleTypesHelp()}`);
      process.exit(1);
    }
    if (!isValidScaleType(hueScale)) {
      console.error(`Error: Invalid hue-scale "${hueScale}"`);
      console.error(`Available: ${getScaleTypesHelp()}`);
      process.exit(1);
    }

    // Build config for engine
    const config: ColorRampConfig = {
      id: 'cli',
      name: 'ramp',
      baseColor: validatedColor,
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
      swatches: [],
    };

    // Generate colors
    const colors = generateColorRamp(config);

    // Output in requested format
    colors.forEach((color) => {
      if (args.preview) {
        console.log(coloredOutput(color, outputFormat));
      } else {
        console.log(formatColor(color, outputFormat));
      }
    });
  },
});

runMain(main);
