# Rampa SDK

Programmatic JavaScript/TypeScript SDK for generating mathematically accurate, accessible color palettes. Same engine as the [Rampa CLI](../cli/README.md), designed for use in applications, build tools, and design systems.

## Installation

```bash
npm install @basiclines/rampa-sdk
```

## Quick Start

```typescript
import { rampa } from '@basiclines/rampa-sdk';

// Generate a 10-color palette from blue
const result = rampa('#3b82f6').generate();

// Custom size with lightness range
const palette = rampa('#3b82f6').size(5).lightness(10, 90).generate();

// Add complementary harmony
const harmonies = rampa('#3b82f6').add('complementary').generate();

// Output as CSS variables
const css = rampa('#3b82f6').toCSS();
```

## API

### `rampa(baseColor)`

Creates a new builder for a color palette. Accepts any valid CSS color (hex, hsl, rgb, oklch, named colors).

```typescript
const builder = rampa('#3b82f6');
const builder = rampa('rgb(59, 130, 246)');
const builder = rampa('hsl(217, 91%, 60%)');
const builder = rampa('oklch(62.3% 0.214 259)');
```

### Builder Methods

All builder methods return `this` for chaining.

#### `.size(steps)`

Number of colors in the palette (2-100, default: 10).

```typescript
rampa('#3b82f6').size(5).generate();
```

#### `.format(type)`

Color format for output values: `hex`, `hsl`, `rgb`, `oklch` (default: `hex`).

```typescript
rampa('#3b82f6').format('hsl').generate();
// colors: ['hsl(0, 0%, 0%)', 'hsl(212, 69%, 25%)', ...]
```

#### `.lightness(start, end)`

Lightness range 0-100 (default: 0, 100).

```typescript
rampa('#3b82f6').lightness(10, 90).generate();
```

#### `.saturation(start, end)`

Saturation range 0-100 (default: 100, 0).

```typescript
rampa('#3b82f6').saturation(80, 20).generate();
```

#### `.hue(start, end)`

Hue shift in degrees (default: -10, 10).

```typescript
rampa('#3b82f6').hue(-30, 30).generate();
```

#### `.lightnessScale(type)`, `.saturationScale(type)`, `.hueScale(type)`

Distribution curve for each channel (default: `linear`).

Available scales: `linear`, `geometric`, `fibonacci`, `golden-ratio`, `logarithmic`, `powers-of-2`, `musical-ratio`, `cielab-uniform`, `ease-in`, `ease-out`, `ease-in-out`

```typescript
rampa('#3b82f6')
  .lightnessScale('fibonacci')
  .saturationScale('ease-out')
  .hueScale('golden-ratio')
  .generate();
```

#### `.tint(color, opacity, blend?)`

Apply a tint color over the palette.

- `color` — Any valid CSS color
- `opacity` — Tint strength 0-100
- `blend` — Blend mode (default: `normal`)

Available blend modes: `normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`

```typescript
rampa('#3b82f6')
  .tint('#FF0000', 15, 'overlay')
  .generate();
```

#### `.add(type)` / `.add('shift', degrees)`

Add a harmony ramp. Can be called multiple times.

Available harmony types:
- `complementary` — Opposite on color wheel (+180°)
- `triadic` — 3 colors, 120° apart
- `analogous` — Adjacent colors, 30° apart
- `split-complementary` — 2 colors near opposite
- `square` — 4 colors, 90° apart
- `compound` — Complementary + split
- `shift` — Custom hue rotation by N degrees

```typescript
rampa('#3b82f6')
  .add('complementary')
  .add('triadic')
  .add('shift', 45)
  .generate();
```

### Terminal Methods

These methods execute the builder and return results.

#### `.generate()`

Returns a `RampaResult` object with all generated ramps.

```typescript
const result = rampa('#3b82f6').size(5).add('complementary').generate();
// {
//   ramps: [
//     { name: 'base', baseColor: '#3b82f6', colors: ['#000000', '#143d6b', ...] },
//     { name: 'complementary', baseColor: '#f6a43b', colors: ['#000000', '#6b4314', ...] }
//   ]
// }
```

#### `.toCSS()`

Returns CSS custom properties string.

```typescript
const css = rampa('#3b82f6').size(5).toCSS();
// :root {
//   /* base */
//   --base-0: #000000;
//   --base-1: #143d6b;
//   --base-2: #4572ba;
//   --base-3: #b1b9ce;
//   --base-4: #ffffff;
// }
```

#### `.toJSON()`

Returns formatted JSON string.

```typescript
const json = rampa('#3b82f6').size(5).toJSON();
// {
//   "ramps": [
//     {
//       "name": "base",
//       "baseColor": "#3b82f6",
//       "colors": ["#000000", "#143d6b", "#4572ba", "#b1b9ce", "#ffffff"]
//     }
//   ]
// }
```

