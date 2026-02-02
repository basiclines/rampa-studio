# Rampa CLI

Generate mathematically accurate, accessible color palettes from a base color.

## Installation

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

Available harmonies: `complementary`, `triadic`, `analogous`, `split-complementary`, `square`, `compound`

### Output

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--output` | `-O` | Output format: text, json, css | text |
| `--preview` | | Show colored squares | true |

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
