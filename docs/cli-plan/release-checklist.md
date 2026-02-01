# Rampa CLI - Release Checklist

## Pre-Release Verification

### Functionality Tests
- [ ] All 7 iterations completed and tested
- [ ] Root `bun test` passes (no engine regressions)
- [ ] CLI tests pass: `cd cli && bun test`

### Flag Verification
Test each flag individually and in combination:

```bash
# Core
rampa --base="#3B82F6"                    # ✓
rampa -b "#FF0000" --size=12              # ✓

# Ranges
rampa -b "#3B82F6" --lightness=10:90      # ✓
rampa -b "#3B82F6" --saturation=30:80     # ✓
rampa -b "#3B82F6" --hue=-15:15           # ✓

# Scales
rampa -b "#3B82F6" --lightness-scale=fibonacci    # ✓
rampa -b "#3B82F6" --saturation-scale=ease-out    # ✓
rampa -b "#3B82F6" --hue-scale=golden-ratio       # ✓

# Tinting
rampa -b "#3B82F6" --tint-color="#FF6600" --tint-opacity=20    # ✓
rampa -b "#3B82F6" --tint-color="#00FF00" --tint-blend=overlay # ✓

# Harmony
rampa -b "#3B82F6" --add=complementary                     # ✓
rampa -b "#3B82F6" --add=triadic --add=analogous          # ✓

# Output
rampa -b "#3B82F6" --output=text          # ✓
rampa -b "#3B82F6" --output=json          # ✓
rampa -b "#3B82F6" --output=css --name=blue    # ✓

# Format
rampa -b "#3B82F6" --format=hex           # ✓
rampa -b "#3B82F6" --format=hsl           # ✓
rampa -b "#3B82F6" --format=oklch         # ✓

# Combined
rampa -b "#3B82F6" -l 10:90 --lightness-scale=fibonacci \
  --tint-color="#FFD700" --tint-opacity=10 \
  --add=complementary --add=triadic \
  -o css -n blue -f oklch                 # ✓
```

### Error Handling
```bash
rampa                                     # Error: Missing --base
rampa --base="notacolor"                  # Error: Invalid color
rampa -b "#FF0000" --size=0               # Error: Size out of range
rampa -b "#FF0000" --lightness=invalid    # Error: Invalid range
rampa -b "#FF0000" --lightness-scale=bad  # Error: Invalid scale
rampa -b "#FF0000" --output=xml           # Error: Invalid output format
rampa -b "#FF0000" --add=invalid          # Error: Invalid harmony
```

### Build Verification
```bash
cd cli

# Build all platforms
bun run build:all

# Verify binaries exist
ls -la dist/

# Test compiled binary
./dist/rampa --version
./dist/rampa --help
./dist/rampa --base="#3B82F6" --add=complementary -o json
```

---

## Documentation Checklist

- [ ] `cli/README.md` is complete
- [ ] `--help` output matches documentation
- [ ] Examples in docs are tested and working
- [ ] `CLI_IMPLEMENTATION_PLAN.md` is up to date

---

## Release Steps

### 1. Version Bump
```bash
cd cli
# Update version in package.json
```

### 2. Final Tests
```bash
# Root tests
bun test

# CLI tests
cd cli && bun test
```

### 3. Build
```bash
cd cli
bun run build:all
```

### 4. Create GitHub Release
- [ ] Tag version: `cli-v1.0.0`
- [ ] Upload binaries:
  - `rampa-darwin-arm64`
  - `rampa-darwin-x64`
  - `rampa-linux-x64`
  - `rampa-linux-arm64`
  - `rampa-windows-x64.exe`
- [ ] Write release notes

### 5. npm Publish (Optional)
```bash
cd cli
npm publish
```

---

## Post-Release

- [ ] Test installation: `npm install -g rampa-cli`
- [ ] Verify `rampa --version` works globally
- [ ] Update main README.md with CLI section
- [ ] Announce release

---

## Quick Reference

### All Flags Summary

| Flag | Alias | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--base` | `-b` | color | required | Base color |
| `--size` | | number | 10 | Palette size |
| `--format` | `-f` | string | hex | Color format |
| `--lightness` | `-l` | range | 5:95 | Lightness range |
| `--saturation` | `-S` | range | 0:100 | Saturation range |
| `--hue` | `-H` | range | 0:0 | Hue shift range |
| `--lightness-scale` | | string | linear | Lightness curve |
| `--saturation-scale` | | string | linear | Saturation curve |
| `--hue-scale` | | string | linear | Hue curve |
| `--tint-color` | | color | none | Tint color |
| `--tint-opacity` | | number | 0 | Tint strength |
| `--tint-blend` | | string | normal | Blend mode |
| `--add` | | string | none | Add harmony (repeatable) |
| `--output` | `-o` | string | text | Output format |
| `--name` | `-n` | string | ramp | Ramp name |
| `--help` | `-h` | | | Show help |
| `--version` | `-v` | | | Show version |