### `rampa.readOnly(color)`

Read a color without generating a ramp — equivalent to `--read-only` in the CLI. Returns a `ReadOnlyBuilder` with chainable `.format()` and terminal `.generate()`.

Without a format, `.generate()` returns a `ColorInfo` object with all representations:

```typescript
rampa.readOnly('#fe0000').generate();
// {
//   hex: '#fe0000',
//   rgb: { r: 254, g: 0, b: 0 },
//   hsl: { h: 0, s: 100, l: 50 },
//   oklch: { l: 62.8, c: 0.257, h: 29 }
// }
```

With `.format()`, `.generate()` returns a formatted string:

```typescript
rampa.readOnly('#fe0000').format('hsl').generate();   // 'hsl(0, 100%, 50%)'
rampa.readOnly('#fe0000').format('rgb').generate();   // 'rgb(254, 0, 0)'
rampa.readOnly('#fe0000').format('oklch').generate(); // 'oklch(62.8% 0.257 29)'
```

### `rampa.convert(color, format)`

Standalone utility to convert a color to a different format.

```typescript
rampa.convert('#fe0000', 'hsl');    // 'hsl(0, 100%, 50%)'
rampa.convert('#fe0000', 'rgb');    // 'rgb(254, 0, 0)'
rampa.convert('#fe0000', 'oklch');  // 'oklch(62.8% 0.257 29)'
rampa.convert('#fe0000', 'hex');    // '#fe0000'
```

### `rampa.mix(color1, color2, t)`

Mix two colors in OKLCH space at a given ratio. Produces perceptually uniform transitions — hues travel the color wheel naturally, lightness steps look even, and chroma stays vivid instead of dipping through gray.

```js
rampa.mix('#ff0000', '#0000ff', 0);    // '#ff0302' (start color)
rampa.mix('#ff0000', '#0000ff', 0.5);  // midpoint — vivid purple, not muddy gray
rampa.mix('#ff0000', '#0000ff', 1);    // '#0031e5' (end color)
rampa.mix('#000000', '#ffffff', 0.5);  // perceptual mid-gray
```

Generate a gradient with multiple steps:

```js
const steps = 10;
const gradient = Array.from({ length: steps }, (_, i) =>
  rampa.mix('#ff0000', '#0000ff', i / (steps - 1))
);
```

## Types

```typescript
import type {
  ColorFormat,    // 'hex' | 'hsl' | 'rgb' | 'oklch'
  ScaleType,      // 'linear' | 'fibonacci' | 'golden-ratio' | ...
  BlendMode,      // 'normal' | 'multiply' | 'screen' | ...
  HarmonyType,    // 'complementary' | 'triadic' | 'analogous' | ...
  RampResult,     // { name, baseColor, colors }
  RampaResult,    // { ramps: RampResult[] }
  ColorInfo,      // { hex, rgb, hsl, oklch } — returned by readOnly()
} from '@basiclines/rampa-sdk';
```

## Examples

### Design System Palette

```typescript
import { rampa } from '@basiclines/rampa-sdk';

const primary = rampa('#3b82f6')
  .size(10)
  .lightness(5, 95)
  .saturationScale('ease-out')
  .generate();

const neutral = rampa('#64748b')
  .size(10)
  .saturation(20, 0)
  .generate();

const danger = rampa('#ef4444')
  .size(10)
  .lightness(10, 90)
  .generate();
```

### Full Palette with Harmonies

```typescript
const palette = rampa('#3b82f6')
  .size(10)
  .lightness(5, 95)
  .lightnessScale('ease-in-out')
  .add('complementary')
  .add('analogous')
  .generate();

// palette.ramps[0] → base (blue)
// palette.ramps[1] → complementary (orange)
// palette.ramps[2] → analogous (purple)
```

### CSS Variables for a Theme

```typescript
const theme = rampa('#3b82f6')
  .size(10)
  .add('complementary')
  .tint('#FFD700', 5, 'overlay')
  .toCSS();

// Inject into page
const style = document.createElement('style');
style.textContent = theme;
document.head.appendChild(style);
```

### Build Tool Integration

```typescript
import { rampa } from '@basiclines/rampa-sdk';
import { writeFileSync } from 'fs';

const colors = rampa('#3b82f6')
  .size(10)
  .format('hsl')
  .generate();

// Write to a tokens file
writeFileSync('tokens.json', JSON.stringify(colors, null, 2));
```

## CLI Parity

The SDK produces identical output to the CLI. These are equivalent:

```bash
# CLI
rampa --color "#3b82f6" --size=5 --lightness 10:90 --add=complementary --output json
```

```typescript
// SDK
rampa('#3b82f6').size(5).lightness(10, 90).add('complementary').toJSON();
```

## Development

```bash
cd sdk
bun install

# Run tests
bun test

# Build
bun run build
```
