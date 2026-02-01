# Website vs CLI: Default Values Parity

This document ensures the CLI uses the **exact same defaults** as the website, so both produce identical output for the same input.

## Website Defaults (from `src/config/DefaultColorRampValues.ts`)

```typescript
{
  baseColor: '#3b82f6',
  colorFormat: 'hex',
  totalSteps: 10,
  lightnessStart: 0,      // Start at 0% (dark)
  lightnessEnd: 100,      // End at 100% (light)
  chromaStart: -10,       // Hue shift start (degrees)
  chromaEnd: 10,          // Hue shift end (degrees)
  saturationStart: 100,   // Start at 100% saturation
  saturationEnd: 0,       // End at 0% saturation
}
```

## CLI Defaults (must match)

| Flag | Website Default | CLI Default | Notes |
|------|-----------------|-------------|-------|
| `--size` | 10 | 10 | ✅ |
| `--format` | hex | hex | ✅ |
| `--lightness` | 0:100 | 0:100 | Dark to light |
| `--saturation` | 100:0 | 100:0 | High to low |
| `--hue` | -10:10 | -10:10 | Slight shift |
| `--lightness-scale` | linear | linear | ✅ |
| `--saturation-scale` | linear | linear | ✅ |
| `--hue-scale` | linear | linear | ✅ |
| `--tint-color` | none | none | ✅ |
| `--tint-opacity` | 0 | 0 | ✅ |
| `--tint-blend` | normal | normal | ✅ |

## Parity Test

After each iteration, run this test to verify CLI matches website:

```bash
# CLI command with all defaults explicit
rampa --base="#3b82f6" --size=10 --lightness=0:100 --saturation=100:0 --hue=-10:10

# Should produce IDENTICAL output to website with:
# - Base color: #3b82f6
# - Steps: 10
# - All sliders at default positions
```

## Important Notes

1. **Lightness direction**: Website goes 0→100 (dark to light), meaning first color is darkest
2. **Saturation direction**: Website goes 100→0 (high to low), meaning first colors are more saturated
3. **Hue shift**: Website shifts -10° to +10° across the ramp (subtle warm-to-cool shift)

## Current CLI Status

| Iteration | Parity Status |
|-----------|---------------|
| 1 - Foundation | ⚠️ Hardcoded, needs update |
| 2 - Ranges | Will implement correct defaults |
| 3 - Scales | Will implement correct defaults |
| 4 - Tinting | Will implement correct defaults |
| 5 - Harmony | Will implement correct defaults |
| 6 - Outputs | Will implement correct defaults |
