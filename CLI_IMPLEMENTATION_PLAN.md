# Rampa CLI Implementation Plan

> **📋 This plan is split into incremental iterations.**  
> See [docs/cli-plan/](./docs/cli-plan/README.md) for the step-by-step implementation guide.

## Problem Statement
Create a CLI version of the Rampa Studio color palette generator that produces mathematically accurate, accessible color palettes from a base color. The CLI will reuse the existing engine code and support all UI-configurable properties as command-line flags.

**Example usage:**
```bash
rampa --base="#FE0000" --hue=10:30 --saturation=24:55 --lightness=65:90 --size=10 --output=text
```

---

## Proposed Approach

### CLI Framework: **Citty**
**Reasoning:**
- Built specifically to work well with Bun, Deno, and Node
- Strong TypeScript type-safety (critical for our typed engine)
- Zero dependencies (ideal for Bun where startup speed matters)
- Modern ES module design fits Bun's philosophy
- Minimal footprint while covering all our CLI parsing needs

**Alternatives considered:**
- Commander.js/Yargs: Great community, but TypeScript support is moderate
- Cliffy: Feature-rich but more Deno-centric
- Boune/Bunli: Bun-native but smaller ecosystems

### Project Structure
```
rampa-studio/
├── cli/                          # NEW: CLI package
│   ├── package.json              # Separate package for CLI
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # CLI entry point
│   │   ├── commands/
│   │   │   └── generate.ts       # Main generate command
│   │   ├── formatters/
│   │   │   ├── text.ts           # Text output formatter
│   │   │   ├── json.ts           # JSON output formatter
│   │   │   └── css.ts            # CSS output formatter
│   │   └── utils/
│   │       ├── color-parser.ts   # Parse color input strings
│   │       └── range-parser.ts   # Parse range inputs (e.g., "10:30")
│   └── tests/
│       └── cli.test.ts
├── src/                          # Existing web app
│   └── engine/                   # SHARED: Reused by CLI
└── shared/                       # NEW: Shared engine code (symlinked or imported)
```

---

## Workplan

### Phase 1: Project Setup
- [ ] Run `bun test` to establish baseline (all tests must pass)
- [ ] Create `cli/` directory structure
- [ ] Initialize `cli/package.json` with Citty and required dependencies
- [ ] Configure `cli/tsconfig.json` to import from `../src/engine`
- [ ] Verify engine code can be imported without React/DOM dependencies

### Phase 2: CLI Core Implementation
- [ ] Create CLI entry point with Citty
- [ ] Implement argument parser for all engine properties:
  - `--base` / `-b` (required): Base color (hex, hsl, oklch)
  - `--format` / `-f`: Output color format (hex, hsl, oklch) [default: hex]
  - `--size`: Number of swatches [default: 10]
  - `--lightness` / `-l`: Lightness range as "start:end" [default: 5:95]
  - `--saturation` / `-S`: Saturation range as "start:end" [default: 0:100]
  - `--hue` / `-H`: Hue shift range as "start:end" [default: 0:0]
  - `--lightness-scale`: Scale type (linear, geometric, fibonacci, etc.)
  - `--saturation-scale`: Scale type
  - `--hue-scale`: Scale type
  - `--tint-color`: Tint color to apply
  - `--tint-opacity`: Tint opacity (0-100)
  - `--tint-blend`: Blend mode for tint
  - `--add`: Add harmony ramps (repeatable: --add=complementary --add=triadic)
  - `--output` / `-o`: Output format (text, json, css) [default: text]
  - `--name` / `-n`: Ramp name for CSS variables [default: "ramp"]
- [ ] Implement range parser utility (e.g., "10:30" → {start: 10, end: 30})
- [ ] Implement color input validation

### Phase 3: Output Formatters
- [ ] Implement text formatter (simple list of colors)
- [ ] Implement JSON formatter (full ramp config + generated colors)
- [ ] Implement CSS formatter (CSS variables format)

### Phase 4: Harmony Support
- [ ] Add `--add` flag that can be used multiple times
- [ ] Support harmony types: complementary, triadic, analogous, split-complementary, square, compound
- [ ] Auto-generate ramp names based on harmony (e.g., ramp-complementary, ramp-triadic-1)

### Phase 5: Build & Distribution
- [ ] Add npm scripts for:
  - `dev`: Run CLI in development
  - `build`: Compile with Bun
  - `build:all`: Cross-compile for all platforms
- [ ] Configure Bun cross-compilation targets:
  - `bun-darwin-arm64` (macOS Apple Silicon)
  - `bun-darwin-x64` (macOS Intel)
  - `bun-linux-x64` (Linux x64)
  - `bun-linux-arm64` (Linux ARM)
  - `bun-windows-x64` (Windows)
