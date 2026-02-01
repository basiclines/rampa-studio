# Rampa CLI - Iteration 2: Color Ranges & Format

## Prerequisites
✅ Iteration 1 complete and tested

## Status: ✅ COMPLETE

## Goal
Add color range controls (lightness, saturation, hue) and output format selection.

## Deliverable
```bash
rampa --base="#3B82F6" --lightness=10:90 --saturation=30:80
rampa --base="#FF0000" --format=oklch
rampa --base="#10B981" --hue=-15:15
```

---

## Tasks

### 2.1 Range Parser Utility
- [x] Create `cli/src/utils/range-parser.ts`:
  ```typescript
  // Parses "10:90" → { start: 10, end: 90 }
  export function parseRange(input: string): { start: number; end: number }
  ```
- [x] Handle edge cases:
  - Single value `"50"` → `{ start: 50, end: 50 }`
  - Negative values `"-15:15"` → `{ start: -15, end: 15 }`
- [x] Add validation with clear error messages

### 2.2 Add Range Flags
- [x] Add `--lightness` / `-l` flag:
  - Format: `start:end` (0-100)
  - Default: `0:100` (dark to light, matches website)
  - Maps to: `lightnessStart`, `lightnessEnd`
  
- [x] Add `--saturation` / `-S` flag:
  - Format: `start:end` (0-100)
  - Default: `100:0` (high to low, matches website)
  - Maps to: `saturationStart`, `saturationEnd`
  
- [x] Add `--hue` / `-H` flag:
  - Format: `start:end` (degrees, can be negative)
  - Default: `-10:10` (slight shift, matches website)
  - Maps to: `chromaStart`, `chromaEnd`

### 2.3 Add Format Flag
- [x] Add `--format` / `-f` flag:
  - Options: `hex`, `hsl`, `rgb`, `oklch`
  - Default: auto-detected from input
- [x] Update output to respect format

### 2.4 Update Engine Integration
- [x] Build complete `ColorRampConfig` from CLI args

### 2.5 Parity Test
- [x] Run CLI with explicit defaults and compare to website output:
  ```bash
  rampa --base="#3b82f6" --size=10 --lightness=0:100 --saturation=100:0 --hue=-10:10
  ```
- [x] Verified working with website defaults

---

## Definition of Done

- [x] `--lightness`, `--saturation`, `--hue` flags work with range syntax
- [x] `--format` outputs colors in hex, hsl, rgb, or oklch
- [x] Format auto-detected from input (bonus feature!)
- [x] Invalid ranges show clear error messages
- [x] All iteration 1 functionality still works
- [x] Root tests unchanged (4 pre-existing failures, not CLI-related)

## Test Scenarios

```bash
# Lightness range
rampa -b "#3B82F6" --lightness=20:80
rampa -b "#3B82F6" -l 10:95

# Saturation range  
rampa -b "#3B82F6" --saturation=40:90
rampa -b "#3B82F6" -S 50:100

# Hue shift
rampa -b "#3B82F6" --hue=-20:20
rampa -b "#3B82F6" -H 0:30

# Combined
rampa -b "#3B82F6" -l 15:85 -S 30:90 -H -10:10

# Format output
rampa -b "#3B82F6" --format=hsl
rampa -b "#3B82F6" -f oklch

# Should fail
rampa -b "#3B82F6" --lightness=invalid
rampa -b "#3B82F6" --lightness=0:150
```

---

## Previous Iteration
← [Iteration 1: Foundation](./iteration-1-foundation.md)

## Next Iteration
→ [Iteration 3: Scale Types](./iteration-3-scales.md)
