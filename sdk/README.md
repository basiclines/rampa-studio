# Rampa SDK

Programmatic JavaScript/TypeScript SDK for generating mathematically accurate, accessible color palettes. Same engine as the [Rampa CLI](../cli/README.md), designed for use in applications, build tools, and design systems.

## Installation

```bash
npm install @basiclines/rampa-sdk
```

### Vanilla JS (CDN / Script Tag)

A pre-built browser bundle is available on every [GitHub Release](https://github.com/basiclines/rampa-studio/releases). No bundler or build step needed — just drop a `<script>` tag:

```html
<script src="https://github.com/basiclines/rampa-studio/releases/latest/download/rampa-sdk.min.js"></script>
<script>
  // Everything is available under the global `Rampa` object
  const palette = Rampa.rampa('#3b82f6').size(5);
  console.log('' + palette(1));   // first color
  console.log(palette.palette);   // all colors

  const css = Rampa.rampa('#3b82f6').output('css');
  const mixed = Rampa.rampa.mix('#ff0000', '#0000ff', 0.5);

  const linear = new Rampa.LinearColorSpace('#ffffff', '#000000').size(10);
  console.log('' + linear(5)); // midpoint gray

  const c = Rampa.color('#3b82f6');
  console.log(c.hex, c.rgb, c.luminance);
</script>
```

Pin a specific version by replacing `latest` with the tag name:

```
https://github.com/basiclines/rampa-studio/releases/download/v3.0.0/rampa-sdk.min.js
```

## Quick Start

```typescript
import { rampa } from '@basiclines/rampa-sdk';

// Generate a 10-color palette from blue
const palette = rampa('#3b82f6');
palette(1)            // first color (ColorAccessor)
palette(5).oklch()    // format conversion

// Custom size with lightness range
const custom = rampa('#3b82f6').size(5).lightness(10, 90);
custom(3)             // third color

// Add complementary harmony
const harmonies = rampa('#3b82f6').add('complementary');
harmonies.ramps       // [base, complementary]

// Output as CSS variables
const css = rampa('#3b82f6').output('css');
```

## API

### `rampa(baseColor)`

Creates a callable color palette. Accepts any valid CSS color (hex, hsl, rgb, oklch, named colors). All methods are chainable in any order, and the result is always callable with a 1-based index.

```typescript
const palette = rampa('#3b82f6');
const palette = rampa('rgb(59, 130, 246)');
const palette = rampa('hsl(217, 91%, 60%)');
const palette = rampa('oklch(62.3% 0.214 259)');

palette(1)           // first color
palette(5).hsl()     // format conversion
palette.palette      // string[] of all colors
```

### Builder Methods

All builder methods return the same callable for chaining in any order.

#### `.size(steps)`

Number of colors in the palette (2-100, default: 10).

```typescript
rampa('#3b82f6').size(5);
```

#### `.format(type)`

Color format for output values: `hex`, `hsl`, `rgb`, `oklch` (default: `hex`).

```typescript
rampa('#3b82f6').format('hsl');
// palette(1) → 'hsl(0, 0%, 0%)', palette(2) → 'hsl(212, 69%, 25%)', ...
```

#### `.lightness(start, end)`

Lightness range 0-100 (default: 0, 100).

```typescript
rampa('#3b82f6').lightness(10, 90);
```

#### `.saturation(start, end)`

Saturation range 0-100 (default: 100, 0).

```typescript
rampa('#3b82f6').saturation(80, 20);
```

#### `.hue(start, end)`

Hue shift in degrees (default: -10, 10).

```typescript
rampa('#3b82f6').hue(-30, 30);
```

#### `.lightnessDistribution(type)`, `.saturationDistribution(type)`, `.hueDistribution(type)`

Distribution curve for each channel (default: `linear`).

Available distributions: `linear`, `geometric`, `fibonacci`, `golden-ratio`, `logarithmic`, `powers-of-2`, `musical-ratio`, `cielab-uniform`, `ease-in`, `ease-out`, `ease-in-out`

```typescript
rampa('#3b82f6')
  .lightnessDistribution('fibonacci')
  .saturationDistribution('ease-out')
  .hueDistribution('golden-ratio');
```

#### `.tint(color, opacity, blend?)`

Apply a tint color over the palette.

- `color` — Any valid CSS color
- `opacity` — Tint strength 0-100
- `blend` — Blend mode (default: `normal`)

Available blend modes: `normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`

```typescript
rampa('#3b82f6')
  .tint('#FF0000', 15, 'overlay');
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
  .add('shift', 45);
```

### Accessing Colors

Call the palette with a 1-based index to get a `ColorAccessor`:

```typescript
const palette = rampa('#3b82f6').size(5).lightness(10, 90);

palette(1)           // ColorAccessor — first color
palette(3).hsl()     // format conversion
palette(5).oklch()   // any format
`${palette(1)}`      // works in template literals

palette.palette      // string[] of all colors
palette.ramps        // RampResult[] (base + harmonies)
```

### Output Methods

#### `.output(format, prefix?)`

Export the palette as `'css'`, `'json'`, or `'text'`. Optional `prefix` sets variable/ramp names (default: `'base'`).

```typescript
// CSS custom properties
rampa('#3b82f6').size(5).output('css', 'primary');
// :root {
//   /* primary */
//   --primary-0: #000000;
//   --primary-1: #143d6b;
//   --primary-2: #4572ba;
//   --primary-3: #b1b9ce;
//   --primary-4: #ffffff;
// }

// JSON
rampa('#3b82f6').size(5).output('json', 'primary');
// {
//   "ramps": [
//     {
//       "name": "primary",
//       "baseColor": "#3b82f6",
//       "colors": ["#000000", "#143d6b", "#4572ba", "#b1b9ce", "#ffffff"]
//     }
//   ]
// }

// Plain text (one color per line)
rampa('#3b82f6').size(5).output('text');
// #000000
// #143d6b
// #4572ba
// #b1b9ce
// #ffffff
```

#### `.ramps` / `.palette`

Access the generated ramps and colors directly as properties:

```typescript
const result = rampa('#3b82f6').size(5).add('complementary');
result.palette                // base ramp colors: ['#000000', '#143d6b', ...]
result.ramps                  // all ramps: [{ name: 'base', ... }, { name: 'complementary', ... }]
result.ramps[1].colors        // complementary ramp colors
```

### `color(input)`

Inspect, transform, mix, and export a single color. Equivalent to `rampa color` in the CLI.

All property values use **0-1 normalized ranges** to match CSS spec conventions:

| Property | Range |
|----------|-------|
| `hsl.h` | 0–360 (degrees) |
| `hsl.s`, `hsl.l` | 0–1 |
| `oklch.l` | 0–1 |
| `oklch.c` | 0–0.4 (native OKLCH scale) |
| `oklch.h` | 0–360 (degrees) |

```typescript
import { color } from '@basiclines/rampa-sdk';

const c = color('#fe0000');
c.hex              // '#fe0000'
c.rgb              // { r: 254, g: 0, b: 0 }
c.hsl              // { h: 0, s: 1.0, l: 0.5 }
c.oklch            // { l: 0.628, c: 0.258, h: 29 }
c.luminance        // 0.628

// Format conversion (string output uses CSS conventions: percentages)
c.format('hsl')    // 'hsl(0, 100%, 50%)'
c.format('rgb')    // 'rgb(254, 0, 0)'
c.format('oklch')  // 'oklch(62.8% 0.258 29)'

// Export
c.output('json')           // JSON with all formats
c.output('css', 'brand')   // CSS custom properties with prefix
c.output('text')           // plain hex string

// String coercion
`${c}`             // '#fe0000'
```

#### Color Transforms

All transforms operate in **OKLCH space** and return a new immutable `Color`. Chain freely.

```typescript
// Absolute deltas — clamped to valid range
c.lighten(0.1)           // L += 0.1 (OKLCH lightness, 0-1)
c.darken(0.1)            // L -= 0.1
c.saturate(0.05)         // C += 0.05 (OKLCH chroma)
c.desaturate(0.05)       // C -= 0.05
c.rotate(30)             // H += 30° (hue rotation)

// All accept negative values: lighten(-0.1) === darken(0.1)

// Set absolute OKLCH values
c.set({ lightness: 0.48 })             // set L
c.set({ chroma: 0.15, hue: 200 })     // batch set

// Chain transforms
color('#66b172').lighten(0.1).desaturate(0.05).hex
// → bright desaturated green, no throwaway converters
```

#### Mix (color space interpolation)

Like CSS `color-mix()` — interpolates between two colors in a chosen color space.

```typescript
c.mix('#0000ff', 0.5)            // 50% mix in oklch (default)
c.mix('#0000ff', 0.18, 'lab')    // explicit color space
c.mix('#0000ff', 0.18, 'srgb')   // sRGB interpolation
```

#### Blend (compositing modes)

Like Photoshop/CSS blend modes — composites two colors with an opacity and a blend mode.

```typescript
c.blend('#0000ff', 0.15, 'multiply')
c.blend('#0000ff', 0.15, 'screen')
c.blend('#0000ff', 0.15, 'overlay')
```

Available blend modes: `normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`

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

### `lint(foreground, background)`

Evaluate contrast between two colors. Returns score, pass/fail levels, and lint warnings. Default mode is `'apca'`.

```js
import { lint } from '@basiclines/rampa-sdk';

// APCA (default) — returns Lc value
const result = lint('#ffffff', '#1e1e2e');
result.score      // -104.3 (Lc value)
result.pass       // true (at least one level passes)
result.levels     // [{ name: 'Preferred body text', threshold: 90, pass: true }, ...]
result.warnings   // []

// WCAG 2.x — chain .mode('wcag')
const wcag = lint('#777', '#ffffff').mode('wcag');
wcag.score        // 4.48 (contrast ratio)
wcag.levels       // [{ name: 'AAA Normal text', threshold: 7, pass: false }, ...]

// Export
result.output('json')  // JSON with full result
result.output('text')  // readable text report
result.output('css')   // CSS custom properties
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
  RampaFn,             // callable palette returned by rampa()
  Color,               // { hex, rgb, hsl, oklch, luminance, format(), output(), lighten(), ... }
  ColorInfo,           // { hex, rgb, hsl, oklch }
  OklchSetValues,      // { lightness?, chroma?, hue? } for color.set()
  InterpolationMode,   // 'oklch' | 'lab' | 'rgb'
  LinearColorSpaceFn,  // callable function returned by LinearColorSpace.size()
  CubeColorSpaceFn,    // callable function returned by CubeColorSpace.size()
  LintResult,          // lint builder with score, pass, levels, warnings, output()
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
  .saturationDistribution('ease-out');

const neutral = rampa('#64748b')
  .size(10)
  .saturation(20, 0);

const danger = rampa('#ef4444')
  .size(10)
  .lightness(10, 90);

// Access individual colors
primary(5)         // mid-tone blue
neutral(1)         // darkest gray
danger(8).hsl()    // light red in HSL
```

### Full Palette with Harmonies

```typescript
const palette = rampa('#3b82f6')
  .size(10)
  .lightness(5, 95)
  .lightnessDistribution('ease-in-out')
  .add('complementary')
  .add('analogous');

palette(1)          // first base color
palette.ramps[1]    // complementary ramp
palette.ramps[2]    // analogous ramp
```

### CSS Variables for a Theme

```typescript
const theme = rampa('#3b82f6')
  .size(10)
  .add('complementary')
  .tint('#FFD700', 5, 'overlay')
  .output('css');

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
  .format('hsl');

// Write to a tokens file
writeFileSync('tokens.json', JSON.stringify({ colors: colors.palette }, null, 2));
```

## CLI Parity

The SDK produces identical output to the CLI. These are equivalent:

```bash
# CLI
rampa --color "#3b82f6" --size=5 --lightness 10:90 --add=complementary --output json
```

```typescript
// SDK
rampa('#3b82f6').size(5).lightness(10, 90).add('complementary').output('json');
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

#### Ramp introspection

Access individual steps as full `Color` objects with `.at()`, or get all steps with `.colors()`:

```typescript
const ramp = new LinearColorSpace('#000', '#fff').size(12);

ramp.at(3)                       // → Color (0-based index)
ramp.at(3).oklch.c               // → chroma at step 3
ramp.at(3).lighten(0.1).hex      // → transform a ramp step

ramp.colors()                    // → Color[]
ramp.colors().map(c => c.oklch.c)  // → chroma curve across ramp
```

**`.at()` is 0-based** (like `Array.at()`), while the callable `ramp(n)` remains 1-based for backward compatibility.

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

// Ramp introspection
red.at(3, 5)              // → Color at (saturation=3, lightness=5)
red.at(3, 5).oklch.c      // → chroma at that coordinate
red.colors()              // → Color[] (flat, row-major)

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

// Ramp introspection
cube.at(2, 3, 1)         // → Color at (x=2, y=3, z=1)
cube.colors()            // → Color[]
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

### Distribution curves

All color space classes support `.distribution(scale)` to apply non-linear step spacing. When not set, steps are evenly spaced (zero overhead on the default path).

Available scales: `ease-in`, `ease-out`, `ease-in-out`, `fibonacci`, `golden-ratio`, `geometric`, `logarithmic`, `powers-of-2`, `musical-ratio`, `cielab-uniform`

```typescript
// Ease-in: bunch colors toward the start, spread out toward the end
const ramp = new LinearColorSpace('#ffffff', '#000000')
  .distribution('ease-in')
  .size(10);

// Fibonacci spacing on a 2D plane
const red = new PlaneColorSpace('#1e1e2e', '#cdd6f4', '#f38ba8')
  .distribution('fibonacci')
  .size(8);

// Golden ratio on a cube
const space = new CubeColorSpace({ ... })
  .distribution('golden-ratio')
  .size(6);
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

## Image Palette Extraction

Extract color palettes from images with three tiers of analysis: raw unique colors, dominant color clusters, and ANSI-classified palettes.

Requires `fast-png` and `jpeg-js` (installed as dependencies). Supports PNG and JPEG files.

### `palette(filePath)`

```typescript
import { palette } from '@basiclines/rampa-sdk';

const p = await palette('photo.jpg');
```

### Dominant Colors

Top N color groups via k-means clustering in OKLCH space:

```typescript
p.dominant()                     // → PaletteEntry[] (top 10)
p.dominant({ count: 5 })        // top 5
p.dominant({ tolerance: 10 })   // wider clustering (default: 4)

// Shortcut with .at() (0-based, like ramp.at())
p.at(0)                          // most dominant color
p.at(0).color.hex               // → '#2d2a18'
p.at(0).frequency               // → 0.278 (27.8% of pixels)
p.at(0).color.lighten(0.1).hex  // chain transforms
```

### Raw Palette

All unique colors with near-duplicates merged:

```typescript
p.raw()                          // → PaletteEntry[]
p.raw({ tolerance: 3 })         // deltaE merge threshold (default: 2)
p.raw({ maxColors: 500 })       // cap output (default: 1000)
```

### ANSI Palette

Colors classified into terminal color categories:

```typescript
p.ansi()
// → { red: PaletteEntry[], green: [...], blue: [...], ... }

p.ansi({ count: 3 })            // max 3 per category (default: 5)
```

Categories: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`

### Extras

```typescript
p.average()                      // → Color (weighted OKLCH average)
p.temperature()                  // → 'warm' | 'cool' | 'neutral'
```

### Output

```typescript
p.output('json')                 // full analysis as JSON
p.output('css', 'photo')        // CSS custom properties
p.output('text')                 // readable text
```

### PaletteEntry Shape

```typescript
interface PaletteEntry {
  color: Color;       // full Color with transforms
  frequency: number;  // 0-1, percentage of sampled pixels
}
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
