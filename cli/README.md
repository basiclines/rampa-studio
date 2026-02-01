# Rampa CLI

Generate mathematically accurate, accessible color palettes from a base color.

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev -- --base="#3B82F6"
bun run dev -- -b "#FF0000" --size=5

# Run tests
bun test
```

## Build

```bash
# Compile for current platform
bun run build
# Output: ./dist/rampa

# Run compiled binary
./dist/rampa --base="#3B82F6"
```

### Cross-compile for other platforms

```bash
# macOS Apple Silicon
bun build ./src/index.ts --compile --target=bun-darwin-arm64 --outfile=./dist/rampa-darwin-arm64

# macOS Intel
bun build ./src/index.ts --compile --target=bun-darwin-x64 --outfile=./dist/rampa-darwin-x64

# Linux x64
bun build ./src/index.ts --compile --target=bun-linux-x64 --outfile=./dist/rampa-linux-x64

# Linux ARM64
bun build ./src/index.ts --compile --target=bun-linux-arm64 --outfile=./dist/rampa-linux-arm64

# Windows x64
bun build ./src/index.ts --compile --target=bun-windows-x64 --outfile=./dist/rampa-windows-x64.exe
```

## Usage

```bash
rampa --base <color> [options]
```

### Options

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--base` | `-b` | Base color (hex, hsl, rgb) | required |
| `--size` | | Number of colors (2-20) | 10 |
| `--help` | `-h` | Show help | |
| `--version` | `-v` | Show version | |

### Examples

```bash
# Basic palette from blue
rampa --base="#3B82F6"

# Short alias with custom size
rampa -b "#FF0000" --size=5

# Using RGB format
rampa --base="rgb(16, 185, 129)"

# Using HSL format
rampa --base="hsl(217, 91%, 60%)"
```

## Output

Colors are output as hex values, one per line:

```
#f2f2f2
#d5d8dd
#b1bccd
#889fc4
#5980bf
#3363b3
#1e4b95
#0e3471
#041e48
#000a1a
```
