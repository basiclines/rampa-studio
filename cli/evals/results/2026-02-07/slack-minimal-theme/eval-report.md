# Eval: slack-minimal-theme

- **Date**: 2026-02-07T21:29:46.831Z
- **Rampa Version**: 1.1.3
- **Prompt**: slack-minimal-theme

## Prompt

````
Create a clean, modern, minimal Slack sidebar theme using rampa-cli.

## Requirements

1. **Discover rampa first**: Run `rampa --help` to understand all available commands and flags before generating any colors.

2. **Every color must come from rampa output**: Do not invent or hardcode hex codes. Every color value in the final theme must be a direct output from a rampa command.

3. **Use mathematical color combinations**: Use rampa's built-in harmony flags (`--add=complementary`, `--add=triadic`, `--add=square`, `--add=shift:N`, etc.) to generate mathematically related color palettes. Avoid running many separate rampa commands to get ad-hoc colors.

4. **Efficient command usage**: Prefer fewer rampa commands with `--add` flags to generate multiple related ramps at once, rather than running rampa many times with different base colors.

5. **Design intent**: The theme should feel clean, airy, and minimal — think modern SaaS design. Use a neutral/cool base (light gray, soft white, or muted blue-gray) with a single accent color for active states and badges. High contrast for readability. No bright or saturated backgrounds.

## Slack Theme Format

Slack custom themes are 10 comma-separated hex values pasted into Preferences > Themes > Custom:

~~~
#COLUMN_BG,#MENU_BG_HOVER,#ACTIVE_ITEM,#ACTIVE_ITEM_TEXT,#HOVER_ITEM_BG,#TEXT_COLOR,#MENTION_BADGE,#MENTION_BADGE_TEXT,#TOP_NAV_BG,#TOP_NAV_TEXT
~~~

What each value controls:
1. **Column BG** — sidebar background color
2. **Menu BG Hover** — background when hovering menu items
3. **Active Item** — background of the selected/active channel
4. **Active Item Text** — text color of the active channel
5. **Hover Item BG** — background when hovering a channel
6. **Text Color** — default sidebar text color
7. **Mention Badge** — notification badge background
8. **Mention Badge Text** — notification badge text color (typically use a contrasting light/dark)
9. **Top Nav BG** — top navigation bar background
10. **Top Nav Text** — top navigation bar text color

