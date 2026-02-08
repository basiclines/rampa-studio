# Rampa CLI

Generate mathematically accurate, accessible color palettes from a base color.

## Installation

### npm

```bash
npx @basiclines/rampa -C "#3b82f6"
```

Or install globally:

```bash
npm install -g @basiclines/rampa
rampa -C "#3b82f6"
```

### Homebrew (macOS/Linux)

```bash
brew tap basiclines/tap
brew install rampa
```

### Download Binary

Download the latest binary for your platform from the [releases page](https://github.com/basiclines/rampa-studio/releases).

| Platform | Architecture | File |
|----------|--------------|------|
| macOS | Apple Silicon | `rampa-darwin-arm64` |
| macOS | Intel | `rampa-darwin-x64` |
| Linux | x64 | `rampa-linux-x64` |
| Linux | ARM64 | `rampa-linux-arm64` |
| Windows | x64 | `rampa-windows-x64.exe` |

### From Source

```bash
cd cli
bun install
bun run build
# Binary: ./dist/rampa
```

## Quick Start

```bash
# Generate a 10-color palette from blue
rampa --color="#3b82f6"

# Custom size with lightness range
rampa -C "#3b82f6" --size=5 -L 10:90

# Add complementary harmony
rampa -C "#3b82f6" --add=complementary

# Add hue-shifted ramp (45 degrees)
rampa -C "#3b82f6" --add=shift:45

# Output as CSS variables
rampa -C "#3b82f6" --output=css
```

## Usage

```
rampa --color <color> [options]
```

## Flags

### Required

| Flag | Alias | Description |
|------|-------|-------------|
| `--color` | `-C` | Base color (hex, hsl, rgb, oklch) |

### Color Format

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--format` | `-F` | Output format: hex, hsl, rgb, oklch | Same as input |

### Palette Size

| Flag | Description | Default |
|------|-------------|---------|
| `--size` | Number of colors (2-100) | 10 |

### Color Ranges

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--lightness` | `-L` | Lightness range start:end (0-100) | 0:100 |
| `--saturation` | `-S` | Saturation range start:end (0-100) | 100:0 |
| `--hue` | `-H` | Hue shift range start:end (degrees) | -10:10 |

### Scale Types

| Flag | Description | Default |
|------|-------------|---------|
| `--lightness-scale` | Lightness distribution curve | linear |
| `--saturation-scale` | Saturation distribution curve | linear |
| `--hue-scale` | Hue distribution curve | linear |

Available scales: `linear`, `geometric`, `fibonacci`, `golden-ratio`, `logarithmic`, `powers-of-2`, `musical-ratio`, `cielab-uniform`, `ease-in`, `ease-out`, `ease-in-out`

### Tinting

| Flag | Description | Default |
|------|-------------|---------|
| `--tint-color` | Tint color to blend over palette | - |
| `--tint-opacity` | Tint strength 0-100 | 0 |
| `--tint-blend` | Blend mode for tinting | normal |

Available blend modes: `normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`

### Harmony Ramps

| Flag | Description |
|------|-------------|
| `--add` | Add harmony ramp (repeatable) |

Available types:
- `complementary` — Opposite on color wheel (+180°)
- `triadic` — 3 colors, 120° apart
- `analogous` — Adjacent colors, 30° apart
- `split-complementary` — 2 colors near opposite
- `square` — 4 colors, 90° apart
- `compound` — Complementary + split
- `shift:N` — Custom hue rotation by N degrees (e.g., `shift:45`, `shift:-30`)

### Output

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--output` | `-O` | Output format: text, json, css | text |
| `--preview` | | Show colored squares | true |

### Accessibility

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--accessibility` | `-A` | APCA contrast report | off |

The `-A` flag generates an accessibility report using the [APCA](https://github.com/Myndex/APCA) (Accessible Perceptual Contrast Algorithm) methodology. It analyzes all color pairs across all generated ramps and groups passing pairs by contrast level.

**Filter options:**

| Syntax | Example | Description |
|--------|---------|-------------|
| `-A` | `-A` | Show all passing pairs |
| `-A=<Lc>` | `-A=60` | Minimum Lc threshold |
| `-A=<label>` | `-A=body` | Filter by named level |
| `-A=<min>:<max>` | `-A=15:30` | Lc range filter |
| `-A=<label>:<label>` | `-A=nontext:bold` | Range using level names |

**Level labels:**

| Label | Lc Threshold | Use Case |
|-------|-------------|----------|
| `preferred` | 90 | Preferred body text |
| `body` | 75 | Body text |
| `large` | 60 | Large text |
| `bold` | 45 | Large/bold text |
| `minimum` | 30 | Minimum text |
| `nontext` | 15 | Non-text elements |

### Other

| Flag | Alias | Description |
|------|-------|-------------|
| `--help` | `-h` | Show help |
| `--version` | `-v` | Show version |

## Examples

### Basic Palette

```bash
rampa -C "#3b82f6"
```

### Custom Lightness Range

```bash
rampa -C "#3b82f6" -L 10:90 --lightness-scale=fibonacci
```

### With Tinting

```bash
rampa -C "#3b82f6" --tint-color="#FF0000" --tint-opacity=15 --tint-blend=overlay
```

### Multiple Harmonies

```bash
rampa -C "#3b82f6" --add=complementary --add=triadic
```

### Custom Hue Shifts

```bash
# Warm shift (+45°)
rampa -C "#3b82f6" --add=shift:45

# Cool shift (-30°)  
rampa -C "#3b82f6" --add=shift:-30

# Multiple shifts
rampa -C "#3b82f6" --add=shift:30 --add=shift:60 --add=shift:90
```

### JSON Output

```bash
rampa -C "#3b82f6" --size=5 --output=json
```

Output:
```json
{
  "ramps": [
    {
      "name": "base",
      "baseColor": "#3b82f6",
      "config": { ... },
      "colors": ["#000000", "#103c70", "#4070bf", "#afb9cf", "#ffffff"]
    }
  ]
}
```

### CSS Custom Properties

```bash
rampa -C "#3b82f6" --size=5 --output=css
```

Output:
```css
:root {
  /* base */
  --base-0: #000000;
  --base-25: #103c70;
  --base-50: #4070bf;
  --base-75: #afb9cf;
  --base-100: #ffffff;
}
```

### CSS with Harmonies

```bash
rampa -C "#3b82f6" -O css --add=complementary
```

Output:
```css
:root {
  /* base */
  --base-0: #000000;
  --base-50: #4070bf;
  --base-100: #ffffff;

  /* complementary */
  --complementary-0: #000000;
  --complementary-50: #bf8f40;
  --complementary-100: #ffffff;
}
```

### Piping (no preview)

```bash
rampa -C "#3b82f6" --no-preview | head -5
```

### Accessibility Report

```bash
# Full APCA contrast report
rampa -C "#3b82f6" --add=complementary -A

# Filter by minimum Lc threshold
rampa -C "#3b82f6" --add=complementary -A=body

# Filter by Lc range
rampa -C "#3b82f6" --add=complementary -A=15:30

# Filter using level labels
rampa -C "#3b82f6" --add=complementary -A=nontext:bold

# Accessibility report in JSON
rampa -C "#3b82f6" --add=complementary -A -O json

# Accessibility report in CSS (appended as comment)
rampa -C "#3b82f6" --add=complementary -A -O css
```

## Contextual Help

Run any flag without a value to see detailed help:

```bash
rampa --lightness-scale
rampa --add
rampa --output
```

## Development

```bash
cd cli
bun install

# Run in development
bun run dev -- -C "#3b82f6"

# Run tests
bun test

# Build for current platform
bun run build

# Build for all platforms
bun run build:all
```

## AI Evals

Compare how different LLM models use the Rampa CLI by sending the same prompt to multiple models in agent mode. Models can discover rampa via `--help`, execute commands, and iterate. Use `--raw` to run without rampa for baseline comparison. See [evals/README.md](evals/README.md) for details.

```bash
bun run eval                                          # all prompts, all models
bun run eval --prompt ghostty-matrix-theme --no-judge  # single prompt
bun run eval --prompt ghostty-matrix-theme --raw       # without rampa (baseline)
```

## Build Targets

```bash
bun run build              # Current platform
bun run build:darwin-arm64 # macOS Apple Silicon
bun run build:darwin-x64   # macOS Intel
bun run build:linux-x64    # Linux x64
bun run build:linux-arm64  # Linux ARM64
bun run build:windows-x64  # Windows x64
bun run build:all          # All platforms
```
