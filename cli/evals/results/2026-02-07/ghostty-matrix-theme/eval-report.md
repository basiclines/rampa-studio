# Eval: ghostty-matrix-theme

- **Date**: 2026-02-07T21:32:37.322Z
- **Rampa Version**: 1.1.3
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

Theme file created at:
`/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/ghostty-matrix-theme/output-claude-opus-4.6/matrix`

---

## Rampa Commands Used

### Command 1 — Base green ramp + complementary/analogous harmonies
```
rampa -C "#00FF41" --size=10 -L 0:100 -S 100:0 \
  --add=complementary --add=shift:30 --add=shift:-30 --add=shift:60 --add=shift:180 \
  -O json --no-preview
```
Generated 6 ramps (10 colors each) from the base Matrix green. This produced:
- **Base ramp**: greens from black→white (used for palette 0, 2, 7, 8, 10, 15)
- **Complementary** (magenta #FF00BE): used for palette 5, 13
- **shift:30** (cyan #00FFC1): used for palette 6, 14

### Command 2 — Red, yellow, and square harmonies
```
rampa -C "#00FF41" --size=10 -L 0:100 -S 100:0 \
  --add=shift:225 --add=shift:285 --add=square \
  -O json --no-preview
```
- **shift:225** (red #FF0100): used for palette 1, 9
- **shift:285** (yellow #FEFF00): used for palette 3, 11
- **square** (blue #003EFF): used for palette 4, 12

### Command 3 — Dark background tones
```
rampa -C "#00FF41" --size=10 -L 0:15 -S 100:60 --add=shift:30 -O json --no-preview
```
Narrow lightness range (0–15%) to produce deeply dark greens for:
- **background** = `#000801` (idx 1, near-black with green hint)
- **selection-background** = `#05260e` (idx 5, dark green)

### Command 4 — Bright foreground tones
```
rampa -C "#00FF41" --size=6 -L 60:100 -S 100:70 --add=shift:30 -O json --no-preview
```
- **foreground / cursor / selection-foreground** = `#33ff45` (idx 0, bright phosphor green)

## Color Mapping

| Slot | Hex | Source | Meaning |
|---|---|---|---|
| background | `#000801` | Cmd3, base idx 1 | Near-black with green tint |
| foreground | `#33ff45` | Cmd4, base idx 0 | Bright Matrix phosphor green |
| cursor-color | `#33ff45` | Cmd4, base idx 0 | Same as foreground |
| selection-bg | `#05260e` | Cmd3, base idx 5 | Dark green overlay |
| selection-fg | `#33ff45` | Cmd4, base idx 0 | Same as foreground |
| 0 (black) | `#000000` | Cmd1, base idx 0 | Pure black |
| 1 (red) | `#8e1c22` | Cmd2, shift:225 idx 3 | Dark red |
| 2 (green) | `#1c8e33` | Cmd1, base idx 3 | Medium green |
| 3 (yellow) | `#8e881c` | Cmd2, shift:285 idx 3 | Olive/yellow |
| 4 (blue) | `#1c3e8e` | Cmd2, square-1 idx 3 | Deep blue |
| 5 (magenta) | `#8e1c77` | Cmd1, complementary idx 3 | Dark magenta |
| 6 (cyan) | `#1c8e6c` | Cmd1, shift:30 idx 3 | Teal cyan |
| 7 (white) | `#bad3c2` | Cmd1, base idx 7 | Pale green-gray |
| 8 (bright black) | `#0d651b` | Cmd1, base idx 2 | Dark green "gray" |
| 9 (bright red) | `#b03234` | Cmd2, shift:225 idx 4 | Bright red |
| 10 (bright green) | `#32b050` | Cmd1, base idx 4 | Bright green |
| 11 (bright yellow) | `#b0ae32` | Cmd2, shift:285 idx 4 | Bright yellow |
| 12 (bright blue) | `#3253b0` | Cmd2, square-1 idx 4 | Bright blue |
| 13 (bright magenta) | `#b03293` | Cmd1, complementary idx 4 | Bright magenta |
| 14 (bright cyan) | `#32b08f` | Cmd1, shift:30 idx 4 | Bright teal |
| 15 (bright white) | `#e0e6e2` | Cmd1, base idx 8 | Near-white with green tint |

**Design principle**: Normal colors (1–6) all use ramp index 3 (medium-dark), bright colors (9–14) use index 4 (medium-bright), ensuring consistent luminance within each tier. Black/white variants pull from the base green ramp so even "neutral" colors carry the Matrix green DNA.

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: Uses rampa harmony flags well and explains color mapping, but fails to run `rampa --help` first as explicitly required, doesn't show actual rampa command output to prove colors are sourced from it, the response is truncated cutting off the table, and the final theme file content is not shown inline.

---

## Model: GPT-5.2 Codex (`gpt-5.2-codex`)

### Response

<details>
<summary>Full model response</summary>

Commands used (why in parentheses), color picks, theme content, tests, and artifacts are below.  
**Rampa commands (full):**
- `PATH="/Users/ismael/Developer/rampa-studio/cli/dist:$PATH" rampa --help` (discover available commands/flags)
- `PATH="/Users/ismael/Developer/rampa-studio/cli/dist:$PATH" rampa -C "lime" --size=8 --lightness 0:100 --saturation 100:0 --hue 0:0 --add=complementary --add=triadic --add=square -O json --no-preview > /Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/ghostty-matrix-theme/output-gpt-5.2-codex/rampa-output.json` (single harmony run from Matrix-green base; all colors sourced here)

**Color picks from rampa-output.json:**
- background = #000000 (base.colors[0])  
- foreground = #00ff00 (base.baseColor)  
- cursor-color = #00ff00 (base.baseColor)  
- selection-background = #054405 (base.colors[1])  
- selection-foreground = #d5e0d5 (base.colors[6])  
- palette 0 = #000000 (base.colors[0])  
- palette 1 = #ac2f2f (triadic-2.colors[3])  
- palette 2 = #2fac2f (base.colors[3])  
- palette 3 = #ac6e2f (square-3.colors[3])  
- palette 4 = #2f2fac (triadic-1.colors[3])  
- palette 5 = #ac2fac (complementary.colors[3])  
- palette 6 = #2f6dac (square-1.colors[3])  
- palette 7 = #d5e0d5 (base.colors[6])  
- palette 8 = #054405 (base.colors[1])  
- palette 9 = #c16363 (triadic-2.colors[4])  
- palette 10 = #00ff00 (base.baseColor)  
- palette 11 = #c19263 (square-3.colors[4])  
- palette 12 = #6363c1 (triadic-1.colors[4])  
- palette 13 = #c163c1 (complementary.colors[4])  
- palette 14 = #a1b6cb (square-1.colors[5])  
- palette 15 = #ffffff (base.colors[7])  

**Ghostty theme file (complete):**
```
background = #000000
foreground = #00ff00
cursor-color = #00ff00
selection-background = #054405
selection-foreground = #d5e0d5
palette = 0=#000000
palette = 1=#ac2f2f
palette = 2=#2fac2f
palette = 3=#ac6e2f
palette = 4=#2f2fac
palette = 5=#ac2fac
palette = 6=#2f6dac
palette = 7=#d5e0d5
palette = 8=#054405
palette = 9=#c16363
palette = 10=#00ff00
palette = 11=#c19263
palette = 12=#6363c1
palette = 13=#c163c1
palette = 14=#a1b6cb
palette = 15=#ffffff
```

**Tests:** `bun test`  
**Artifacts created:**  
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/ghostty-matrix-theme/output-gpt-5.2-codex/ghostty-matrix.theme`  
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/ghostty-matrix-theme/output-gpt-5.2-codex/rampa-output.json`

</details>

### Score

- **Judge Score**: 5/5
- **Judge Notes**: Excellent response: single efficient rampa command with complementary+triadic+square harmonies, all 21 theme colors verified present in rampa JSON output, complete Ghostty theme with clear source mapping for every color slot.

---

## Model: Gemini 3 Pro (`gemini-3-pro-preview`)

### Response

<details>
<summary>Full model response</summary>

I have generated the Matrix-inspired Ghostty theme using `rampa`'s color harmony and scale generation capabilities.

### Rampa Command & Reasoning

I used a single `rampa` command to generate the entire palette derived from the Matrix Green (`#00FF41`). I used the `--add=shift:N` flags to create mathematically related ramps around the hue circle for the ANSI colors (Red, Yellow, Blue, Magenta, Cyan) while maintaining the same lightness/saturation curves as the base green.

```bash
bun run src/index.ts -C "#00FF41" --size 10 \
  --add=shift:60   \
  --add=shift:120  \
  --add=shift:180  \
  --add=shift:240  \
  --add=shift:300  \
  --format hex --output json
```

**Color Selection Logic:**
*   **Base Ramp (Green)**: Used for UI elements and Green/Black/White slots.
    *   **Background**: Index 0 (`#000000`) - Pure black.
    *   **Foreground**: Index 6 (`#8ec69f`) - Readable light green phosphor.
    *   **Cursor**: Index 4 (`#32b050`) - Vibrant mid-tone green.
    *   **Selection**: Index 2 (`#0d651b`) for background (subtle) and Index 9 (`#ffffff`) for text.
*   **ANSI Colors**: Mapped shifted hues to ANSI slots (Normal = Index 4, Bright = Index 5/High).
    *   **Red**: Shift-240 (Index 4 `#b05032`, Index 5 `#c0775b`)
    *   **Green**: Base Ramp (Index 4 `#32b050`, Index 5 `#5bc077`)
    *   **Yellow**: Shift-300 (Index 4 `#93b032`, Index 5 `#a4c05b`)
    *   **Blue**: Shift-120 (Index 4 `#5032b0`, Index 5 `#775bc0`)
    *   **Magenta**: Shift-180 (Index 4 `#b03293`, Index 5 `#c05ba4`)
    *   **Cyan**: Shift-60 (Index 4 `#3293b0`, Index 5 `#5ba4c0`)
    *   **Blacks**: Base Ramp Index 1 (`#033609`) and Index 3 (`#1c8e33`) for a deep green "black".
    *   **Whites**: Base Ramp Index 7 (`#bad3c2`) and Index 8 (`#e0e6e2`) for a pale green "white".

### Generated Artifacts

**Theme File**: `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/ghostty-matrix-theme/output-gemini-3-pro-preview/matrix.ghostty`

### Final Ghostty Theme

```ini
background = #000000
foreground = #8ec69f
cursor-color = #32b050
selection-background = #0d651b
selection-foreground = #ffffff
palette = 0=#033609
palette = 1=#b05032
palette = 2=#32b050
palette = 3=#93b032
palette = 4=#5032b0
palette = 5=#b03293
palette = 6=#3293b0
palette = 7=#bad3c2
palette = 8=#1c8e33
palette = 9=#c0775b
palette = 10=#5bc077
palette = 11=#a4c05b
palette = 12=#775bc0
palette = 13=#c05ba4
palette = 14=#5ba4c0
palette = 15=#e0e6e2
```

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: Shows a reasonable approach with efficient shift-based harmony flags and clear explanation, but never demonstrates running `rampa --help` first as required, doesn't show actual rampa command output to prove colors were sourced from it (colors appear plausible but unverified), and uses potentially invalid flags like `-C` and `--output json` suggesting the commands may not have been actually executed.