Example (Slack's default Aubergine):
~~~
#3F0E40,#350D36,#1164A3,#FFFFFF,#350D36,#FFFFFF,#2BAC76,#CD2553,#350d36,#FFFFFF
~~~

## Deliverable

Output the complete Slack theme as a single comma-separated line ready to paste into Slack. Show the rampa commands you used and explain which output colors you picked for each of the 10 theme slots.
````

---

## Model: Claude Opus 4.6 (`claude-opus-4.6`)

### Response

<details>
<summary>Full model response</summary>

## Rampa Commands Used

**Command 1 — Neutral backgrounds & text:**
```bash
rampa -C "#64748B" --size=10 -L 5:97 -S 15:3 --add=complementary -O json --no-preview
```
Cool slate gray base, very low saturation → clean neutral grays from near-black to near-white.

**Command 2 — Blue accent + coral badge:**
```bash
rampa -C "#4F7CAC" --size=8 -L 20:95 -S 60:20 --add=shift:150 -O json --no-preview
```
Steel blue for active states + `shift:150` generates a mathematically related warm coral for notification badges.

## Color Mapping

| Slot | Purpose | Hex | Source |
|------|---------|-----|--------|
| 1 | Column BG | `#f7f7f8` | Neutral ramp [9] |
| 2 | Menu BG Hover | `#cdd4e1` | Blue ramp [6] |
| 3 | Active Item | `#245779` | Blue ramp [1] |
| 4 | Active Item Text | `#f0f1f5` | Blue ramp [7] |
| 5 | Hover Item BG | `#cdd4e1` | Blue ramp [6] |
| 6 | Text Color | `#394149` | Neutral ramp [2] |
| 7 | Mention Badge | `#b95151` | Coral ramp [3] |
| 8 | Mention Badge Text | `#f5f1f0` | Coral ramp [7] |
| 9 | Top Nav BG | `#f7f7f8` | Neutral ramp [9] |
| 10 | Top Nav Text | `#22272c` | Neutral ramp [1] |

## Final Theme (paste into Slack)

```
#f7f7f8,#cdd4e1,#245779,#f0f1f5,#cdd4e1,#394149,#b95151,#f5f1f0,#f7f7f8,#22272c
```

## Artifacts

- `/cli/evals/results/2026-02-07/slack-minimal-theme/output-claude-opus-4.6/theme.md` — full writeup
- `/cli/evals/results/2026-02-07/slack-minimal-theme/output-claude-opus-4.6/theme.txt` — paste-ready theme string

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: Good structure and design intent with proper use of --add harmony flags and correct Slack format, but fails requirement 1 (no rampa --help discovery shown) and provides no evidence the hex values are actual rampa outputs rather than fabricated, making requirement 2 unverifiable.

---

## Model: GPT-5.2 Codex (`gpt-5.2-codex`)

### Response

<details>
<summary>Full model response</summary>

Commands: `./dist/rampa --help` to discover flags, then `./dist/rampa -C "#64748B" --size=7 -L 96:30 -S 28:6 --add=complementary --add=triadic --no-preview` to generate a cool-neutral base plus mathematically related harmony ramps in one pass.  
Selected colors from that output: Column BG #f2f5f8 (base1), Menu BG Hover #cfd9e2 (base2), Active Item #809574 (triadic-2-5 accent), Active Item Text #f5f8f2 (triadic-2-1), Hover Item BG #afbcca (base3), Text Color #484a51 (base7), Mention Badge #809574 (same accent), Mention Badge Text #f5f8f2 (triadic-2-1), Top Nav BG #cfd9e2 (base2), Top Nav Text #484a51 (base7).  
Artifacts: `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/slack-minimal-theme/output-gpt-5.2-codex/rampa-output.txt` and `.../slack-theme.txt`; final theme line: `#f2f5f8,#cfd9e2,#809574,#f5f8f2,#afbcca,#484a51,#809574,#f5f8f2,#cfd9e2,#484a51`; tests: `bun test` (pre/post).

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: Meets core requirements (help discovery, harmony flags, single efficient command, colors labeled with ramp positions), but the explanation is overly compressed making it hard to verify color provenance, reusing the same muted sage accent for both Active Item and Mention Badge is a UX weakness, and the overall design leans earthy rather than the requested 'modern SaaS' aesthetic.

---

## Model: Gemini 3 Pro (`gemini-3-pro-preview`)

### Response

<details>
<summary>Full model response</summary>

Here is a clean, minimal Slack sidebar theme generated with `rampa-cli`.

`#fcfcfd,#e5e6eb,#4747bb,#fcfcfd,#e5e6eb,#140c50,#a56f33,#fcfcfd,#fcfcfd,#140c50`

### Rampa Command

I used a single command to generate a base Indigo ramp (for the cool neutral background and primary actions) and a Split Complementary harmony (to find a mathematically balanced orange for the mention badge).

```bash
rampa --color "#6366F1" --size 12 --lightness 99:10 --saturation 5:80 --add=split-complementary --format hex
```

**Why this command?**
*   `--color "#6366F1"`: Starts with a modern Indigo brand color.
*   `--lightness 99:10`: Creates a full range from nearly white (L99) to deep dark (L10).
*   `--saturation 5:80`: Ensures the light colors are neutral/greyish (S5) for a clean background, while the dark/mid colors are rich and vibrant (S80) for text and active states.
*   `--add=split-complementary`: Mathematically calculates the perfect contrasting accent colors (Orange/Green) without guessing.

### Color Selection

I mapped the output colors to the Slack theme slots as follows:

| Slot | Color | Rampa Source | Reason |
| :--- | :--- | :--- | :--- |
| **Column BG** | `#fcfcfd` | Base Ramp [0] | A very light, cool white (L99, S5) for an airy feel. |
| **Menu BG Hover** | `#e5e6eb` | Base Ramp [1] | A subtle cool gray for interaction feedback. |
| **Active Item** | `#4747bb` | Base Ramp [6] | Mid-range Indigo (S~45) for the primary active state. |
| **Active Text** | `#fcfcfd` | Base Ramp [0] | White text on the Indigo background for high contrast. |
| **Hover Item** | `#e5e6eb` | Base Ramp [1] | Matches the menu hover for consistency. |
| **Text Color** | `#140c50` | Base Ramp [10] | Deep Indigo (almost black) for sharp readability. |
| **Mention Badge** | `#a56f33` | Split-1 Ramp [7] | A Bronze/Orange from the complementary ramp for notifications. |
| **Badge Text** | `#fcfcfd` | Base Ramp [0] | White text on the orange badge. |
| **Top Nav BG** | `#fcfcfd` | Base Ramp [0] | Matches sidebar for a seamless, minimal look. |
| **Top Nav Text** | `#140c50` | Base Ramp [10] | Matches sidebar text. |

**Output File Created:**
`/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/slack-minimal-theme/output-gemini-3-pro-preview/theme.txt`

</details>

### Score

- **Judge Score**: 4/5
- **Judge Notes**: All colors verified from actual rampa output, single efficient command with split-complementary harmony, good design rationale and clear mapping; minor deduction for not explicitly showing `rampa --help` was run first (requirement 1) and the response reads more like a pre-composed answer than a step-by-step discovery process.
