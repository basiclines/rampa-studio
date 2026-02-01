# Rampa CLI - Iteration 3: Scale Types

## Prerequisites
✅ Iteration 1 complete and tested
✅ Iteration 2 complete and tested

## Status: ✅ COMPLETE

## Goal
Add scale type controls for lightness, saturation, and hue distribution curves.

## Deliverable
```bash
rampa --base="#3B82F6" --lightness-scale=fibonacci
rampa --base="#FF0000" --saturation-scale=ease-out --hue-scale=ease-in
```

---

## Tasks

### 3.1 Define Scale Types
- [ ] Create `cli/src/constants/scales.ts`:
  ```typescript
  export const SCALE_TYPES = [
    'linear',
    'geometric', 
    'fibonacci',
    'golden-ratio',
    'logarithmic',
    'powers-of-2',
    'musical-ratio',
    'cielab-uniform',
    'ease-in',
    'ease-out',
    'ease-in-out',
  ] as const;
  
  export type ScaleType = typeof SCALE_TYPES[number];
  ```

### 3.2 Add Scale Flags
- [ ] Add `--lightness-scale` flag:
  - Options: all scale types
  - Default: `linear`
  - Maps to: `lightnessScaleType`

- [ ] Add `--saturation-scale` flag:
  - Options: all scale types
  - Default: `linear`
  - Maps to: `saturationScaleType`

- [ ] Add `--hue-scale` flag:
  - Options: all scale types
  - Default: `linear`
  - Maps to: `hueScaleType`

### 3.3 Validation
- [ ] Validate scale type is one of the allowed values
- [ ] Show available options in error message:
  ```
  Error: Invalid scale type "invalid"
  Available: linear, geometric, fibonacci, golden-ratio, logarithmic, 
             powers-of-2, musical-ratio, ease-in, ease-out, ease-in-out
  ```

### 3.4 Update Help Text
- [ ] Add scale types section to help:
  ```
  SCALE TYPES:
    --lightness-scale <type>   Distribution curve for lightness [default: linear]
    --saturation-scale <type>  Distribution curve for saturation [default: linear]
    --hue-scale <type>         Distribution curve for hue [default: linear]
  
    Available: linear, geometric, fibonacci, golden-ratio, logarithmic,
               powers-of-2, ease-in, ease-out, ease-in-out
  ```

---

## Test Scenarios

```bash
# Individual scales
rampa -b "#3B82F6" --lightness-scale=fibonacci
rampa -b "#3B82F6" --saturation-scale=ease-out
rampa -b "#3B82F6" --hue-scale=golden-ratio

# Combined with ranges
rampa -b "#3B82F6" -l 10:90 --lightness-scale=ease-in-out
rampa -b "#3B82F6" -H -30:30 --hue-scale=fibonacci

# All scales
rampa -b "#3B82F6" --lightness-scale=geometric --saturation-scale=ease-in --hue-scale=logarithmic

# Should fail
rampa -b "#3B82F6" --lightness-scale=invalid
rampa -b "#3B82F6" --saturation-scale=cubic  # not supported
```

## Visual Comparison

The difference between scales is subtle but important for designers:

```bash
# Linear (even spacing)
$ rampa -b "#3B82F6" -l 10:90 --size=5
#1e3a8a  # 10%
#2563eb  # 30%
#3b82f6  # 50%
#60a5fa  # 70%
#dbeafe  # 90%

# Ease-in (slow start, clustered at dark end)
$ rampa -b "#3B82F6" -l 10:90 --size=5 --lightness-scale=ease-in
#1e3a8a  # 10%
#1e40af  # 18%
#2563eb  # 34%
#60a5fa  # 58%
#dbeafe  # 90%
```

---

## Definition of Done

- [ ] All three scale flags work correctly
- [ ] Invalid scale types show helpful error with available options
- [ ] Scales work correctly combined with range flags
- [ ] All previous iteration functionality still works
- [ ] Root `bun test` still passes

---

## Previous Iteration
← [Iteration 2: Color Ranges & Format](./iteration-2-ranges.md)

## Next Iteration
→ [Iteration 4: Tinting](./iteration-4-tinting.md)
