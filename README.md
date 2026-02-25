# Rampa

Generate mathematically accurate, accessible color palettes from a base color using the OKLCH color space. Available as a [CLI](#%EF%B8%8F-cli), [JavaScript SDK](#-javascript-sdk), and [web app](https://rampa.studio).

<p align="center">
  <img src="https://img.shields.io/badge/license-Dual%20License-blue.svg" alt="License">
  <img src="https://img.shields.io/github/v/release/basiclines/rampa-studio?label=version&color=green" alt="Version">
</p>

## What is Rampa?

Rampa is a color palette generator that creates perceptually uniform color ramps. Unlike traditional tools that produce muddy or inconsistent gradients, Rampa uses the OKLCH color space to ensure smooth, predictable transitions across lightness, saturation, and hue.

### A Different Approach to Color Palettes

**Traditional palette tools** generate decent defaults, then force you to manually tweak individual color values one by one. You end up adjusting hex codes, eyeballing differences, and hoping the result feels cohesive.

**Rampa focuses on palette-level control with mathematical precision.** Instead of tweaking individual swatches, you configure the entire ramp's behavior:

- **Lightness range** (e.g., 15% → 95%) — How dark to how light
- **Saturation range** (e.g., 80% → 20%) — How vibrant to how muted  
- **Hue shift range** (e.g., -10° → +10°) — Subtle hue rotation across the ramp
- **Distribution scale** — How values are spread (Fibonacci, Golden Ratio, ease curves, etc.)

The result: **predictable, mathematically consistent palettes** that you control at the system level, not the pixel level. Change one parameter and the entire palette updates coherently.

**Key Features:**
- 🎛️ **Range-based configuration** — Define start AND end values for L/S/H
- 🎨 **Perceptually uniform** — Colors look evenly spaced to the human eye
- 🔢 **11 distribution scales** — Linear, Fibonacci, Golden Ratio, ease curves, and more
- 🎯 **Color harmonies** — Complementary, triadic, analogous, and other harmony ramps
- 🖌️ **Tinting system** — Apply color overlays with 16 blend modes
- ♿ **Accessibility-ready** — APCA contrast analysis across all color pairs
- 📦 **Multiple outputs** — Export as CSS variables, JSON, or plain text

---

## ⌨️ CLI

A command-line tool for generating palettes in scripts, CI/CD pipelines, or terminal workflows.

### Installation

#### npm / bun

```bash
# Run directly with npx
npx @basiclines/rampa -C "#3b82f6"

# Or install globally
npm install -g @basiclines/rampa
bun add -g @basiclines/rampa
```

#### Homebrew (macOS/Linux)

```bash
brew tap basiclines/tap
brew install rampa
```

#### Download Binary

Download from [GitHub Releases](https://github.com/basiclines/rampa-studio/releases):

| Platform | Architecture | File |
|----------|--------------|------|
| macOS | Apple Silicon | `rampa-darwin-arm64` |
| macOS | Intel | `rampa-darwin-x64` |
| Linux | x64 | `rampa-linux-x64` |
| Linux | ARM64 | `rampa-linux-arm64` |
| Windows | x64 | `rampa-windows-x64.exe` |

### Quick Start

```bash
# Generate a 10-color palette from blue
rampa -C "#3b82f6"

# Custom lightness range with Fibonacci scale
rampa -C "#3b82f6" -L 10:90 --lightness-scale=fibonacci

# Add complementary harmony ramp
rampa -C "#3b82f6" --add=complementary

# Add custom hue shift ramp (45 degrees)
rampa -C "#3b82f6" --add=shift:45

# Output as CSS variables
rampa -C "#3b82f6" -O css --name=primary

# Apply a warm tint
rampa -C "#3b82f6" --tint-color="#FF6B00" --tint-opacity=15 --tint-blend=overlay

# APCA accessibility contrast report
rampa -C "#3b82f6" --add=complementary -A

# Filter by contrast level or range
rampa -C "#3b82f6" --add=complementary -A=body
rampa -C "#3b82f6" --add=complementary -A=15:30

# Color spaces: interpolated ramp or 8-corner cube
rampa colorspace --linear '#fff' '#000' --size 24 --at 12
rampa colorspace --cube k=#1e1e2e r=#f38ba8 g=#a6e3a1 b=#89b4fa \
                        y=#f9e2af m=#cba6f7 c=#94e2d5 w=#cdd6f4 \
                 --size 6 --tint r:4,b:2

# Contrast lint: check accessibility compliance
rampa lint --fg '#ffffff' --bg '#1e1e2e'
rampa lint --fg '#777' --bg '#fff' --mode wcag --output json

# Color inspect: view a color in all formats
rampa inspect -c '#ff6600'
rampa inspect -c '#ff6600' --output css
```

### Full CLI Documentation

See [cli/README.md](./cli/README.md) for complete flag reference and examples.

---

## 📦 JavaScript SDK

A programmatic API for generating palettes in applications, build tools, and design systems. Same engine as the CLI, fluent chainable interface.

### Installation

```bash
npm install @basiclines/rampa-sdk
```

### Quick Start

```typescript
import { rampa } from '@basiclines/rampa-sdk';

// Generate a 10-color palette from blue
const result = rampa('#3b82f6').generate();

// Custom lightness range with Fibonacci scale
rampa('#3b82f6').lightness(10, 90).lightnessScale('fibonacci').generate();

// Add complementary harmony ramp
rampa('#3b82f6').add('complementary').generate();

// Add custom hue shift ramp (45 degrees)
rampa('#3b82f6').add('shift', 45).generate();

// Output as CSS variables
rampa('#3b82f6').toCSS();

// Apply a warm tint
rampa('#3b82f6').tint('#FF6B00', 15, 'overlay').generate();

// Color conversion (read-only)
rampa.readOnly('#fe0000').generate();                  // All formats
rampa.readOnly('#fe0000').format('hsl').generate();    // 'hsl(0, 100%, 50%)'
rampa.convert('#fe0000', 'oklch');                     // 'oklch(62.8% 0.257 29)'

// OKLCH color mixing
rampa.mix('#ff0000', '#0000ff', 0.5);                  // Perceptually uniform midpoint

// Color spaces: interpolated ramps, planes, and cubes
import { LinearColorSpace, PlaneColorSpace, CubeColorSpace, color } from '@basiclines/rampa-sdk';

const neutral = new LinearColorSpace('#ffffff', '#000000').size(24);
neutral(12)                       // Midpoint gray (returns hex string directly)

const red = new PlaneColorSpace('#1e1e2e', '#cdd6f4', '#f38ba8').size(6);
red(3, 5)                         // 2D lookup: saturation=3, lightness=5

const tint = new CubeColorSpace({ k: '#1e1e2e', r: '#f38ba8', g: '#a6e3a1', b: '#89b4fa',
                                   y: '#f9e2af', m: '#cba6f7', c: '#94e2d5', w: '#cdd6f4' }).size(6);
tint({ r: 4, b: 2 })             // Query by alias intensity
tint({ r: 4 }).hsl()             // Convert to hsl

// Color inspection
color('#3b82f6').rgb;              // { r: 59, g: 130, b: 246 }
color('#3b82f6').luminance;        // 0.546 (OKLCH perceptual lightness)

// Contrast lint
rampa.contrast('#fff', '#1e1e2e');           // APCA (default)
rampa.contrast('#777', '#fff', 'wcag');      // WCAG 2.x
// → { mode, score, pass, levels: [{ name, threshold, pass }], warnings }
```

### CLI ↔ SDK Equivalence

Every CLI flag maps to an SDK method:

| CLI | SDK |
|-----|-----|
| `-C "#3b82f6"` | `rampa('#3b82f6')` |
| `--size=5` | `.size(5)` |
| `-L 10:90` | `.lightness(10, 90)` |
| `-S 80:20` | `.saturation(80, 20)` |
| `-H -30:30` | `.hue(-30, 30)` |
| `--lightness-scale=fibonacci` | `.lightnessScale('fibonacci')` |
| `--add=complementary` | `.add('complementary')` |
| `--add=shift:45` | `.add('shift', 45)` |
| `--tint-color="#FF0000" --tint-opacity=20 --tint-blend=multiply` | `.tint('#FF0000', 20, 'multiply')` |
| `-F oklch` | `.format('oklch')` |
| `-O css` | `.toCSS()` |
| `-O json` | `.toJSON()` |
| `--read-only` | `rampa.readOnly('#fe0000').generate()` |
| `--read-only -F hsl` | `rampa.readOnly('#fe0000').format('hsl').generate()` |
| `--mix "#0000ff" --steps=5` | `rampa.mix('#ff0000', '#0000ff', t)` |
| `colorspace --linear '#fff' '#000' --size 24 --at 12` | `new LinearColorSpace('#fff', '#000').size(24)(12).hex` |
| `colorspace --cube k=#000 ... --tint r:4` | `new CubeColorSpace({...}).size(6)({ r: 4 }).hex` |
| `lint --fg '#fff' --bg '#000'` | `rampa.contrast('#fff', '#000')` |
| `lint --fg '#fff' --bg '#000' --mode wcag` | `rampa.contrast('#fff', '#000', 'wcag')` |
| `inspect -c '#ff6600'` | `rampa.readOnly('#ff6600').generate()` |

### Full SDK Documentation

See [sdk/README.md](./sdk/README.md) for complete API reference and examples.

---

## 🤖 Agent Skills

Rampa includes skills for AI coding assistants. Skills teach agents how to generate color palettes for common design tasks.

### Installation

```bash
npx skills add basiclines/rampa-studio
```

### Available Skills

| Skill | Description |
|-------|-------------|
| `rampa-colors` | Basic palette generation from any color |
| `theme-foundation` | Complete light/dark theme with accent + neutrals |
| `tinted-neutrals` | Brand-tinted gray palettes |
| `status-from-accent` | Success/warning/danger colors via square harmony |
| `data-viz-palette` | Distinct colors for charts and graphs |
| `brand-expansion` | Expand one color into full multi-hue system |
| `accessible-contrast` | WCAG-compliant foreground/background pairs |

### Example Prompts

- "Create a theme from my brand color #3b82f6"
- "Generate status colors that match my accent"
- "I need 4 distinct colors for a chart"
- "Make accessible text/background combinations"

---

## 🎨 Color Engine

Both the web app and CLI share the same color engine (`src/engine/`), ensuring consistent results across platforms.

### Scale Types

Control how values are distributed across the palette:

| Scale | Description |
|-------|-------------|
| `linear` | Even spacing (default) |
| `geometric` | Exponential growth |
| `fibonacci` | Fibonacci sequence |
| `golden-ratio` | Golden ratio progression |
| `logarithmic` | Logarithmic curve |
| `powers-of-2` | Powers of 2 |
| `musical-ratio` | Musical intervals |
| `cielab-uniform` | Perceptually uniform in CIELAB |
| `ease-in` | Slow start, fast end |
| `ease-out` | Fast start, slow end |
| `ease-in-out` | Slow start and end |

### Harmony Types

Generate related color ramps:

| Harmony | Description | Additional Ramps |
|---------|-------------|------------------|
| `complementary` | Opposite on color wheel | +1 |
| `triadic` | 3 colors, 120° apart | +2 |
| `analogous` | Adjacent colors, 30° apart | +2 |
| `split-complementary` | 2 colors near opposite | +2 |
| `square` | 4 colors, 90° apart | +3 |
| `compound` | Complementary + split | +3 |
| `shift:N` | Custom hue rotation by N degrees | +1 |

### Blend Modes

For tinting palettes:

`normal` · `multiply` · `screen` · `overlay` · `darken` · `lighten` · `color-dodge` · `color-burn` · `hard-light` · `soft-light` · `difference` · `exclusion` · `hue` · `saturation` · `color` · `luminosity`

---

## 🖥️ Web App

A visual interface to design and preview color palettes in real-time.

**Live:** [rampa.studio](https://rampa.studio)

### Features
- Interactive palette editor with live preview
- CSS variables editor with autocomplete
- Export to CSS, JSON, or copy colors directly
- Visual harmony ramp generator

### Local Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build
```

---

## 📁 Project Structure

```
rampa-studio/
├── src/                  # Web app source
│   ├── engine/           # Shared color engine
│   ├── components/       # React components
│   └── ...
├── cli/                  # CLI tool
│   ├── src/              # CLI source
│   ├── dist/             # Compiled binaries
│   └── README.md         # CLI documentation
├── sdk/                  # JavaScript SDK
│   ├── src/              # SDK source
│   ├── tests/            # Unit & integration tests
│   └── README.md         # SDK documentation
└── tests/                # Web app test suites
```

---

## 🧪 Testing

```bash
# Run CLI tests
cd cli && bun test

# Run SDK tests
cd sdk && bun test
```

---

## 🙏 Inspiration

Rampa was inspired by these excellent color tools:

- [ColorColor](https://colorcolor.in/) — Perceptually uniform palette generator
- [Primer Prism](https://primer.style/prism/) — GitHub's color scale tool
- [ColorSpace](https://www.colorspace.dev/) — Advanced color manipulation

---

## 📄 License

**Free for individuals and developers.** Commercial integration requires a license.

See [LICENSE.md](./LICENSE.md) for details.

© [ismael.fyi](https://ismael.fyi)
