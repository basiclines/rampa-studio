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

### Distribution Types

| Flag | Description | Default |
|------|-------------|---------|
| `--lightness-distribution` | Lightness distribution curve | linear |
| `--saturation-distribution` | Saturation distribution curve | linear |
| `--hue-distribution` | Hue distribution curve | linear |

Available distributions: `linear`, `geometric`, `fibonacci`, `golden-ratio`, `logarithmic`, `powers-of-2`, `musical-ratio`, `cielab-uniform`, `ease-in`, `ease-out`, `ease-in-out`

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

### Color Spaces

| Flag | Description |
|------|-------------|
| `colorspace` | Subcommand for querying color spaces |

The `colorspace` subcommand lets you define and query multi-dimensional color spaces directly from the CLI.

#### Inline Mode

```bash
# Linear: 2-color interpolated ramp
rampa colorspace --linear '#ffffff' '#000000' --size 24 --at 12

# Plane: 2D saturation×lightness for a single hue
rampa colorspace --plane '#1e1e2e' '#cdd6f4' '#f38ba8' --size 6 --xy 3,5

# Cube: 8-corner color cube with named aliases
rampa colorspace --cube k=#1e1e2e r=#f38ba8 g=#a6e3a1 b=#89b4fa \
                        y=#f9e2af m=#cba6f7 c=#94e2d5 w=#cdd6f4 \
                 --size 6 --tint r:4,b:2

# Lookup table (no interpolation)
rampa colorspace --linear '#f00' '#0f0' '#00f' --interpolation false --at 2
```

#### Config File Mode

```bash
# Define once in a JSON file, query repeatedly
rampa colorspace --config catppuccin.json --tint r:4,b:2
rampa colorspace --config catppuccin.json --tint w:3 --format hsl
```

Config file format:
```json
{
  "type": "cube",
  "corners": { "k": "#1e1e2e", "r": "#f38ba8", "g": "#a6e3a1", "b": "#89b4fa",
               "y": "#f9e2af", "m": "#cba6f7", "c": "#94e2d5", "w": "#cdd6f4" },
  "size": 6,
  "interpolation": "oklch"
}
```

Plane config:
```json
{
  "type": "plane",
  "dark": "#1e1e2e",
  "light": "#cdd6f4",
  "hue": "#f38ba8",
  "size": 6,
  "interpolation": "oklch"
}
```

#### Colorspace Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--linear` | Define a linear color space (2+ colors) | - |
| `--plane` | Define a plane color space (dark light hue) | - |
| `--cube` | Define a cube color space (8 key=color pairs) | - |
| `--config` | Load color space from a JSON config file | - |
| `--size` | Resolution per axis | 6 |
| `--at` | Query a specific 1-based index (linear) | - |
| `--xy` | Query plane with saturation,lightness (e.g., `3,5`) | - |
| `--tint` | Query cube with alias:intensity pairs (e.g., `r:4,b:2`) | - |
| `--interpolation` | Interpolation mode: oklch, lab, rgb, false | oklch |
| `--format` | Output format: hex, hsl, rgb, oklch | hex |
| `--output` | Output mode: text, json | text |

### Contrast Lint

Check contrast compliance between two colors using APCA (default) or WCAG 2.x.

```bash
rampa lint --foreground '#ffffff' --background '#1e1e2e'
rampa lint --fg '#777' --bg '#fff' --mode wcag
rampa lint --fg '#fff' --bg '#000' --output json
```

| Flag | Alias | Description |
|------|-------|-------------|
| `--foreground <color>` | `--fg` | Foreground (text) color |
| `--background <color>` | `--bg` | Background color |
| `--mode <apca\|wcag>` | | Contrast algorithm (default: apca) |
| `--output <text\|json\|css>` | `-O` | Output format (default: text) |

**Lint rules (hardcoded):**
- **contrast-check** — Pass/fail per APCA level (Lc 15–90) or WCAG level (AA/AAA)
- **near-identical** — Warns if deltaE < 3 between foreground and background
- **low-contrast** — Warns if contrast is below minimum usable threshold
- **pure-bw** — Warns if using pure `#000000` or `#ffffff`

### Color

Inspect, transform, mix, and export a single color. All transforms operate in OKLCH space.

```bash
rampa color '#ff6600'
rampa color 'rgb(100, 200, 50)' --output json
rampa color '#1e1e2e' -O css --prefix brand
```

| Flag | Alias | Description |
|------|-------|-------------|
| `<color>` | `-c` | Color to inspect/transform (positional or flag) |
| `--output <text\|json\|css>` | `-O` | Output format (default: text) |
| `--prefix <name>` | | Prefix for CSS variable names (default: color) |
| `--lighten <n>` | | Increase OKLCH lightness by n (0-1 scale) |
| `--darken <n>` | | Decrease OKLCH lightness by n |
| `--saturate <n>` | | Increase OKLCH chroma by n |
| `--desaturate <n>` | | Decrease OKLCH chroma by n |
| `--rotate <n>` | | Rotate hue by n degrees |
| `--set-lightness <n>` | | Set OKLCH lightness to n |
| `--set-chroma <n>` | | Set OKLCH chroma to n |
| `--set-hue <n>` | | Set hue to n degrees |
| `--mix <color>` | | Mix with target color (use --ratio, --space) |
| `--blend <color>` | | Blend with target color (use --ratio, --mode) |
| `--ratio <n>` | | Mix/blend ratio 0-1 (default: 0.5) |
| `--space <oklch\|lab\|srgb>` | | Color space for --mix (default: oklch) |
| `--mode <name>` | | Blend mode for --blend (multiply, screen, overlay, etc.) |

