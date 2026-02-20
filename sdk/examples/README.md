# Rampa SDK Examples

Practical examples using `@basiclines/rampa-sdk`.

## Ghostty 256-Color Palette

Generates a full 256-color terminal palette from a base16 theme, following the approach described in [jake-stewart's writeup](https://gist.github.com/jake-stewart/0a8ea46159a7da2c808e5be2177e1783).

```bash
# Default theme (catppuccin-mocha)
node ghostty-256-palette.js

# Choose a theme
node ghostty-256-palette.js solarized-dark
node ghostty-256-palette.js tokyo-night
node ghostty-256-palette.js gruvbox-dark

# Save to file
node ghostty-256-palette.js catppuccin-mocha > ~/.config/ghostty/palette
```

### How it works

The script uses rampa-sdk to generate perceptually uniform color ramps:

- **Colors 0-15**: Base16 colors (passed through from the theme)
- **Colors 16-231**: 6×6×6 color cube — trilinear interpolation between the 8 base16 corners (black, red, green, yellow, blue, magenta, cyan, white) using `rampa()` ramps
- **Colors 232-255**: 24-step grayscale ramp from background to foreground using `rampa().saturation(0, 0)`

### Available themes

| Theme | Description |
|-------|-------------|
| `catppuccin-mocha` | Warm dark theme (default) |
| `solarized-dark` | Ethan Schoonover's classic |
| `tokyo-night` | Dark blue theme |
| `gruvbox-dark` | Retro groove |

## Setup

```bash
cd sdk/examples
npm install
```