- [ ] Add `bin` field to package.json for npx support

### Phase 6: Testing & Documentation
- [ ] Run root `bun test` to verify no engine regressions
- [ ] Write CLI-specific tests in `cli/tests/`:
  - Argument parsing tests
  - Output formatter tests
  - Engine integration tests
- [ ] Create `cli/README.md` with usage examples
- [ ] Implement `--help` with full documentation (see Help Menu below)

---

## CLI Interface Design

### Help Menu (`--help`)

```
rampa v1.0.0
Generate mathematically accurate, accessible color palettes from a base color.

USAGE:
  rampa --base <color> [options]

REQUIRED:
  -b, --base <color>           Base color to generate palette from.
                               Accepts: hex (#FF0000), hsl (hsl(0,100%,50%)), 
                               oklch (oklch(0.63 0.26 29))

COLOR FORMAT:
  -f, --format <format>        Output color format [default: hex]
                               • hex    - #3B82F6
                               • hsl    - hsl(217, 91%, 60%)
                               • oklch  - oklch(0.62 0.21 259)

PALETTE SIZE:
  --size <number>              Number of colors in the palette [default: 10]
                               Range: 2-20

COLOR RANGES:
  Ranges are specified as "start:end" where values represent percentages.

  -l, --lightness <range>      Lightness range from dark to light [default: 0:100]
                               Example: --lightness=10:90 (10% to 90%)

  -S, --saturation <range>     Saturation/chroma range [default: 100:0]
                               Example: --saturation=30:80

  -H, --hue <range>            Hue shift in degrees across the ramp [default: -10:10]
                               Example: --hue=-15:15 (shifts hue ±15°)

SCALE TYPES:
  Control how values are distributed across the palette.

  --lightness-scale <type>     Distribution curve for lightness [default: linear]
  --saturation-scale <type>    Distribution curve for saturation [default: linear]
  --hue-scale <type>           Distribution curve for hue [default: linear]

  Available scale types:
    • linear       - Even spacing (default)
    • geometric    - Exponential growth
    • fibonacci    - Fibonacci sequence spacing
    • golden-ratio - Golden ratio progression
    • logarithmic  - Logarithmic curve
    • powers-of-2  - Powers of 2 progression
    • ease-in      - Slow start, fast end
    • ease-out     - Fast start, slow end
    • ease-in-out  - Slow start and end, fast middle

TINTING:
  Apply a color tint across the entire palette.

  --tint-color <color>         Tint color to blend (hex, hsl, oklch)
  --tint-opacity <number>      Tint strength 0-100 [default: 0]
  --tint-blend <mode>          Blend mode [default: normal]

  Available blend modes:
    normal, darken, multiply, color-burn, lighten, screen,
    color-dodge, overlay, soft-light, hard-light, difference,
    exclusion, hue, saturation, color, luminosity

ADD HARMONY RAMPS:
  Generate additional palettes based on color harmony rules.
  Can be used multiple times to add several harmony ramps.

  --add <type>                 Add a harmony ramp to output

  Available harmonies:
    • complementary       - Opposite on color wheel (+1 ramp)
    • triadic             - 3 colors, 120° apart (+2 ramps)
    • analogous           - Adjacent colors, 30° apart (+2 ramps)
    • split-complementary - 2 colors near opposite (+2 ramps)
    • square              - 4 colors, 90° apart (+3 ramps)
    • compound            - Complementary + split (+3 ramps)

OUTPUT:
  -o, --output <format>        Output format [default: text]
                               • text - One color per line
                               • json - Full configuration + colors
                               • css  - CSS custom properties

  -n, --name <string>          Ramp name for CSS variables [default: ramp]
                               Example: --name=primary → --primary-0, --primary-10...

OTHER:
  -h, --help                   Show this help message
  -v, --version                Show version number
  --quiet                      Suppress non-essential output

EXAMPLES:
  # Basic palette from blue
  rampa --base="#3B82F6"

  # Custom ranges with 12 swatches
  rampa -b "#10B981" -l 10:90 -S 30:80 --size=12

  # OKLCH format with fibonacci lightness
  rampa -b "#8B5CF6" -f oklch --lightness-scale=fibonacci

  # CSS variables output
  rampa -b "#EF4444" -o css -n danger
  # Output: --danger-0: #fef2f2; --danger-10: #fee2e2; ...

  # With blue tint overlay
  rampa -b "#F59E0B" --tint-color="#0066FF" --tint-opacity=15 --tint-blend=overlay

  # Add complementary and triadic ramps
  rampa -b "#06B6D4" --add=complementary --add=triadic -o json

  # Hue shifting across the ramp
  rampa -b "#EC4899" -H -20:20 --hue-scale=ease-in-out
```

---

### Flag Reference (Short)

