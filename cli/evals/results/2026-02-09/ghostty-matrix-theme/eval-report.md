# Eval: ghostty-matrix-theme

- **Date**: 2026-02-09T08:01:56.009Z
- **Rampa Version**: 1.3.1
- **Prompt**: ghostty-matrix-theme

## Prompt

````
Create a custom Ghostty terminal theme inspired by the Matrix movie aesthetic (green phosphor text on a dark background).

## Requirements

1. **Discover rampa first**: Run `rampa --help` to understand all available commands and flags before generating any colors.

2. **Every color must come from rampa output**: Do not invent or hardcode hex codes. Every color value in the final theme must be a direct output from a rampa command.

3. **Use mathematical color combinations**: Use rampa's built-in harmony flags (`--add=complementary`, `--add=triadic`, `--add=square`, `--add=shift:N`, etc.) to generate mathematically related color palettes. Avoid running many separate rampa commands to get ad-hoc colors.

4. **Efficient command usage**: Prefer fewer rampa commands with `--add` flags to generate multiple related ramps at once, rather than running rampa many times with different base colors.

5. **Pick a Matrix green as your base color** and build the entire theme from it using rampa's color math.

## Ghostty Theme Format

The theme file uses `key = value` syntax:

~~~
background = #000000
foreground = #00ff41
cursor-color = #00ff41
selection-background = #003300
selection-foreground = #00ff41
palette = 0=#000000
palette = 1=#ff0000
...
palette = 15=#ffffff
~~~

You need: background, foreground, cursor-color, selection-background, selection-foreground, and palette entries 0-15 (the 16 ANSI colors: 8 normal + 8 bright variants).

## Deliverable

Output the complete Ghostty theme file with every color sourced from rampa commands. Show the rampa commands you used and explain which output colors you picked for each theme slot.
````

---

## Model: Claude Opus 4.6 (`claude-opus-4.6`)

### Response

<details>
<summary>Full model response</summary>

Theme created. Here's the full breakdown:

---

## Rampa Commands Used

### Command 1 — Main palette with 3 harmonies
```
rampa -C "#00ff41" --size=8 -L 3:95 -S 90:40 --add=complementary --add=shift:120 --add=shift:240 --no-preview -O json -F hex
```
Base color `#00ff41` (Matrix green) generates 4 ramps of 8 colors each:
- **base** (greens): `#010f02` → `#edf7f1`
- **complementary** (magentas): `#0f010d` → `#f7edf3`
- **shift:120** (blues/purples): `#02010f` → `#f1edf7`
- **shift:240** (reds/oranges): `#0f0201` → `#f7f1ed`

### Command 2 — Cyan accent via shift:60
```
rampa -C "#00ff41" --size=5 -L 5:70 -S 100:60 --add=shift:60 --no-preview -O json -F hex
```
Generates a cyan ramp for ANSI blue/cyan slots: `#1385ac`, `#37a4dc`

## Color Assignments

| Slot | Color | Source |
|---|---|---|
| background | `#010f02` | base[0] — near-black green |
| foreground | `#22b644` | base[3] — mid-bright green |
| cursor-color | `#48d36f` | base[4] — bright green |
| selection-bg | `#074b10` | base[1] — dark green |
| selection-fg | `#84dba0` | base[5] — light green |
| 0 (black) | `#010f02` | base[0] |
| 1 (red) | `#b64422` | shift-240[3] — orange-red |
| 2 (green) | `#22b644` | base[3] |
| 3 (yellow) | `#37dc6e` | cmd2 base[3] — bright green-yellow |
| 4 (blue) | `#4422b6` | shift-120[3] |
| 5 (magenta) | `#b62294` | complementary[3] |
| 6 (cyan) | `#1385ac` | cmd2 shift-60[2] |
| 7 (white) | `#84dba0` | base[5] |
| 8 (bright black) | `#074b10` | base[1] |
| 9 (bright red) | `#d36f48` | shift-240[4] |
| 10 (bright green) | `#48d36f` | base[4] |
| 11 (bright yellow) | `#85e0ab` | cmd2 base[4] |
| 12 (bright blue) | `#6f48d3` | shift-120[4] |
| 13 (bright magenta) | `#d348ad` | complementary[4] |
| 14 (bright cyan) | `#37a4dc` | cmd2 shift-60[3] |
| 15 (bright white) | `#edf7f1` | base[7] — near-white green |

## Artifact

`/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/ghostty-matrix-theme/output-claude-opus-4.6/matrix`

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: The response shows a reasonable approach with proper rampa flag usage and color harmony concepts, but there's no evidence the commands were actually executed — the hex values appear fabricated rather than verified from real rampa output, and the actual theme file content is not shown inline despite being referenced as an artifact.

---

## Model: GPT-5.2 Codex (`gpt-5.2-codex`)

### Response

<details>
<summary>Full model response</summary>

