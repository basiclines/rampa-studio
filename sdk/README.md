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

### `rampa.contrast(foreground, background, mode?)`

Evaluate contrast between two colors. Returns score, pass/fail levels, and lint warnings. Default mode is `'apca'`.

```js
// APCA (default) — returns Lc value
const result = rampa.contrast('#ffffff', '#1e1e2e');
result.score      // -104.3 (Lc value)
result.pass       // true (at least one level passes)
result.levels     // [{ name: 'Preferred body text', threshold: 90, pass: true }, ...]
result.warnings   // []

// WCAG 2.x — chain .mode('wcag')
const wcag = rampa.contrast('#777', '#ffffff').mode('wcag');
wcag.score        // 4.48 (contrast ratio)
wcag.levels       // [{ name: 'AAA Normal text', threshold: 7, pass: false }, ...]
```

**Lint warnings** fire automatically:
- Near-identical colors (deltaE < 3)
- Contrast below minimum usable threshold
- Pure `#000000` or `#ffffff` detected

## Types

```typescript
import type {
  ColorFormat,         // 'hex' | 'hsl' | 'rgb' | 'oklch'
  ScaleType,           // 'linear' | 'fibonacci' | 'golden-ratio' | ...
  BlendMode,           // 'normal' | 'multiply' | 'screen' | ...
  HarmonyType,         // 'complementary' | 'triadic' | 'analogous' | ...
  RampResult,          // { name, baseColor, colors }
  RampaResult,         // { ramps: RampResult[] }
  ColorInfo,           // { hex, rgb, hsl, oklch } — returned by readOnly()
  InterpolationMode,   // 'oklch' | 'lab' | 'rgb'
  ColorResult,         // { hex, format(), toString() }
  LinearColorSpaceFn,  // callable function returned by LinearColorSpace.size()
  CubeColorSpaceFn,    // callable function returned by CubeColorSpace.size()
  ContrastMode,        // 'wcag' | 'apca'
  ContrastLevelResult, // { name, threshold, pass }
  ContrastResult,      // { mode, score, pass, levels, warnings, foreground, background }
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

## Color Spaces

Color spaces let you create structured palettes from a set of anchor colors and query them semantically. Three geometric primitives are available:

- **LinearColorSpace** — 1D interpolated ramp
- **PlaneColorSpace** — 2D saturation×lightness plane
- **CubeColorSpace** — 3D trilinear interpolation cube

### `LinearColorSpace`

Interpolates between two colors to produce an evenly-spaced ramp.

```typescript
import { LinearColorSpace } from '@basiclines/rampa-sdk';

const neutral = new LinearColorSpace('#ffffff', '#000000').size(24);
neutral(1)               // → '#ffffff' (lightest, returns string directly)
neutral(12)              // → '#666666' (mid gray)
neutral(12).hsl()        // → 'hsl(0, 0%, 40%)'
neutral.palette          // → string[24]
```

#### Lookup table mode

Set `.interpolation(false)` for a plain lookup table — no interpolation, just indexed access to the exact colors you provide:

```typescript
const base = new LinearColorSpace(
  '#45475a', '#f38ba8', '#a6e3a1', '#f9e2af',
  '#89b4fa', '#f5c2e7', '#94e2d5', '#a6adc8'
).interpolation(false).size(8);

base(1)  // → '#45475a' (exact, no interpolation)
base(3)  // → '#a6e3a1'
```

### `PlaneColorSpace`

Creates a 2D color plane for a single hue, anchored to shared dark/light values. Create one plane per hue.

```
Y(lightness)
1 │  light ─────────── hue
  │    │                 │
  │    │   interpolated  │
  │    │                 │
0 │  dark ─────────── dark
  └──────────────────────── X(saturation)
      0                  1
```

At Y=0 the entire row converges to the dark anchor.

```typescript
import { PlaneColorSpace } from '@basiclines/rampa-sdk';

// One plane per hue, reuse dark/light anchors
const red  = new PlaneColorSpace('#1e1e2e', '#cdd6f4', '#f38ba8').size(6);
const blue = new PlaneColorSpace('#1e1e2e', '#cdd6f4', '#89b4fa').size(6);

red(3, 5)          // → ColorAccessor (saturation=3, lightness=5)
red(0, 3)          // → achromatic at lightness 3 (no hue influence)
red(5, 5)          // → full hue color
red(0, 0)          // → dark anchor
red.palette        // → string[36] (6²)

