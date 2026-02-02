# Rampa

Generate mathematically accurate, accessible color palettes from a base color using the OKLCH color space.

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
- ♿ **Accessibility-ready** — Generate palettes optimized for contrast
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
```

### Full CLI Documentation

See [cli/README.md](./cli/README.md) for complete flag reference and examples.

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
└── tests/                # Test suites
```

---

## 🧪 Testing

```bash
# Run CLI tests
cd cli && bun test
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
