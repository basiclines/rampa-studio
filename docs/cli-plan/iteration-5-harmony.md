# Rampa CLI - Iteration 5: Harmony Ramps

## Prerequisites
✅ Iteration 1-4 complete and tested

## Status: ✅ COMPLETE

## Goal
Add the `--add` flag to generate additional harmony-based color ramps alongside the base ramp.

## Deliverable
```bash
rampa --base="#3B82F6" --add=complementary
rampa --base="#FF0000" --add=triadic --add=analogous
```

---

## Tasks

### 5.1 Define Harmony Types
- [ ] Create `cli/src/constants/harmonies.ts`:
  ```typescript
  export const HARMONY_TYPES = [
    'complementary',      // +180° (1 extra ramp)
    'triadic',            // +120°, +240° (2 extra ramps)
    'analogous',          // +30°, +60° (2 extra ramps)
    'split-complementary', // +150°, +210° (2 extra ramps)
    'square',             // +90°, +180°, +270° (3 extra ramps)
    'compound',           // +180°, +150°, +210° (3 extra ramps)
  ] as const;
  
  export type HarmonyType = typeof HARMONY_TYPES[number];
  ```

### 5.2 Add `--add` Flag
- [ ] Implement `--add` as a repeatable flag:
  ```typescript
  add: {
    type: 'string',
    description: 'Add harmony ramp (can be used multiple times)',
    // Citty handles arrays for repeated flags
  },
  ```
- [ ] Support multiple uses: `--add=complementary --add=triadic`

### 5.3 Harmony Color Generation
- [ ] Use existing engine functions:
  - `getComplementaryColors()`
  - `getTriadColors()`
  - `getAnalogousColors()`
  - `getSplitComplementaryColors()`
  - `getSquareColors()`
  - `getCompoundColors()`
- [ ] Generate full ramp for each harmony color

### 5.4 Output Formatting
- [ ] For text output, separate ramps with headers:
  ```
  # ramp (base)
  #eff6ff
  #3b82f6
  #1e3a8a
  
  # ramp-complementary
  #fff7ed
  #f97316
  #9a3412
  ```
- [ ] Auto-generate ramp names:
  - Base: `{name}` (e.g., `ramp`)
  - Complementary: `{name}-complementary`
  - Triadic: `{name}-triadic-1`, `{name}-triadic-2`
  - Analogous: `{name}-analogous-1`, `{name}-analogous-2`

### 5.5 Validation
- [ ] Validate harmony type is supported
- [ ] Handle duplicate `--add` values (ignore duplicates)
- [ ] Show error with available harmonies:
  ```
  Error: Invalid harmony type "invalid"
  Available: complementary, triadic, analogous, split-complementary, square, compound
  ```

---

## Test Scenarios

```bash
# Single harmony
rampa -b "#3B82F6" --add=complementary
rampa -b "#3B82F6" --add=triadic
rampa -b "#3B82F6" --add=analogous

# Multiple harmonies
rampa -b "#3B82F6" --add=complementary --add=triadic
rampa -b "#3B82F6" --add=analogous --add=split-complementary --add=square

# Combined with all other flags
rampa -b "#3B82F6" -l 10:90 --lightness-scale=fibonacci --tint-color="#FFD700" --tint-opacity=10 --add=complementary

# With custom name
rampa -b "#3B82F6" --name=blue --add=complementary
# Outputs: blue, blue-complementary

# Should fail
rampa -b "#3B82F6" --add=invalid
rampa -b "#3B82F6" --add=  # empty value
```

## Expected Output

```bash
$ rampa --base="#3B82F6" --add=complementary --size=5

# ramp (base)
#eff6ff
#93c5fd
#3b82f6
#1d4ed8
#1e3a8a

# ramp-complementary
#fff7ed
#fdba74
#f97316
#c2410c
#9a3412
```

```bash
$ rampa --base="#10B981" --add=triadic --size=3

# ramp (base)
#ecfdf5
#10b981
#064e3b

# ramp-triadic-1
#fdf4ff
#d946ef
#701a75

# ramp-triadic-2
#fefce8
#eab308
#713f12
```

---

## Definition of Done

- [ ] `--add` flag works with all harmony types
- [ ] Multiple `--add` flags can be combined
- [ ] Output clearly separates multiple ramps with headers
- [ ] Ramp names are auto-generated logically
- [ ] All flags from previous iterations work with harmony ramps
- [ ] Root `bun test` still passes

---

## Previous Iteration
← [Iteration 4: Tinting](./iteration-4-tinting.md)

## Next Iteration
→ [Iteration 6: Output Formats](./iteration-6-outputs.md)
