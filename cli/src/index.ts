import { defineCommand, runMain } from 'citty';
import chroma from 'chroma-js';
import { generateColorRamp } from '../../src/engine/ColorEngine';
import type { ColorRampConfig } from '../../src/entities/ColorRampEntity';

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

    // Build config for engine (using website defaults)
    const config: ColorRampConfig = {
      id: 'cli',
      name: 'ramp',
      baseColor: validatedColor,
      colorFormat: 'hex',
      totalSteps: size,
      lightnessStart: 0,      // Website default: dark to light
      lightnessEnd: 100,
      chromaStart: -10,       // Website default: slight hue shift
      chromaEnd: 10,
      saturationStart: 100,   // Website default: high to low
      saturationEnd: 0,
      swatches: [],
    };

    // Generate colors
    const colors = generateColorRamp(config);

    // Output in requested format
    colors.forEach((color) => {
      console.log(formatColor(color, outputFormat));
    });
  },
});

runMain(main);