// Template literals and concatenation work directly
`background: ${red(3, 5)};`  // → 'background: #ab34cd;'

// Format conversion
red(3, 5).hsl()    // → 'hsl(280, 60%, 50%)'
red(3, 5).oklch()  // → 'oklch(52.3% 0.198 310)'
```

### `CubeColorSpace`

Creates a 3D color cube from 8 corner colors via trilinear interpolation. The constructor keys become alias names for semantic lookups.

```typescript
import { CubeColorSpace } from '@basiclines/rampa-sdk';

const { r, b, tint } = new CubeColorSpace({
  k: '#1e1e2e',    // origin (0,0,0)
  r: '#f38ba8',    // x axis
  g: '#a6e3a1',    // y axis
  b: '#89b4fa',    // z axis
  y: '#f9e2af',    // x+y
  m: '#cba6f7',    // x+z
  c: '#94e2d5',    // y+z
  w: '#cdd6f4',    // x+y+z
}).size(6);

r(4)                     // → strong red
tint({ r: 4, b: 2 })     // → red-blue blend
tint({ w: 3 })           // → mid-white (all axes at 3)
```

#### Custom vocabulary

The alias names are whatever you put in the constructor — not limited to ANSI names:

```typescript
const space = new CubeColorSpace({
  dark:    '#1a1a2e',
  warm:    '#e74c3c',
  nature:  '#2ecc71',
  ocean:   '#3498db',
  sunset:  '#f39c12',
  berry:   '#9b59b6',
  mint:    '#1abc9c',
  light:   '#ecf0f1',
}).size(6);

space({ warm: 4, ocean: 2 })  // → warm-ocean blend
```

#### How aliases map to the cube

The 8 keys map to cube corners by insertion order:

| Position | Key # | Cube coords | Axis mask |
|----------|-------|-------------|-----------|
| 1st | origin | (0,0,0) | — |
| 2nd | x | (1,0,0) | x |
| 3rd | y | (0,1,0) | y |
| 4th | z | (0,0,1) | z |
| 5th | xy | (1,1,0) | x+y |
| 6th | xz | (1,0,1) | x+z |
| 7th | yz | (0,1,1) | y+z |
| 8th | xyz | (1,1,1) | x+y+z |

When you call `tint({ r: 4, b: 2 })`, each alias's mask is multiplied by its intensity and merged with `Math.max` to produce cube coordinates.

### Interpolation modes

`LinearColorSpace`, `PlaneColorSpace`, and `CubeColorSpace` all support configurable interpolation:

| Mode | Description |
|------|-------------|
| `'oklch'` (default) | Perceptually uniform — hues travel the color wheel, even lightness steps |
| `'lab'` | CIE L\*a\*b\* — perceptual but no hue rotation |
| `'rgb'` | Linear RGB — fast but perceptually uneven |
| `false` | No interpolation — plain lookup table (LinearColorSpace only) |

```typescript
// LinearColorSpace
new LinearColorSpace('#ff0000', '#0000ff').interpolation('oklch').size(10)
new LinearColorSpace('#ff0000', '#0000ff').interpolation('lab').size(10)
new LinearColorSpace('#f00', '#0f0', '#00f').interpolation(false).size(3)

// PlaneColorSpace
new PlaneColorSpace('#000', '#fff', '#f00').interpolation('oklch').size(6)
new PlaneColorSpace('#000', '#fff', '#f00').interpolation('lab').size(6)

// CubeColorSpace
new CubeColorSpace({ ... }).interpolation('lab').size(6)
```

### Color accessor

All color space lookups return a `ColorAccessor` — a string that works directly in template literals and concatenation, with conversion methods:

```typescript
const c = red(3, 5);
`${c}`             // → '#ab34cd' (string coercion)
'bg: ' + c         // → 'bg: #ab34cd' (concatenation)
c.hex()            // → '#ab34cd'
c.hsl()            // → 'hsl(280, 60%, 50%)'
c.rgb()            // → 'rgb(171, 52, 205)'
c.oklch()          // → 'oklch(52.3% 0.198 310)'
c.luminance        // → 0.52 (perceptual, 0–1)
```

Use `.format()` on the color space to change the default output format:

```typescript
const rgbSpace = new PlaneColorSpace('#000', '#fff', '#f00').format('rgb').size(6);
`${rgbSpace(3, 5)}`  // → 'rgb(255, 128, 128)'
rgbSpace(3, 5).hex() // → '#ff8080' (still available)
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