Transforms are applied left-to-right, matching SDK chaining order:

```bash
rampa color '#66b172' --lighten 0.1 --desaturate 0.05
rampa color '#ff0000' --mix '#0000ff' --ratio 0.5 --space lab
rampa color '#ff8800' --blend '#0088ff' --ratio 0.5 --mode multiply
rampa color '#66b172' --lighten 0.1 --desaturate 0.05 -O css --prefix brand
```

### Other

| Flag | Alias | Description |
|------|-------|-------------|
| `--help` | `-h` | Show help |
| `--version` | `-v` | Show version |

### Image Palette

Extract color palettes from PNG and JPEG images.

```bash
rampa palette photo.jpg
rampa palette photo.jpg --count 5
rampa palette photo.jpg --ansi --count 3
rampa palette photo.jpg --group C --sort L
rampa palette photo.jpg --output json
```

| Flag | Alias | Description |
|------|-------|-------------|
| `<file>` | | Image file path (PNG or JPEG) |
| `--count <n>` | | Number of dominant colors (default: 10) |
| `--tolerance <n>` | | DeltaE clustering radius (default: 4) |
| `--raw` | | Show all unique colors |
| `--raw-tolerance <n>` | | DeltaE threshold for raw dedup (default: 2) |
| `--max-colors <n>` | | Max colors for raw output (default: 1000) |
| `--ansi` | | Classify into ANSI color categories |
| `--group <L\|C\|H>` | | Group by lightness, chroma, or hue |
| `--l-buckets <n>` | | Number of lightness buckets (default: 5) |
| `--c-buckets <n>` | | Number of chroma buckets (default: 4) |
| `--h-buckets <n>` | | Number of hue buckets (default: 8) |
| `--sort <frequency\|L\|C\|H>` | | Sort order (default: frequency) |
| `--average` | | Show average color only |
| `--temperature` | | Show color temperature only |
| `--sample-size <n>` | | Pixels to sample (default: 50000) |
| `--output <text\|json\|css>` | `-O` | Output format (default: text) |
| `--prefix <name>` | | CSS variable prefix (default: palette) |

## Examples

### Basic Palette

```bash
rampa -C "#3b82f6"
```

### Custom Lightness Range

```bash
rampa -C "#3b82f6" -L 10:90 --lightness-distribution=fibonacci
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

### Color Spaces

```bash
# Interpolated grayscale ramp, query the midpoint
rampa colorspace --linear '#ffffff' '#000000' --size 24 --at 12

# 8-corner color cube, query a tint
rampa colorspace --cube k=#1e1e2e r=#f38ba8 g=#a6e3a1 b=#89b4fa \
                        y=#f9e2af m=#cba6f7 c=#94e2d5 w=#cdd6f4 \
                 --size 6 --tint r:4,b:2

# Full palette as JSON
rampa colorspace --cube k=#000 r=#f00 g=#0f0 b=#00f \
                        y=#ff0 m=#f0f c=#0ff w=#fff \
                 --size 6 --output json

# Config file for repeated queries
rampa colorspace --config theme.json --tint r:4,b:2 --format hsl
```

### Contrast Lint

```bash
# Default APCA contrast check
rampa lint --fg '#ffffff' --bg '#1e1e2e'

# WCAG mode
rampa lint --fg '#777' --bg '#ffffff' --mode wcag

# JSON output for CI/automation
rampa lint --fg '#fff' --bg '#000' --output json

# CSS output
rampa lint --fg '#fff' --bg '#000' -O css
```

### Color Inspect

```bash
# View all formats
rampa color '#ff6600'

# JSON output
rampa color 'rgb(100, 200, 50)' --output json

# CSS custom properties
rampa color '#1e1e2e' -O css

# Transform: lighten and desaturate
rampa color '#66b172' --lighten 0.1 --desaturate 0.05

# Derive bright variant
rampa color '#06ef48' --lighten 0.1 --desaturate 0.05

# Mix two colors in lab space
rampa color '#ff0000' --mix '#0000ff' --ratio 0.5 --space lab

# Blend with multiply mode
rampa color '#ff8800' --blend '#0088ff' --ratio 0.5 --mode multiply

# Set absolute OKLCH values
rampa color '#f85149' --set-lightness 0.48 --set-chroma 0.15
```

### Image Palette

```bash
# Dominant colors from a photo
rampa palette photo.jpg

# Top 5 with ANSI swatches
rampa palette photo.jpg --count 5

# ANSI-classified palette
rampa palette photo.jpg --ansi --count 3

# Group by chroma, sorted by lightness (accent discovery)
rampa palette photo.jpg --group C --sort L

# Group by lightness with 3 buckets
rampa palette photo.jpg --group L --l-buckets 3

# Group by hue, sorted dark→light
rampa palette photo.jpg --group H --sort L

# Raw unique colors
rampa palette photo.jpg --raw --tolerance 5

# JSON output for tooling
rampa palette photo.jpg --output json

# CSS variables
rampa palette photo.jpg --output css --prefix photo

# Average color and temperature
rampa palette photo.jpg --average
rampa palette photo.jpg --temperature
```

## Contextual Help

Run any flag without a value to see detailed help:

```bash
rampa --lightness-distribution
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