```
rampa [options]

Options:
  -b, --base <color>           Base color (hex, hsl, oklch) [required]
  -f, --format <format>        Color format: hex, hsl, oklch [default: hex]
  --size <number>              Number of color swatches [default: 10]
  
  -l, --lightness <range>      Lightness range (start:end, 0-100) [default: 0:100]
  -S, --saturation <range>     Saturation range (start:end, 0-100) [default: 100:0]
  -H, --hue <range>            Hue shift range (start:end, degrees) [default: -10:10]
  
  --lightness-scale <type>     Scale: linear, geometric, fibonacci, golden-ratio,
                               logarithmic, ease-in, ease-out, ease-in-out [default: linear]
  --saturation-scale <type>    Saturation scale type [default: linear]
  --hue-scale <type>           Hue scale type [default: linear]
  
  --tint-color <color>         Apply tint color
  --tint-opacity <number>      Tint opacity (0-100)
  --tint-blend <mode>          Blend mode: normal, multiply, screen, overlay, etc.
  
  --add <type>                 Add harmony ramp (repeatable). Types: complementary,
                               triadic, analogous, split-complementary, square, compound
  
  -o, --output <format>        Output: text, json, css [default: text]
  -n, --name <string>          Ramp name for CSS output [default: ramp]
  
  -h, --help                   Show help
  -v, --version                Show version
```

### Example Commands

```bash
# Simple palette from red
rampa --base="#FF0000"

# Custom lightness and saturation ranges
rampa --base="#3B82F6" --lightness=10:90 --saturation=30:80 --size=12

# OKLCH output format
rampa --base="#10B981" --format=oklch --output=text

# CSS variables output
rampa --base="#8B5CF6" --output=css --name=purple

# With tinting
rampa --base="#EF4444" --tint-color="#0000FF" --tint-opacity=20 --tint-blend=overlay

# Add complementary and triadic harmony ramps
rampa --base="#F59E0B" --add=complementary --add=triadic --output=json

# Multiple harmonies with CSS output
rampa --base="#06B6D4" --add=analogous --add=complementary -o css -n cyan

# Fibonacci scale for lightness
rampa --base="#06B6D4" --lightness-scale=fibonacci --size=8
```

---

## Build Scripts

```json
{
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build ./src/index.ts --compile --outfile=./dist/rampa",
    "build:darwin-arm64": "bun build ./src/index.ts --compile --target=bun-darwin-arm64 --outfile=./dist/rampa-darwin-arm64",
    "build:darwin-x64": "bun build ./src/index.ts --compile --target=bun-darwin-x64 --outfile=./dist/rampa-darwin-x64",
    "build:linux-x64": "bun build ./src/index.ts --compile --target=bun-linux-x64 --outfile=./dist/rampa-linux-x64",
    "build:linux-arm64": "bun build ./src/index.ts --compile --target=bun-linux-arm64 --outfile=./dist/rampa-linux-arm64",
    "build:windows-x64": "bun build ./src/index.ts --compile --target=bun-windows-x64 --outfile=./dist/rampa-windows-x64.exe",
    "build:all": "bun run build:darwin-arm64 && bun run build:darwin-x64 && bun run build:linux-x64 && bun run build:linux-arm64 && bun run build:windows-x64"
  }
}
```

---

## Dependencies

### CLI Package (`cli/package.json`)
```json
{
  "name": "rampa-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "rampa": "./dist/rampa"
  },
  "dependencies": {
    "citty": "^0.1.6",
    "chroma-js": "^3.1.2",
    "culori": "^4.0.1"
  },
  "devDependencies": {
    "@types/bun": "^1.2.17",
    "@types/chroma-js": "^3.1.1",
    "typescript": "^5.5.3"
  }
}
```

---

## Notes & Considerations

1. **Engine Import Strategy**: The engine code (`src/engine/`) has no React dependencies, so it can be directly imported by the CLI. We'll use TypeScript path aliases to share code.

2. **⚠️ Preserve Existing Tests**: The engine has comprehensive test coverage in `tests/engine/`. The CLI must:
   - NOT modify any engine code in `src/engine/`
   - Import engine functions as-is (read-only consumers)
   - Run `bun test` before and after implementation to ensure no regressions
   - Add CLI-specific tests separately in `cli/tests/`

3. **Color Parsing**: The engine already uses `chroma-js` and `culori` for color parsing, which handle hex, HSL, and OKLCH formats.

4. **Default Values**: Chosen to match the web app's sensible defaults for immediate usability.

5. **Exit Codes**: 
   - `0`: Success
   - `1`: Invalid arguments
   - `2`: Invalid color format

6. **Future Enhancements** (not in scope):
   - Interactive TUI mode
   - Config file support (`.ramparc`)
   - Pipe input (stdin)
   - Watch mode
