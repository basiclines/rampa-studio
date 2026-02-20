# Rampa SDK Examples

Practical examples using `@basiclines/rampa-sdk`.

## Ghostty 256-Color Palette Generator

Generates a full 256-color terminal palette from any Ghostty theme, with semantic color functions and an interactive TUI preview. Based on [jake-stewart's writeup](https://gist.github.com/jake-stewart/0a8ea46159a7da2c808e5be2177e1783).

### Usage

```bash
# Interactive mode — browse 438 Ghostty themes with ← → arrows
node ghostty-256-palette.js --interactive

# Generate palette config for a specific theme
node ghostty-256-palette.js --theme "Catppuccin Mocha"

# Show color table with all 256 colors
node ghostty-256-palette.js --theme "Tokyo Night" --table

# List all available themes
node ghostty-256-palette.js --list

# Save palette to Ghostty config
node ghostty-256-palette.js --theme "Catppuccin Mocha" > ~/.config/ghostty/palette
```

### Interactive mode

Press `←` `→` to switch themes, `t` to toggle the color table, `q` to quit.

Shows an annotated TUI mockup using 12 semantic design tokens:

| Token | Function | Purpose |
|-------|----------|---------|
| `backgroundPrimary` | `tint({ k: 0 })` | Main background |
| `backgroundSecondary` | `tint({ w: 1 })` | Title bar, headers |
| `surfacePrimary` | `tint({ b: 1 })` | Elevated surfaces |
| `textPrimary` | `base('w')` | Primary text |
| `textSecondary` | `neutral(18)` | Secondary text |
| `textTertiary` | `neutral(12)` | Labels, hints |
| `statusSuccess` | `base('g')` | Success messages |
| `statusWarning` | `base('y')` | Warning messages |
| `statusDanger` | `base('r')` | Error messages |
| `statusInfo` | `base('b')` | Info messages |
| `selected` | `tint({ b: 2 })` | Selected items |
| `border` | `neutral(4)` | Borders, dividers |

### Color functions

Four functions cover all 256 colors:

| Function | Range | Count | Description |
|----------|-------|-------|-------------|
| `base(prefix)` | 0–7 | 8 | Base16 normal colors |
| `bright(prefix)` | 8–15 | 8 | Base16 bright colors |
| `tint({ hues })` | 16–231 | 216 | 6×6×6 color cube |
| `neutral(n)` | 232–255 | 24 | Grayscale ramp |

**Prefixes**: `k`=black, `r`=red, `g`=green, `y`=yellow, `b`=blue, `m`=magenta, `c`=cyan, `w`=white

**tint examples**:
- `tint({ r: 4 })` — strong red
- `tint({ b: 2, g: 3 })` — teal blend
- `tint({ r: 5, w: 2 })` — pastel red (white raises all axes)

### How it works

Uses `rampa.mix()` for perceptually uniform OKLCH interpolation:

- **Colors 0–15**: Base16 colors from the theme
- **Colors 16–231**: 6×6×6 color cube — trilinear interpolation between 8 base16 corners
- **Colors 232–255**: 24-step grayscale ramp from background to foreground

### Requirements

Themes are loaded from the Ghostty app bundle:
```
/Applications/Ghostty.app/Contents/Resources/ghostty/themes/
```

## Setup

```bash
cd sdk/examples
npm install
```
