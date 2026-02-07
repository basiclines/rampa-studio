# Minimal Slack Sidebar Theme — Generated with rampa

## Slack Theme (paste into Preferences > Themes > Custom)

```
#fafafa,#e3e4e6,#2861f0,#fafafa,#e3e4e6,#2c3844,#0a45db,#fafafa,#fafafa,#2c3844
```

## rampa Commands Used

### Command 1 — Cool gray base + warm complementary

```bash
rampa -C "#8B9DAF" --size=12 -L 98:5 -S 5:25 -H 0:0 --add=complementary -F hex -O text --no-preview
```

**Why:** Generates a 12-step cool blue-gray ramp from near-white (L98) to near-black (L5) with low saturation (5→25%) for a neutral, muted palette. The `--add=complementary` flag generates a warm counterpart automatically. The base color `#8B9DAF` is a muted blue-gray — the DNA of the entire theme.

**Output (base ramp):**
```
#fafafa   ← used for Column BG, Active Item Text, Badge Text, Top Nav BG
#e3e4e6   ← used for Menu BG Hover, Hover Item BG
#cbcfd3
#b2b9c1
#98a4af
#7e8e9e
#65798c
#516375
#3e4d5d
#2c3844   ← used for Text Color, Top Nav Text
#1a222a
#0a0d10
```

### Command 2 — Blue accent ramp

```bash
rampa -C "#4A7BF7" --size=6 -L 85:35 -S 75:95 -H 0:0 -F hex -O text --no-preview
```

**Why:** Generates a 6-step saturated blue ramp (S 75→95%) for accent colors. The lightness range (85→35) ensures we get both a vivid mid-blue and a deep blue for visual hierarchy between active states and badges.

**Output:**
```
#bcccf5
#8da9f2
#5c86f0
#2861f0   ← used for Active Item
#0a45db   ← used for Mention Badge
#0434ae
```

## Color Mapping (10 slots)

| # | Slot | Hex | Source | Rationale |
|---|------|-----|--------|-----------|
| 1 | Column BG | `#fafafa` | Gray ramp, step 1 (L98) | Near-white background — clean, airy, minimal |
| 2 | Menu BG Hover | `#e3e4e6` | Gray ramp, step 2 (L~89) | Subtle gray shift on hover, barely visible |
| 3 | Active Item | `#2861f0` | Blue ramp, step 4 (L55) | Vivid blue accent — the single pop of color |
| 4 | Active Item Text | `#fafafa` | Gray ramp, step 1 (L98) | White text on blue — high contrast |
| 5 | Hover Item BG | `#e3e4e6` | Gray ramp, step 2 (L~89) | Matches menu hover for consistency |
| 6 | Text Color | `#2c3844` | Gray ramp, step 10 (L~23) | Dark blue-gray text — softer than black, high readability |
| 7 | Mention Badge | `#0a45db` | Blue ramp, step 5 (L45) | Deeper blue badge — draws attention, distinct from active |
| 8 | Mention Badge Text | `#fafafa` | Gray ramp, step 1 (L98) | White text on deep blue — high contrast |
| 9 | Top Nav BG | `#fafafa` | Gray ramp, step 1 (L98) | Seamless with sidebar — unified, borderless feel |
| 10 | Top Nav Text | `#2c3844` | Gray ramp, step 10 (L~23) | Matches sidebar text — cohesive typography |

## Design Decisions

- **Two commands, one cohesive palette:** Only 2 rampa commands generate all 10 theme values. The gray ramp provides structure; the blue ramp provides accent.
- **Mathematical harmony:** The complementary harmony was generated (warm grays) to have available if needed, but the cool base ramp alone provided the perfect neutral range.
- **Single accent color family:** Both the active item and mention badge use blues from the same ramp — visually unified but distinguishable (L55 vs L45).
- **Minimal contrast strategy:** Light backgrounds (`#fafafa`), mid-light hovers (`#e3e4e6`), dark text (`#2c3844`). No saturated backgrounds, no competing colors.