Commands: `rampa --help` (discover flags) and `rampa -C "#00ff41" --size=8 --add=complementary --add=triadic --add=square --add=shift:30 -O json --no-preview` (single Matrix-green base with harmonies to source all colors).  
Color selection from that JSON: background #000000 (base[0]); foreground/cursor #63c17d (base[4]); selection-bg #05440e (base[1]); selection-fg #d5e0d9 (base[6]); palette0 #000000 (base[0]), 1 #7d2815 (triadic-2[2]), 2 #157d28 (base[2]), 3 #ac8a2f (square-3[3]), 4 #2f50ac (square-1[3]), 5 #ac2f8f (complementary[3]), 6 #157d5c (shift-30[2]), 7 #d5e0d9 (base[6]), 8 #05440e (base[1]), 9 #c17d63 (triadic-2[4]), 10 #63c17d (base[4]), 11 #c1ac63 (square-3[4]), 12 #6377c1 (square-1[4]), 13 #c163a6 (complementary[4]), 14 #63c1ac (shift-30[4]), 15 #ffffff (base[7]).  
Artifact: /Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/ghostty-matrix-theme/output-gpt-5.2-codex/ghostty-matrix-theme.conf (tests+build: `bun test && bun run build`).

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: The response describes a reasonable approach using rampa with harmony flags and maps colors to theme slots, but it's unclear whether the commands were actually executed and the hex values verified from real rampa output, and the explanation is terse without showing actual command output to prove colors weren't invented.

---

## Model: Gemini 3 Pro (`gemini-3-pro-preview`)

### Response

<details>
<summary>Full model response</summary>

Here is the custom Matrix-inspired Ghostty theme.

### Rampa Command & Strategy

I used a single `rampa` command to generate all colors from the classic "Matrix Green" base (`#00FF41`). I generated 10-step ramps for the base color and 5 mathematical hue shifts to cover the full ANSI spectrum while maintaining a cohesive, mathematically related aesthetic.

```bash
rampa --color "#00FF41" --size 10 --lightness 2:90 --add=shift:60 --add=shift:120 --add=complementary --add=shift:240 --add=shift:300 --output json
```

### Color Selection Logic
*   **Base Color**: `#00FF41` (Matrix Green)
*   **Background (`#000a01`)**: Index 0 of the Base ramp (darkest green-black).
*   **Foreground (`#a3c4af`)**: Index 7 of the Base ramp (desaturated light green for readability).
*   **Cursor (`#4ab969`)**: Index 5 of the Base ramp (mid-tone green).
*   **ANSI Colors**:
    *   **Greens/Blacks/Whites**: Derived directly from the **Base** ramp.
    *   **Red**: Shift 240° (Index 4 & 6)
    *   **Yellow**: Shift 300° (Index 4 & 6)
    *   **Blue**: Shift 120° (Index 4 & 6)
    *   **Magenta**: Complementary / Shift 180° (Index 4 & 6)
    *   **Cyan**: Shift 60° (Index 4 & 6)

### Ghostty Theme File

Saved to: `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/ghostty-matrix-theme/output-gemini-3-pro-preview/matrix.theme`

```ini
# Matrix Ghostty Theme
# Generated with rampa
# Command: rampa --color "#00FF41" --size 10 --lightness 2:90 --add=shift:60 --add=shift:120 --add=complementary --add=shift:240 --add=shift:300

background = #000a01
foreground = #a3c4af
cursor-color = #4ab969
selection-background = #1b8530
selection-foreground = #e6e6e6

# Palette
# 0: Black (Base Index 1)
palette = 0=#03390a
# 1: Red (Shift-240 Index 4)
palette = 1=#a34a2f
# 2: Green (Base Index 4)
palette = 2=#2fa34a
# 3: Yellow (Shift-300 Index 4)
palette = 3=#88a32f
# 4: Blue (Shift-120 Index 4)
palette = 4=#4a2fa3
# 5: Magenta (Complementary Index 4)
palette = 5=#a32f88
# 6: Cyan (Shift-60 Index 4)
palette = 6=#2f88a3
# 7: White (Base Index 7)
palette = 7=#a3c4af

# Bright Palette
# 8: Bright Black (Base Index 3)
palette = 8=#1b8530
# 9: Bright Red (Shift-240 Index 6)
palette = 9=#bc8e79
# 10: Bright Green (Base Index 6)
palette = 10=#79bc8e
# 11: Bright Yellow (Shift-300 Index 6)
palette = 11=#a7bc79
# 12: Bright Blue (Shift-120 Index 6)
palette = 12=#8e79bc
# 13: Bright Magenta (Complementary Index 6)
palette = 13=#bc79a7
# 14: Bright Cyan (Shift-60 Index 6)
palette = 14=#79a7bc
# 15: Bright White (Base Index 9)
palette = 15=#e6e6e6
```

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: Well-structured theme with efficient single-command approach using harmony flags, but no evidence of actually running `rampa --help` first or executing the rampa command to verify output — colors appear plausible but may be fabricated rather than sourced from actual rampa output.
