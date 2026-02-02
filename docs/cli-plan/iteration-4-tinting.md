# Rampa CLI - Iteration 4: Tinting

## Prerequisites
✅ Iteration 1-3 complete and tested

## Status: ✅ COMPLETE

## Goal
Add tinting support with color, opacity, and blend mode controls.

## Deliverable
```bash
rampa --base="#3B82F6" --tint-color="#FF6600" --tint-opacity=20
rampa --base="#10B981" --tint-color="#0000FF" --tint-opacity=15 --tint-blend=overlay
```

---

## Tasks

### 4.1 Define Blend Modes
- [ ] Create `cli/src/constants/blend-modes.ts` (or import from engine):
  ```typescript
  export const BLEND_MODES = [
    'normal',
    'darken',
    'multiply',
    'plus-darker',
    'color-burn',
    'lighten',
    'screen',
    'plus-lighter',
    'color-dodge',
    'overlay',
    'soft-light',
    'hard-light',
    'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity',
  ] as const;
  ```

### 4.2 Add Tint Flags
- [ ] Add `--tint-color` flag:
  - Type: color string (hex, hsl, oklch)
  - Default: none (no tinting)
  - Maps to: `tintColor`

- [ ] Add `--tint-opacity` flag:
  - Type: number (0-100)
  - Default: `0`
  - Maps to: `tintOpacity`
  - Note: Only applies if `--tint-color` is set

- [ ] Add `--tint-blend` flag:
  - Options: all blend modes
  - Default: `normal`
  - Maps to: `tintBlendMode`

### 4.3 Validation
- [ ] Validate `--tint-color` is a valid color
- [ ] Validate `--tint-opacity` is 0-100
- [ ] Validate `--tint-blend` is a valid blend mode
- [ ] Warn if `--tint-opacity` or `--tint-blend` used without `--tint-color`:
  ```
  Warning: --tint-opacity has no effect without --tint-color
  ```

### 4.4 Update Help Text
- [ ] Add tinting section:
  ```
  TINTING:
    --tint-color <color>       Tint color to blend (hex, hsl, oklch)
    --tint-opacity <number>    Tint strength 0-100 [default: 0]
    --tint-blend <mode>        Blend mode [default: normal]
  
    Blend modes: normal, darken, multiply, color-burn, lighten, screen,
                 color-dodge, overlay, soft-light, hard-light, difference,
                 exclusion, hue, saturation, color, luminosity
  ```

---

## Test Scenarios

```bash
# Basic tinting
rampa -b "#3B82F6" --tint-color="#FF6600" --tint-opacity=20
rampa -b "#10B981" --tint-color="#FFD700" --tint-opacity=30

# With blend modes
rampa -b "#3B82F6" --tint-color="#FF0000" --tint-opacity=25 --tint-blend=multiply
rampa -b "#3B82F6" --tint-color="#00FF00" --tint-opacity=15 --tint-blend=overlay
rampa -b "#3B82F6" --tint-color="#0000FF" --tint-opacity=20 --tint-blend=screen

# Combined with other flags
rampa -b "#3B82F6" -l 10:90 --lightness-scale=fibonacci --tint-color="#FFCC00" --tint-opacity=10

# Edge cases (should warn)
rampa -b "#3B82F6" --tint-opacity=20  # No tint-color
rampa -b "#3B82F6" --tint-blend=overlay  # No tint-color

# Should fail
rampa -b "#3B82F6" --tint-color="notacolor"
rampa -b "#3B82F6" --tint-color="#FF0000" --tint-opacity=150  # Out of range
rampa -b "#3B82F6" --tint-color="#FF0000" --tint-blend=invalid
```

## Visual Example

```bash
# Without tint
$ rampa -b "#3B82F6" --size=5
#eff6ff
#93c5fd
#3b82f6
#1d4ed8
#1e3a8a

# With warm tint (orange overlay at 20%)
$ rampa -b "#3B82F6" --size=5 --tint-color="#FF6600" --tint-opacity=20 --tint-blend=overlay
#f5f0e8
#a8b8c4
#5a7aa0
#3d5a7a
#2a3d52
```

---

## Definition of Done

- [ ] `--tint-color`, `--tint-opacity`, `--tint-blend` flags work correctly
- [ ] Tinting visually affects the output colors
- [ ] Warnings shown when tint flags used without `--tint-color`
- [ ] Invalid values show clear error messages
- [ ] All previous functionality still works
- [ ] Root `bun test` still passes

---

## Previous Iteration
← [Iteration 3: Scale Types](./iteration-3-scales.md)

## Next Iteration
→ [Iteration 5: Harmony Ramps](./iteration-5-harmony.md)
