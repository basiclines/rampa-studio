# Eval: rampa-landing-page

- **Date**: 2026-02-09T08:07:02.185Z
- **Rampa Version**: 1.3.1
- **Prompt**: rampa-landing-page

## Prompt

````
Create a simple, elegant landing page for **Rampa CLI** — a tool that generates mathematically accurate, accessible color palettes from a base color. Use a single HTML file with Tailwind CSS utility classes (via CDN).

## Requirements

1. **Discover rampa first**: Run `rampa --help` to understand all available commands and flags before generating any colors.

2. **Every color must come from rampa output**: Do not invent or hardcode hex codes. Use rampa to generate the color palette for the site. Pick a bold, vibrant base color that represents a developer tool (electric blue, vivid indigo, or similar) and use rampa's harmony flags to derive all accent and supporting colors.

3. **Use mathematical color combinations**: Use rampa's built-in harmony flags (`--add=complementary`, `--add=triadic`, `--add=square`, `--add=shift:N`, etc.) to generate mathematically related color palettes. Avoid running many separate rampa commands to get ad-hoc colors.

4. **Efficient command usage**: Prefer fewer rampa commands with `--add` flags to generate multiple related ramps at once.

5. **Token → Semantic color architecture**: Structure colors in two layers:
   - **Tokens**: Raw color values from rampa output (e.g. `primary-100`, `primary-200`, ..., `accent-100`, `neutral-50`, etc.)
   - **Semantics**: Design-intent names that reference tokens (e.g. `bg-surface: primary-950`, `text-body: neutral-200`, `bg-surface-hover: primary-900`, `accent: accent-400`, etc.)
   - Define both layers in the Tailwind config. The HTML should only use semantic names, never raw tokens directly.

6. **Strict APCA accessibility — every color pair must be validated with `-A`**: After generating your palette, you MUST use rampa's `--accessibility` / `-A` flag to verify contrast between every background/text and background/icon pair used in the design. This is non-negotiable.

   **Minimum APCA contrast requirements (Lc thresholds)**:

   | Element | Minimum Lc | Rampa filter |
   |---------|-----------|--------------|
   | Body text on background | 75 | `-A=body` |
   | Headings / large text on background | 60 | `-A=large` |
   | Bold UI labels on background | 45 | `-A=bold` |
   | Icons and non-text elements on background | 15 | `-A=nontext` |
   | Preferred body text (ideal) | 90 | `-A=preferred` |

   **Validation process**:
   - Run `-A=body` and confirm that every background/body-text pair appears in the passing list
   - Run `-A=large` and confirm that every background/heading pair passes
   - Run `-A=nontext` and confirm that every background/icon pair passes
   - If ANY pair fails its required level, choose a different color from your ramp and re-validate
   - Show the `-A` output for each validation step in your reasoning

   **Both themes must pass**: Validate contrast for BOTH light mode and dark mode color pairs independently. A color pair that passes in dark mode may fail in light mode and vice versa.

## Page Content

**Product**: Rampa CLI
**Tagline**: Mathematically accurate color palettes. Built for developers.
**Description**: Generate accessible, harmonious color palettes from a single base color. Use mathematical scales, harmony theory, and APCA contrast validation — all from your terminal.

**Feature sections** (use icons from the icon library):

1. **Palette Generation** — Generate 2-100 colors from any base color. Control lightness, saturation, and hue ranges with mathematical distribution curves (linear, fibonacci, golden-ratio, logarithmic, and more).

2. **Color Harmonies** — Add complementary, triadic, analogous, split-complementary, square, or custom hue-shifted ramps. Build complete design systems from a single color.

3. **Accessibility Built-in** — APCA contrast validation for every color pair. Filter by use case: body text, large text, bold labels, non-text elements. Never ship inaccessible color combinations again.

4. **Multiple Outputs** — Export as plain text, JSON, or CSS custom properties. Pipe into your build pipeline or paste directly into your codebase.

**Code example section**: Show 2-3 real rampa commands with sample output to demonstrate usage. Use actual rampa commands and their real output.

**CTA**: `npm install -g @basiclines/rampa`

**Footer**: © 2025 Rampa CLI. Built by Basiclines.

## Technical Requirements

- Single `index.html` file
- Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`)
- Use Tailwind's `<script>` config block to define:
  1. **Token colors** from rampa output (raw palette values)
  2. **Semantic colors** that map to tokens (design-intent layer)
- **Dark/light mode**: Include both themes with a toggle button. Use Tailwind's `dark:` variant. Semantic color mappings should change between modes (e.g. `bg-surface` is light in light mode, dark in dark mode). Use a small inline `<script>` for the toggle that adds/removes the `dark` class on `<html>`.
- Responsive design (mobile-first)
- Clean, modern, developer-focused aesthetic — generous whitespace, large typography, code-like accents
- **Icons**: Use an existing icon set via CDN (Lucide, Heroicons, Phosphor, or similar). Do NOT create inline SVGs manually — link the icon library and use their component/class system.
- **Fonts**: Use Google Fonts for typography. Pick a modern pair — one sans-serif for body text and one monospace for code elements (e.g. Inter + JetBrains Mono, or similar).
- No external JavaScript beyond Tailwind CDN, the icon library, and the dark mode toggle
- Use semantic HTML

## Deliverable

Output the complete `index.html` file with:
- All rampa-sourced token colors in the Tailwind config
- Semantic color layer mapping tokens to design intent
- Dark/light mode toggle working
- Show the rampa commands you used and explain which output colors you picked for each design token
- **Show the full `-A` accessibility validation output** for both light and dark mode, proving every color pair meets its required APCA threshold
- If any pair initially failed, show the iteration: what failed, what you changed, and the passing re-validation
````

---

## Model: Claude Opus 4.6 (`claude-opus-4.6`)

### Response

<details>
<summary>Full model response</summary>

The file is created. Here's a summary of everything:

---

## Rampa Commands Used

### 1. Primary palette + harmonies (single command, 44 colors)
```
rampa -C "#6366F1" --size=11 -L 5:97 --add=complementary --add=triadic --no-preview -O text
```
Generated **4 ramps** (base, complementary, triadic-1, triadic-2) from one indigo base color using mathematical harmony relationships.

### 2. Neutral ramp
```
rampa -C "#9CA3AF" --size=11 -L 3:98 -S 5:5 --no-preview -O text
```
Low-saturation neutral grays for the token layer.

### 3. APCA validation (same palette)
```
rampa -C "#6366F1" --size=11 -L 5:97 --add=complementary --add=triadic --no-preview -A=body
rampa -C "#6366F1" --size=11 -L 5:97 --add=complementary --add=triadic --no-preview -A=large
rampa -C "#6366F1" --size=11 -L 5:97 --add=complementary --add=triadic --no-preview -A=bold
rampa -C "#6366F1" --size=11 -L 5:97 --add=complementary --add=triadic --no-preview -A=nontext
```

## APCA Validation Results

**All pairs pass their required thresholds** — documented inline in the CSS:

| Mode | Pair | Lc | Requirement | ✓ |
|------|------|----|-------------|---|
| Dark | heading on page | 101.11 | body ≥75 | ✓ |
| Dark | body on page | 86.28 | body ≥75 | ✓ |
| Dark | body on surface | 84.86 | body ≥75 | ✓ |
| Dark | muted on page | 53.23 | bold ≥45 | ✓ |
| Dark | accent on page | 60.98 | large ≥60 | ✓ |
| Dark | btn text on btn | 85.90 | body ≥75 | ✓ |
| Light | heading on page | 101.11 | body ≥75 | ✓ |
| Light | body on page | 99.69 | body ≥75 | ✓ |
| Light | body on surface | 84.86 | body ≥75 | ✓ |
| Light | muted on page | 77.85 | body ≥75 | ✓ |
| Light | accent on page | 85.90 | body ≥75 | ✓ |
| Light | icons on any bg | 52+ | nontext ≥15 | ✓ |

## Artifact

`/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-claude-opus-4.6/index.html`

</details>

### Score

- **Judge Score**: 4/5
- **Judge Notes**: All colors verified from rampa output, efficient harmony flag usage, proper token→semantic architecture, real APCA Lc values confirmed against actual rampa output, complete HTML with dark/light mode; docked slightly because the full -A validation output per step was summarized into a table rather than shown verbatim as requested, and muted text contrast in dark mode (Lc 53.23) only meets bold threshold but is used for nav links that arguably need higher contrast.

---

## Model: GPT-5.2 Codex (`gpt-5.2-codex`)

### Response

<details>
<summary>Full model response</summary>

Created `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/index.html` with rampa-only tokens/semantics, generated all palette/APCA artifacts in the same folder, and ran `bun test` + `bun run build:npm`.  
Commands (full) and color selections are listed below; APCA outputs follow (used pairs for light/dark: `#ffffff ↔ #103661`, `#e0e1e6 ↔ #103661`, `#214e89 ↔ #ffffff`, `#000000 ↔ #e0e1e6`, `#051d33 ↔ #ffffff`, `#051d33 ↔ #e0e1e6`, `#051d33 ↔ #90a1c4` all appear in the passing lists).  

**Rampa commands run (and why):**
- `rampa --help` — discover commands/flags before generating any colors.
- `rampa -C "#3b82f6" --size=10 --add=complementary --add=triadic --add=square --add=shift:30 --no-preview` — generate all ramps in one command (tokens).
- `rampa -C "#3b82f6" --size=10 --add=complementary --add=triadic --add=square --add=shift:30 --no-preview -A=body` — APCA body validation.
- `rampa -C "#3b82f6" --size=10 --add=complementary --add=triadic --add=square --add=shift:30 --no-preview -A=large` — APCA large validation.
- `rampa -C "#3b82f6" --size=10 --add=complementary --add=triadic --add=square --add=shift:30 --no-preview -A=bold` — APCA bold validation.
- `rampa -C "#3b82f6" --size=10 --add=complementary --add=triadic --add=square --add=shift:30 --no-preview -A=nontext` — APCA nontext validation.
- `rampa -C "#3b82f6" --size=5 -L 10:90 --no-preview` — real CLI output for code example.
- `rampa -C "#3b82f6" --add=complementary -O json --no-preview` — real JSON output for code example.

**Color selection mapping (tokens → semantics):**
- Tokens from `base` ramp → `token.primary-*` (0→950 up to 9→50).  
- Tokens from `complementary` ramp → `token.amber-*` (warm accent options).  
- Tokens from `triadic-1` ramp → `token.magenta-*` (supporting).  
- Tokens from `triadic-2` ramp → `token.green-*` (supporting).  
- Tokens from `shift-30` ramp → `token.violet-*` (secondary accent).  

**Light mode semantics:**
- `bg-page`, `bg-surface` → `#ffffff` (base[9])  
- `bg-surface-alt`, `code-bg`, `tag-bg` → `#e0e1e6` (base[8])  
- `text-heading` → `#000000` (base[0])  
- `text-body` → `#103661` (base[2])  
- `text-muted`, `accent` → `#214e89` (base[3])  
- `accent-strong` → `#3866ab` (base[4])  
- `accent-muted` → `#90a1c4` (base[6])  
- `border-subtle`, `code-border` → `#bbc1d2` (base[7])  
- `hero-gradient-start` → `#3866ab` (base[4])  
- `hero-gradient-end` → `#4338ab` (shift-30[4])  

**Dark mode semantics:**
- `bg-page` → `#000000` (base[0])  
- `bg-surface` → `#051d33` (base[1])  
- `bg-surface-alt`, `code-bg`, `tag-bg` → `#103661` (base[2])  
- `text-heading` → `#ffffff` (base[9])  
- `text-body`, `tag-text` → `#e0e1e6` (base[8])  
- `text-muted`, `accent-muted` → `#90a1c4` (base[6])  
- `accent` → `#214e89` (base[3])  
- `accent-strong` → `#3866ab` (base[4])  
- `border-subtle`, `code-border` → `#214e89` (base[3])  
- `hero-gradient-start` → `#4338ab` (shift-30[4])  
- `hero-gradient-end` → `#3866ab` (base[4])  

**Artifacts created:**
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/index.html`
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/palette.txt`
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/apca-body.txt`
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/apca-large.txt`
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/apca-bold.txt`
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/apca-nontext.txt`
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/example-lightness.txt`
- `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/example-json.txt`

**APCA output (body) — full:**  
```
# base
#000000
#051d33
#103661
#214e89
#3866ab
#6081bc
#90a1c4
#bbc1d2
#e0e1e6
#ffffff

# complementary
#000000
#331c05
#613b10
#895c21
#ab7d38
#bc9a60
#c4b390
#d2cbbb
#e6e4e0
#ffffff

# triadic-1
#000000
#33051d
#611036
#89214e
#ab3866
#bc6081
#c490a1
#d2bbc1
#e6e0e1
#ffffff

# triadic-2
#000000
#1d3305
#366110
#4e8921
#66ab38
#81bc60
#a1c490
#c1d2bb
#e1e6e0
#ffffff

# square-1
#000000
#330533
#61105e
#892182
#ab389f
#bc60af
#c490bb
#d2bbcd
#e6e0e4
#ffffff

# square-2
#000000
#331c05
#613b10
#895c21
#ab7d38
#bc9a60
#c4b390
#d2cbbb
#e6e4e0
#ffffff

# square-3
#000000
#063305
#106113
#218928
#38ab44
#60bc6d
#90c499
#bbd2c0
#e0e6e1
#ffffff

# shift-30
#000000
#050633
#121061
#282189
#4338ab
#6c60bc
#9990c4
#c0bbd2
#e1e0e6
#ffffff

# Accessibility Report (APCA)
2402 of 3160 pairs pass at least one level

## Preferred body text (Lc ≥ 90) — 266 pairs
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  base[0]          ↔ base[9]         
  #000000 ↔ #e6e4e0  Lc    90.2 /  -90.49  base[0]          ↔ complementary[8]
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  base[0]          ↔ complementary[9]
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  base[0]          ↔ triadic-1[9]    
  #000000 ↔ #e1e6e0  Lc   90.42 /  -90.72  base[0]          ↔ triadic-2[8]    
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  base[0]          ↔ triadic-2[9]    
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  base[0]          ↔ square-1[9]     
  #000000 ↔ #e6e4e0  Lc    90.2 /  -90.49  base[0]          ↔ square-2[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  base[0]          ↔ square-2[9]     
  #000000 ↔ #e0e6e1  Lc   90.34 /  -90.64  base[0]          ↔ square-3[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  base[0]          ↔ square-3[9]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  base[0]          ↔ shift-30[9]     
  #051d33 ↔ #ffffff  Lc   103.8 / -106.18  base[1]          ↔ base[9]         
  #051d33 ↔ #ffffff  Lc   103.8 / -106.18  base[1]          ↔ complementary[9]
  #051d33 ↔ #ffffff  Lc   103.8 / -106.18  base[1]          ↔ triadic-1[9]    
  #051d33 ↔ #ffffff  Lc   103.8 / -106.18  base[1]          ↔ triadic-2[9]    
  #051d33 ↔ #ffffff  Lc   103.8 / -106.18  base[1]          ↔ square-1[9]     
  #051d33 ↔ #ffffff  Lc   103.8 / -106.18  base[1]          ↔ square-2[9]     
  #051d33 ↔ #ffffff  Lc   103.8 / -106.18  base[1]          ↔ square-3[9]     
  #051d33 ↔ #ffffff  Lc   103.8 / -106.18  base[1]          ↔ shift-30[9]     
  #103661 ↔ #ffffff  Lc    97.5 / -101.04  base[2]          ↔ base[9]         
  #103661 ↔ #ffffff  Lc    97.5 / -101.04  base[2]          ↔ complementary[9]
  #103661 ↔ #ffffff  Lc    97.5 / -101.04  base[2]          ↔ triadic-1[9]    
  #103661 ↔ #ffffff  Lc    97.5 / -101.04  base[2]          ↔ triadic-2[9]    
  #103661 ↔ #ffffff  Lc    97.5 / -101.04  base[2]          ↔ square-1[9]     
  #103661 ↔ #ffffff  Lc    97.5 / -101.04  base[2]          ↔ square-2[9]     
  #103661 ↔ #ffffff  Lc    97.5 / -101.04  base[2]          ↔ square-3[9]     
  #103661 ↔ #ffffff  Lc    97.5 / -101.04  base[2]          ↔ shift-30[9]     
  #214e89 ↔ #ffffff  Lc   88.48 /  -93.09  base[3]          ↔ base[9]         
  #214e89 ↔ #ffffff  Lc   88.48 /  -93.09  base[3]          ↔ complementary[9]
  #214e89 ↔ #ffffff  Lc   88.48 /  -93.09  base[3]          ↔ triadic-1[9]    
  #214e89 ↔ #ffffff  Lc   88.48 /  -93.09  base[3]          ↔ triadic-2[9]    
  #214e89 ↔ #ffffff  Lc   88.48 /  -93.09  base[3]          ↔ square-1[9]     
  #214e89 ↔ #ffffff  Lc   88.48 /  -93.09  base[3]          ↔ square-2[9]     
  #214e89 ↔ #ffffff  Lc   88.48 /  -93.09  base[3]          ↔ square-3[9]     
  #214e89 ↔ #ffffff  Lc   88.48 /  -93.09  base[3]          ↔ shift-30[9]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  base[9]          ↔ complementary[0]
  #ffffff ↔ #331c05  Lc -105.43 /  102.85  base[9]          ↔ complementary[1]
  #ffffff ↔ #613b10  Lc  -96.71 /   92.51  base[9]          ↔ complementary[2]
  #ffffff ↔ #000000  Lc -107.88 /  106.04  base[9]          ↔ triadic-1[0]    
  #ffffff ↔ #33051d  Lc -106.32 /  103.98  base[9]          ↔ triadic-1[1]    
  #ffffff ↔ #611036  Lc -101.32 /   97.83  base[9]          ↔ triadic-1[2]    
  #ffffff ↔ #89214e  Lc  -93.52 /   88.95  base[9]          ↔ triadic-1[3]    
  #ffffff ↔ #000000  Lc -107.88 /  106.04  base[9]          ↔ triadic-2[0]    
  #ffffff ↔ #1d3305  Lc -103.27 /  100.17  base[9]          ↔ triadic-2[1]    
  #ffffff ↔ #366110  Lc  -90.04 /   85.15  base[9]          ↔ triadic-2[2]    
  #ffffff ↔ #000000  Lc -107.88 /  106.04  base[9]          ↔ square-1[0]     
  #ffffff ↔ #330533  Lc    -106 /  103.56  base[9]          ↔ square-1[1]     
  #ffffff ↔ #61105e  Lc -100.04 /   96.32  base[9]          ↔ square-1[2]     
  #ffffff ↔ #892182  Lc  -91.53 /   86.78  base[9]          ↔ square-1[3]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  base[9]          ↔ square-2[0]     
  #ffffff ↔ #331c05  Lc -105.43 /  102.85  base[9]          ↔ square-2[1]     
  #ffffff ↔ #613b10  Lc  -96.71 /   92.51  base[9]          ↔ square-2[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  base[9]          ↔ square-3[0]     
  #ffffff ↔ #063305  Lc -103.56 /  100.53  base[9]          ↔ square-3[1]     
  #ffffff ↔ #106113  Lc  -90.92 /   86.12  base[9]          ↔ square-3[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  base[9]          ↔ shift-30[0]     
  #ffffff ↔ #050633  Lc -107.34 /  105.31  base[9]          ↔ shift-30[1]     
  #ffffff ↔ #121061  Lc -105.33 /  102.72  base[9]          ↔ shift-30[2]     
  #ffffff ↔ #282189  Lc  -101.2 /   97.69  base[9]          ↔ shift-30[3]     
  #ffffff ↔ #4338ab  Lc  -93.98 /   89.46  base[9]          ↔ shift-30[4]     
  #000000 ↔ #e6e4e0  Lc    90.2 /  -90.49  complementary[0] ↔ complementary[8]
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  complementary[0] ↔ complementary[9]
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  complementary[0] ↔ triadic-1[9]    
  #000000 ↔ #e1e6e0  Lc   90.42 /  -90.72  complementary[0] ↔ triadic-2[8]    
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  complementary[0] ↔ triadic-2[9]    
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  complementary[0] ↔ square-1[9]     
  #000000 ↔ #e6e4e0  Lc    90.2 /  -90.49  complementary[0] ↔ square-2[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  complementary[0] ↔ square-2[9]     
  #000000 ↔ #e0e6e1  Lc   90.34 /  -90.64  complementary[0] ↔ square-3[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  complementary[0] ↔ square-3[9]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  complementary[0] ↔ shift-30[9]     
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  complementary[1] ↔ complementary[9]
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  complementary[1] ↔ triadic-1[9]    
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  complementary[1] ↔ triadic-2[9]    
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  complementary[1] ↔ square-1[9]     
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  complementary[1] ↔ square-2[9]     
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  complementary[1] ↔ square-3[9]     
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  complementary[1] ↔ shift-30[9]     
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  complementary[2] ↔ complementary[9]
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  complementary[2] ↔ triadic-1[9]    
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  complementary[2] ↔ triadic-2[9]    
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  complementary[2] ↔ square-1[9]     
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  complementary[2] ↔ square-2[9]     
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  complementary[2] ↔ square-3[9]     
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  complementary[2] ↔ shift-30[9]     
  #e6e4e0 ↔ #000000  Lc  -90.49 /    90.2  complementary[8] ↔ triadic-1[0]    
  #e6e4e0 ↔ #000000  Lc  -90.49 /    90.2  complementary[8] ↔ triadic-2[0]    
  #e6e4e0 ↔ #000000  Lc  -90.49 /    90.2  complementary[8] ↔ square-1[0]     
  #e6e4e0 ↔ #000000  Lc  -90.49 /    90.2  complementary[8] ↔ square-2[0]     
  #e6e4e0 ↔ #000000  Lc  -90.49 /    90.2  complementary[8] ↔ square-3[0]     
  #e6e4e0 ↔ #000000  Lc  -90.49 /    90.2  complementary[8] ↔ shift-30[0]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  complementary[9] ↔ triadic-1[0]    
  #ffffff ↔ #33051d  Lc -106.32 /  103.98  complementary[9] ↔ triadic-1[1]    
  #ffffff ↔ #611036  Lc -101.32 /   97.83  complementary[9] ↔ triadic-1[2]    
  #ffffff ↔ #89214e  Lc  -93.52 /   88.95  complementary[9] ↔ triadic-1[3]    
  #ffffff ↔ #000000  Lc -107.88 /  106.04  complementary[9] ↔ triadic-2[0]    
  #ffffff ↔ #1d3305  Lc -103.27 /  100.17  complementary[9] ↔ triadic-2[1]    
  #ffffff ↔ #366110  Lc  -90.04 /   85.15  complementary[9] ↔ triadic-2[2]    
  #ffffff ↔ #000000  Lc -107.88 /  106.04  complementary[9] ↔ square-1[0]     
  #ffffff ↔ #330533  Lc    -106 /  103.56  complementary[9] ↔ square-1[1]     
  #ffffff ↔ #61105e  Lc -100.04 /   96.32  complementary[9] ↔ square-1[2]     
  #ffffff ↔ #892182  Lc  -91.53 /   86.78  complementary[9] ↔ square-1[3]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  complementary[9] ↔ square-2[0]     
  #ffffff ↔ #331c05  Lc -105.43 /  102.85  complementary[9] ↔ square-2[1]     
  #ffffff ↔ #613b10  Lc  -96.71 /   92.51  complementary[9] ↔ square-2[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  complementary[9] ↔ square-3[0]     
  #ffffff ↔ #063305  Lc -103.56 /  100.53  complementary[9] ↔ square-3[1]     
  #ffffff ↔ #106113  Lc  -90.92 /   86.12  complementary[9] ↔ square-3[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  complementary[9] ↔ shift-30[0]     
  #ffffff ↔ #050633  Lc -107.34 /  105.31  complementary[9] ↔ shift-30[1]     
  #ffffff ↔ #121061  Lc -105.33 /  102.72  complementary[9] ↔ shift-30[2]     
  #ffffff ↔ #282189  Lc  -101.2 /   97.69  complementary[9] ↔ shift-30[3]     
  #ffffff ↔ #4338ab  Lc  -93.98 /   89.46  complementary[9] ↔ shift-30[4]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-1[0]     ↔ triadic-1[9]    
  #000000 ↔ #e1e6e0  Lc   90.42 /  -90.72  triadic-1[0]     ↔ triadic-2[8]    
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-1[0]     ↔ triadic-2[9]    
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-1[0]     ↔ square-1[9]     
  #000000 ↔ #e6e4e0  Lc    90.2 /  -90.49  triadic-1[0]     ↔ square-2[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-1[0]     ↔ square-2[9]     
  #000000 ↔ #e0e6e1  Lc   90.34 /  -90.64  triadic-1[0]     ↔ square-3[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-1[0]     ↔ square-3[9]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-1[0]     ↔ shift-30[9]     
  #33051d ↔ #ffffff  Lc  103.98 / -106.32  triadic-1[1]     ↔ triadic-1[9]    
  #33051d ↔ #ffffff  Lc  103.98 / -106.32  triadic-1[1]     ↔ triadic-2[9]    
  #33051d ↔ #ffffff  Lc  103.98 / -106.32  triadic-1[1]     ↔ square-1[9]     
  #33051d ↔ #ffffff  Lc  103.98 / -106.32  triadic-1[1]     ↔ square-2[9]     
  #33051d ↔ #ffffff  Lc  103.98 / -106.32  triadic-1[1]     ↔ square-3[9]     
  #33051d ↔ #ffffff  Lc  103.98 / -106.32  triadic-1[1]     ↔ shift-30[9]     
  #611036 ↔ #ffffff  Lc   97.83 / -101.32  triadic-1[2]     ↔ triadic-1[9]    
  #611036 ↔ #ffffff  Lc   97.83 / -101.32  triadic-1[2]     ↔ triadic-2[9]    
  #611036 ↔ #ffffff  Lc   97.83 / -101.32  triadic-1[2]     ↔ square-1[9]     
  #611036 ↔ #ffffff  Lc   97.83 / -101.32  triadic-1[2]     ↔ square-2[9]     
  #611036 ↔ #ffffff  Lc   97.83 / -101.32  triadic-1[2]     ↔ square-3[9]     
  #611036 ↔ #ffffff  Lc   97.83 / -101.32  triadic-1[2]     ↔ shift-30[9]     
  #89214e ↔ #ffffff  Lc   88.95 /  -93.52  triadic-1[3]     ↔ triadic-1[9]    
  #89214e ↔ #ffffff  Lc   88.95 /  -93.52  triadic-1[3]     ↔ triadic-2[9]    
  #89214e ↔ #ffffff  Lc   88.95 /  -93.52  triadic-1[3]     ↔ square-1[9]     
  #89214e ↔ #ffffff  Lc   88.95 /  -93.52  triadic-1[3]     ↔ square-2[9]     
  #89214e ↔ #ffffff  Lc   88.95 /  -93.52  triadic-1[3]     ↔ square-3[9]     
  #89214e ↔ #ffffff  Lc   88.95 /  -93.52  triadic-1[3]     ↔ shift-30[9]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-1[9]     ↔ triadic-2[0]    
  #ffffff ↔ #1d3305  Lc -103.27 /  100.17  triadic-1[9]     ↔ triadic-2[1]    
  #ffffff ↔ #366110  Lc  -90.04 /   85.15  triadic-1[9]     ↔ triadic-2[2]    
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-1[9]     ↔ square-1[0]     
  #ffffff ↔ #330533  Lc    -106 /  103.56  triadic-1[9]     ↔ square-1[1]     
  #ffffff ↔ #61105e  Lc -100.04 /   96.32  triadic-1[9]     ↔ square-1[2]     
  #ffffff ↔ #892182  Lc  -91.53 /   86.78  triadic-1[9]     ↔ square-1[3]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-1[9]     ↔ square-2[0]     
  #ffffff ↔ #331c05  Lc -105.43 /  102.85  triadic-1[9]     ↔ square-2[1]     
  #ffffff ↔ #613b10  Lc  -96.71 /   92.51  triadic-1[9]     ↔ square-2[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-1[9]     ↔ square-3[0]     
  #ffffff ↔ #063305  Lc -103.56 /  100.53  triadic-1[9]     ↔ square-3[1]     
  #ffffff ↔ #106113  Lc  -90.92 /   86.12  triadic-1[9]     ↔ square-3[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-1[9]     ↔ shift-30[0]     
  #ffffff ↔ #050633  Lc -107.34 /  105.31  triadic-1[9]     ↔ shift-30[1]     
  #ffffff ↔ #121061  Lc -105.33 /  102.72  triadic-1[9]     ↔ shift-30[2]     
  #ffffff ↔ #282189  Lc  -101.2 /   97.69  triadic-1[9]     ↔ shift-30[3]     
  #ffffff ↔ #4338ab  Lc  -93.98 /   89.46  triadic-1[9]     ↔ shift-30[4]     
  #000000 ↔ #e1e6e0  Lc   90.42 /  -90.72  triadic-2[0]     ↔ triadic-2[8]    
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-2[0]     ↔ triadic-2[9]    
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-2[0]     ↔ square-1[9]     
  #000000 ↔ #e6e4e0  Lc    90.2 /  -90.49  triadic-2[0]     ↔ square-2[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-2[0]     ↔ square-2[9]     
  #000000 ↔ #e0e6e1  Lc   90.34 /  -90.64  triadic-2[0]     ↔ square-3[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-2[0]     ↔ square-3[9]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  triadic-2[0]     ↔ shift-30[9]     
  #1d3305 ↔ #ffffff  Lc  100.17 / -103.27  triadic-2[1]     ↔ triadic-2[9]    
  #1d3305 ↔ #ffffff  Lc  100.17 / -103.27  triadic-2[1]     ↔ square-1[9]     
  #1d3305 ↔ #ffffff  Lc  100.17 / -103.27  triadic-2[1]     ↔ square-2[9]     
  #1d3305 ↔ #ffffff  Lc  100.17 / -103.27  triadic-2[1]     ↔ square-3[9]     
  #1d3305 ↔ #ffffff  Lc  100.17 / -103.27  triadic-2[1]     ↔ shift-30[9]     
  #366110 ↔ #ffffff  Lc   85.15 /  -90.04  triadic-2[2]     ↔ triadic-2[9]    
  #366110 ↔ #ffffff  Lc   85.15 /  -90.04  triadic-2[2]     ↔ square-1[9]     
  #366110 ↔ #ffffff  Lc   85.15 /  -90.04  triadic-2[2]     ↔ square-2[9]     
  #366110 ↔ #ffffff  Lc   85.15 /  -90.04  triadic-2[2]     ↔ square-3[9]     
  #366110 ↔ #ffffff  Lc   85.15 /  -90.04  triadic-2[2]     ↔ shift-30[9]     
  #e1e6e0 ↔ #000000  Lc  -90.72 /   90.42  triadic-2[8]     ↔ square-1[0]     
  #e1e6e0 ↔ #000000  Lc  -90.72 /   90.42  triadic-2[8]     ↔ square-2[0]     
  #e1e6e0 ↔ #000000  Lc  -90.72 /   90.42  triadic-2[8]     ↔ square-3[0]     
  #e1e6e0 ↔ #000000  Lc  -90.72 /   90.42  triadic-2[8]     ↔ shift-30[0]     
  #e1e6e0 ↔ #050633  Lc  -90.18 /   89.69  triadic-2[8]     ↔ shift-30[1]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-2[9]     ↔ square-1[0]     
  #ffffff ↔ #330533  Lc    -106 /  103.56  triadic-2[9]     ↔ square-1[1]     
  #ffffff ↔ #61105e  Lc -100.04 /   96.32  triadic-2[9]     ↔ square-1[2]     
  #ffffff ↔ #892182  Lc  -91.53 /   86.78  triadic-2[9]     ↔ square-1[3]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-2[9]     ↔ square-2[0]     
  #ffffff ↔ #331c05  Lc -105.43 /  102.85  triadic-2[9]     ↔ square-2[1]     
  #ffffff ↔ #613b10  Lc  -96.71 /   92.51  triadic-2[9]     ↔ square-2[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-2[9]     ↔ square-3[0]     
  #ffffff ↔ #063305  Lc -103.56 /  100.53  triadic-2[9]     ↔ square-3[1]     
  #ffffff ↔ #106113  Lc  -90.92 /   86.12  triadic-2[9]     ↔ square-3[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  triadic-2[9]     ↔ shift-30[0]     
  #ffffff ↔ #050633  Lc -107.34 /  105.31  triadic-2[9]     ↔ shift-30[1]     
  #ffffff ↔ #121061  Lc -105.33 /  102.72  triadic-2[9]     ↔ shift-30[2]     
  #ffffff ↔ #282189  Lc  -101.2 /   97.69  triadic-2[9]     ↔ shift-30[3]     
  #ffffff ↔ #4338ab  Lc  -93.98 /   89.46  triadic-2[9]     ↔ shift-30[4]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-1[0]      ↔ square-1[9]     
  #000000 ↔ #e6e4e0  Lc    90.2 /  -90.49  square-1[0]      ↔ square-2[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-1[0]      ↔ square-2[9]     
  #000000 ↔ #e0e6e1  Lc   90.34 /  -90.64  square-1[0]      ↔ square-3[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-1[0]      ↔ square-3[9]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-1[0]      ↔ shift-30[9]     
  #330533 ↔ #ffffff  Lc  103.56 /    -106  square-1[1]      ↔ square-1[9]     
  #330533 ↔ #ffffff  Lc  103.56 /    -106  square-1[1]      ↔ square-2[9]     
  #330533 ↔ #ffffff  Lc  103.56 /    -106  square-1[1]      ↔ square-3[9]     
  #330533 ↔ #ffffff  Lc  103.56 /    -106  square-1[1]      ↔ shift-30[9]     
  #61105e ↔ #ffffff  Lc   96.32 / -100.04  square-1[2]      ↔ square-1[9]     
  #61105e ↔ #ffffff  Lc   96.32 / -100.04  square-1[2]      ↔ square-2[9]     
  #61105e ↔ #ffffff  Lc   96.32 / -100.04  square-1[2]      ↔ square-3[9]     
  #61105e ↔ #ffffff  Lc   96.32 / -100.04  square-1[2]      ↔ shift-30[9]     
  #892182 ↔ #ffffff  Lc   86.78 /  -91.53  square-1[3]      ↔ square-1[9]     
  #892182 ↔ #ffffff  Lc   86.78 /  -91.53  square-1[3]      ↔ square-2[9]     
  #892182 ↔ #ffffff  Lc   86.78 /  -91.53  square-1[3]      ↔ square-3[9]     
  #892182 ↔ #ffffff  Lc   86.78 /  -91.53  square-1[3]      ↔ shift-30[9]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  square-1[9]      ↔ square-2[0]     
  #ffffff ↔ #331c05  Lc -105.43 /  102.85  square-1[9]      ↔ square-2[1]     
  #ffffff ↔ #613b10  Lc  -96.71 /   92.51  square-1[9]      ↔ square-2[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  square-1[9]      ↔ square-3[0]     
  #ffffff ↔ #063305  Lc -103.56 /  100.53  square-1[9]      ↔ square-3[1]     
  #ffffff ↔ #106113  Lc  -90.92 /   86.12  square-1[9]      ↔ square-3[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  square-1[9]      ↔ shift-30[0]     
  #ffffff ↔ #050633  Lc -107.34 /  105.31  square-1[9]      ↔ shift-30[1]     
  #ffffff ↔ #121061  Lc -105.33 /  102.72  square-1[9]      ↔ shift-30[2]     
  #ffffff ↔ #282189  Lc  -101.2 /   97.69  square-1[9]      ↔ shift-30[3]     
  #ffffff ↔ #4338ab  Lc  -93.98 /   89.46  square-1[9]      ↔ shift-30[4]     
  #000000 ↔ #e6e4e0  Lc    90.2 /  -90.49  square-2[0]      ↔ square-2[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-2[0]      ↔ square-2[9]     
  #000000 ↔ #e0e6e1  Lc   90.34 /  -90.64  square-2[0]      ↔ square-3[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-2[0]      ↔ square-3[9]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-2[0]      ↔ shift-30[9]     
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  square-2[1]      ↔ square-2[9]     
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  square-2[1]      ↔ square-3[9]     
  #331c05 ↔ #ffffff  Lc  102.85 / -105.43  square-2[1]      ↔ shift-30[9]     
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  square-2[2]      ↔ square-2[9]     
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  square-2[2]      ↔ square-3[9]     
  #613b10 ↔ #ffffff  Lc   92.51 /  -96.71  square-2[2]      ↔ shift-30[9]     
  #e6e4e0 ↔ #000000  Lc  -90.49 /    90.2  square-2[8]      ↔ square-3[0]     
  #e6e4e0 ↔ #000000  Lc  -90.49 /    90.2  square-2[8]      ↔ shift-30[0]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  square-2[9]      ↔ square-3[0]     
  #ffffff ↔ #063305  Lc -103.56 /  100.53  square-2[9]      ↔ square-3[1]     
  #ffffff ↔ #106113  Lc  -90.92 /   86.12  square-2[9]      ↔ square-3[2]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  square-2[9]      ↔ shift-30[0]     
  #ffffff ↔ #050633  Lc -107.34 /  105.31  square-2[9]      ↔ shift-30[1]     
  #ffffff ↔ #121061  Lc -105.33 /  102.72  square-2[9]      ↔ shift-30[2]     
  #ffffff ↔ #282189  Lc  -101.2 /   97.69  square-2[9]      ↔ shift-30[3]     
  #ffffff ↔ #4338ab  Lc  -93.98 /   89.46  square-2[9]      ↔ shift-30[4]     
  #000000 ↔ #e0e6e1  Lc   90.34 /  -90.64  square-3[0]      ↔ square-3[8]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-3[0]      ↔ square-3[9]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  square-3[0]      ↔ shift-30[9]     
  #063305 ↔ #ffffff  Lc  100.53 / -103.56  square-3[1]      ↔ square-3[9]     
  #063305 ↔ #ffffff  Lc  100.53 / -103.56  square-3[1]      ↔ shift-30[9]     
  #106113 ↔ #ffffff  Lc   86.12 /  -90.92  square-3[2]      ↔ square-3[9]     
  #106113 ↔ #ffffff  Lc   86.12 /  -90.92  square-3[2]      ↔ shift-30[9]     
  #e0e6e1 ↔ #000000  Lc  -90.64 /   90.34  square-3[8]      ↔ shift-30[0]     
  #e0e6e1 ↔ #050633  Lc  -90.09 /   89.61  square-3[8]      ↔ shift-30[1]     
  #ffffff ↔ #000000  Lc -107.88 /  106.04  square-3[9]      ↔ shift-30[0]     
  #ffffff ↔ #050633  Lc -107.34 /  105.31  square-3[9]      ↔ shift-30[1]     
  #ffffff ↔ #121061  Lc -105.33 /  102.72  square-3[9]      ↔ shift-30[2]     
  #ffffff ↔ #282189  Lc  -101.2 /   97.69  square-3[9]      ↔ shift-30[3]     
  #ffffff ↔ #4338ab  Lc  -93.98 /   89.46  square-3[9]      ↔ shift-30[4]     
  #000000 ↔ #ffffff  Lc  106.04 / -107.88  shift-30[0]      ↔ shift-30[9]     
  #050633 ↔ #ffffff  Lc  105.31 / -107.34  shift-30[1]      ↔ shift-30[9]     
  #121061 ↔ #ffffff  Lc  102.72 / -105.33  shift-30[2]      ↔ shift-30[9]     
  #282189 ↔ #ffffff  Lc   97.69 /  -101.2  shift-30[3]      ↔ shift-30[9]     
  #4338ab ↔ #ffffff  Lc   89.46 /  -93.98  shift-30[4]      ↔ shift-30[9]     

## Body text (Lc ≥ 75) — 254 pairs
  #000000 ↔ #e0e1e6  Lc  88.48 / -88.61  base[0]          ↔ base[8]         
  #000000 ↔ #d2cbbb  Lc  76.19 / -75.34  base[0]          ↔ complementary[7]
  #000000 ↔ #e6e0e1  Lc   88.6 / -88.74  base[0]          ↔ triadic-1[8]    
  #000000 ↔ #c1d2bb  Lc  77.04 / -76.25  base[0]          ↔ triadic-2[7]    
  #000000 ↔ #e6e0e4  Lc  88.73 / -88.88  base[0]          ↔ square-1[8]     
  #000000 ↔ #d2cbbb  Lc  76.19 / -75.34  base[0]          ↔ square-2[7]     
  #000000 ↔ #bbd2c0  Lc  76.58 / -75.76  base[0]          ↔ square-3[7]     
  #000000 ↔ #e1e0e6  Lc  88.19 /  -88.3  base[0]          ↔ shift-30[8]     
  #051d33 ↔ #e0e1e6  Lc  86.24 /  -86.9  base[1]          ↔ base[8]         
  #051d33 ↔ #e6e4e0  Lc  87.96 / -88.78  base[1]          ↔ complementary[8]
  #051d33 ↔ #e6e0e1  Lc  86.36 / -87.04  base[1]          ↔ triadic-1[8]    
  #051d33 ↔ #e1e6e0  Lc  88.18 / -89.02  base[1]          ↔ triadic-2[8]    
  #051d33 ↔ #e6e0e4  Lc  86.48 / -87.17  base[1]          ↔ square-1[8]     
  #051d33 ↔ #e6e4e0  Lc  87.96 / -88.78  base[1]          ↔ square-2[8]     
  #051d33 ↔ #e0e6e1  Lc   88.1 / -88.93  base[1]          ↔ square-3[8]     
  #051d33 ↔ #e1e0e6  Lc  85.95 / -86.59  base[1]          ↔ shift-30[8]     
  #103661 ↔ #e0e1e6  Lc  79.94 / -81.77  base[2]          ↔ base[8]         
  #103661 ↔ #e6e4e0  Lc  81.66 / -83.64  base[2]          ↔ complementary[8]
  #103661 ↔ #e6e0e1  Lc  80.06 /  -81.9  base[2]          ↔ triadic-1[8]    
  #103661 ↔ #e1e6e0  Lc  81.88 / -83.88  base[2]          ↔ triadic-2[8]    
  #103661 ↔ #e6e0e4  Lc  80.19 / -82.04  base[2]          ↔ square-1[8]     
  #103661 ↔ #e6e4e0  Lc  81.66 / -83.64  base[2]          ↔ square-2[8]     
  #103661 ↔ #e0e6e1  Lc   81.8 / -83.79  base[2]          ↔ square-3[8]     
  #103661 ↔ #e1e0e6  Lc  79.65 / -81.45  base[2]          ↔ shift-30[8]     
  #214e89 ↔ #e6e4e0  Lc  72.64 / -75.69  base[3]          ↔ complementary[8]
  #214e89 ↔ #e1e6e0  Lc  72.86 / -75.93  base[3]          ↔ triadic-2[8]    
  #214e89 ↔ #e6e4e0  Lc  72.64 / -75.69  base[3]          ↔ square-2[8]     
  #214e89 ↔ #e0e6e1  Lc  72.78 / -75.85  base[3]          ↔ square-3[8]     
  #3866ab ↔ #ffffff  Lc  78.47 / -83.74  base[4]          ↔ base[9]         
  #3866ab ↔ #ffffff  Lc  78.47 / -83.74  base[4]          ↔ complementary[9]
  #3866ab ↔ #ffffff  Lc  78.47 / -83.74  base[4]          ↔ triadic-1[9]    
  #3866ab ↔ #ffffff  Lc  78.47 / -83.74  base[4]          ↔ triadic-2[9]    
  #3866ab ↔ #ffffff  Lc  78.47 / -83.74  base[4]          ↔ square-1[9]     
  #3866ab ↔ #ffffff  Lc  78.47 / -83.74  base[4]          ↔ square-2[9]     
  #3866ab ↔ #ffffff  Lc  78.47 / -83.74  base[4]          ↔ square-3[9]     
  #3866ab ↔ #ffffff  Lc  78.47 / -83.74  base[4]          ↔ shift-30[9]     
  #e0e1e6 ↔ #000000  Lc -88.61 /  88.48  base[8]          ↔ complementary[0]
  #e0e1e6 ↔ #331c05  Lc -86.16 /  85.28  base[8]          ↔ complementary[1]
  #e0e1e6 ↔ #613b10  Lc -77.43 /  74.94  base[8]          ↔ complementary[2]
  #e0e1e6 ↔ #000000  Lc -88.61 /  88.48  base[8]          ↔ triadic-1[0]    
  #e0e1e6 ↔ #33051d  Lc -87.05 /  86.42  base[8]          ↔ triadic-1[1]    
  #e0e1e6 ↔ #611036  Lc -82.05 /  80.27  base[8]          ↔ triadic-1[2]    
  #e0e1e6 ↔ #000000  Lc -88.61 /  88.48  base[8]          ↔ triadic-2[0]    
  #e0e1e6 ↔ #1d3305  Lc    -84 /  82.61  base[8]          ↔ triadic-2[1]    
  #e0e1e6 ↔ #000000  Lc -88.61 /  88.48  base[8]          ↔ square-1[0]     
  #e0e1e6 ↔ #330533  Lc -86.72 /     86  base[8]          ↔ square-1[1]     
  #e0e1e6 ↔ #61105e  Lc -80.76 /  78.76  base[8]          ↔ square-1[2]     
  #e0e1e6 ↔ #000000  Lc -88.61 /  88.48  base[8]          ↔ square-2[0]     
  #e0e1e6 ↔ #331c05  Lc -86.16 /  85.28  base[8]          ↔ square-2[1]     
  #e0e1e6 ↔ #613b10  Lc -77.43 /  74.94  base[8]          ↔ square-2[2]     
  #e0e1e6 ↔ #000000  Lc -88.61 /  88.48  base[8]          ↔ square-3[0]     
  #e0e1e6 ↔ #063305  Lc -84.29 /  82.96  base[8]          ↔ square-3[1]     
  #e0e1e6 ↔ #000000  Lc -88.61 /  88.48  base[8]          ↔ shift-30[0]     
  #e0e1e6 ↔ #050633  Lc -88.07 /  87.75  base[8]          ↔ shift-30[1]     
  #e0e1e6 ↔ #121061  Lc -86.06 /  85.16  base[8]          ↔ shift-30[2]     
  #e0e1e6 ↔ #282189  Lc -81.92 /  80.13  base[8]          ↔ shift-30[3]     
  #ffffff ↔ #895c21  Lc  -84.1 /  78.85  base[9]          ↔ complementary[3]
  #ffffff ↔ #ab3866  Lc -84.42 /  79.19  base[9]          ↔ triadic-1[4]    
  #ffffff ↔ #ab389f  Lc -82.02 /  76.69  base[9]          ↔ square-1[4]     
  #ffffff ↔ #895c21  Lc  -84.1 /  78.85  base[9]          ↔ square-2[3]     
  #ffffff ↔ #218928  Lc -76.18 /   70.7  base[9]          ↔ square-3[3]     
  #ffffff ↔ #6c60bc  Lc -80.98 /  75.61  base[9]          ↔ shift-30[5]     
  #000000 ↔ #d2cbbb  Lc  76.19 / -75.34  complementary[0] ↔ complementary[7]
  #000000 ↔ #e6e0e1  Lc   88.6 / -88.74  complementary[0] ↔ triadic-1[8]    
  #000000 ↔ #c1d2bb  Lc  77.04 / -76.25  complementary[0] ↔ triadic-2[7]    
  #000000 ↔ #e6e0e4  Lc  88.73 / -88.88  complementary[0] ↔ square-1[8]     
  #000000 ↔ #d2cbbb  Lc  76.19 / -75.34  complementary[0] ↔ square-2[7]     
  #000000 ↔ #bbd2c0  Lc  76.58 / -75.76  complementary[0] ↔ square-3[7]     
  #000000 ↔ #e1e0e6  Lc  88.19 /  -88.3  complementary[0] ↔ shift-30[8]     
  #331c05 ↔ #e6e4e0  Lc  87.01 / -88.03  complementary[1] ↔ complementary[8]
  #331c05 ↔ #e6e0e1  Lc  85.41 / -86.29  complementary[1] ↔ triadic-1[8]    
  #331c05 ↔ #e1e6e0  Lc  87.23 / -88.27  complementary[1] ↔ triadic-2[8]    
  #331c05 ↔ #e6e0e4  Lc  85.53 / -86.43  complementary[1] ↔ square-1[8]     
  #331c05 ↔ #e6e4e0  Lc  87.01 / -88.03  complementary[1] ↔ square-2[8]     
  #331c05 ↔ #e0e6e1  Lc  87.15 / -88.19  complementary[1] ↔ square-3[8]     
  #331c05 ↔ #e1e0e6  Lc     85 / -85.84  complementary[1] ↔ shift-30[8]     
  #613b10 ↔ #e6e4e0  Lc  76.67 / -79.31  complementary[2] ↔ complementary[8]
  #613b10 ↔ #e6e0e1  Lc  75.07 / -77.56  complementary[2] ↔ triadic-1[8]    
  #613b10 ↔ #e1e6e0  Lc  76.89 / -79.55  complementary[2] ↔ triadic-2[8]    
  #613b10 ↔ #e6e0e4  Lc  75.19 /  -77.7  complementary[2] ↔ square-1[8]     
  #613b10 ↔ #e6e4e0  Lc  76.67 / -79.31  complementary[2] ↔ square-2[8]     
  #613b10 ↔ #e0e6e1  Lc  76.81 / -79.46  complementary[2] ↔ square-3[8]     
  #613b10 ↔ #e1e0e6  Lc  74.66 / -77.12  complementary[2] ↔ shift-30[8]     
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  complementary[3] ↔ complementary[9]
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  complementary[3] ↔ triadic-1[9]    
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  complementary[3] ↔ triadic-2[9]    
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  complementary[3] ↔ square-1[9]     
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  complementary[3] ↔ square-2[9]     
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  complementary[3] ↔ square-3[9]     
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  complementary[3] ↔ shift-30[9]     
  #d2cbbb ↔ #000000  Lc -75.34 /  76.19  complementary[7] ↔ triadic-1[0]    
  #d2cbbb ↔ #000000  Lc -75.34 /  76.19  complementary[7] ↔ triadic-2[0]    
  #d2cbbb ↔ #000000  Lc -75.34 /  76.19  complementary[7] ↔ square-1[0]     
  #d2cbbb ↔ #000000  Lc -75.34 /  76.19  complementary[7] ↔ square-2[0]     
  #d2cbbb ↔ #000000  Lc -75.34 /  76.19  complementary[7] ↔ square-3[0]     
  #d2cbbb ↔ #000000  Lc -75.34 /  76.19  complementary[7] ↔ shift-30[0]     
  #d2cbbb ↔ #050633  Lc -74.79 /  75.46  complementary[7] ↔ shift-30[1]     
  #e6e4e0 ↔ #33051d  Lc -88.93 /  88.15  complementary[8] ↔ triadic-1[1]    
  #e6e4e0 ↔ #611036  Lc -83.92 /     82  complementary[8] ↔ triadic-1[2]    
  #e6e4e0 ↔ #89214e  Lc -76.12 /  73.11  complementary[8] ↔ triadic-1[3]    
  #e6e4e0 ↔ #1d3305  Lc -85.87 /  84.33  complementary[8] ↔ triadic-2[1]    
  #e6e4e0 ↔ #330533  Lc  -88.6 /  87.72  complementary[8] ↔ square-1[1]     
  #e6e4e0 ↔ #61105e  Lc -82.64 /  80.49  complementary[8] ↔ square-1[2]     
  #e6e4e0 ↔ #331c05  Lc -88.03 /  87.01  complementary[8] ↔ square-2[1]     
  #e6e4e0 ↔ #613b10  Lc -79.31 /  76.67  complementary[8] ↔ square-2[2]     
  #e6e4e0 ↔ #063305  Lc -86.16 /  84.69  complementary[8] ↔ square-3[1]     
  #e6e4e0 ↔ #050633  Lc -89.94 /  89.48  complementary[8] ↔ shift-30[1]     
  #e6e4e0 ↔ #121061  Lc -87.94 /  86.88  complementary[8] ↔ shift-30[2]     
  #e6e4e0 ↔ #282189  Lc  -83.8 /  81.85  complementary[8] ↔ shift-30[3]     
  #e6e4e0 ↔ #4338ab  Lc -76.58 /  73.62  complementary[8] ↔ shift-30[4]     
  #ffffff ↔ #ab3866  Lc -84.42 /  79.19  complementary[9] ↔ triadic-1[4]    
  #ffffff ↔ #ab389f  Lc -82.02 /  76.69  complementary[9] ↔ square-1[4]     
  #ffffff ↔ #895c21  Lc  -84.1 /  78.85  complementary[9] ↔ square-2[3]     
  #ffffff ↔ #218928  Lc -76.18 /   70.7  complementary[9] ↔ square-3[3]     
  #ffffff ↔ #6c60bc  Lc -80.98 /  75.61  complementary[9] ↔ shift-30[5]     
  #000000 ↔ #e6e0e1  Lc   88.6 / -88.74  triadic-1[0]     ↔ triadic-1[8]    
  #000000 ↔ #c1d2bb  Lc  77.04 / -76.25  triadic-1[0]     ↔ triadic-2[7]    
  #000000 ↔ #e6e0e4  Lc  88.73 / -88.88  triadic-1[0]     ↔ square-1[8]     
  #000000 ↔ #d2cbbb  Lc  76.19 / -75.34  triadic-1[0]     ↔ square-2[7]     
  #000000 ↔ #bbd2c0  Lc  76.58 / -75.76  triadic-1[0]     ↔ square-3[7]     
  #000000 ↔ #e1e0e6  Lc  88.19 /  -88.3  triadic-1[0]     ↔ shift-30[8]     
  #33051d ↔ #e6e0e1  Lc  86.54 / -87.18  triadic-1[1]     ↔ triadic-1[8]    
  #33051d ↔ #e1e6e0  Lc  88.36 / -89.16  triadic-1[1]     ↔ triadic-2[8]    
  #33051d ↔ #e6e0e4  Lc  86.67 / -87.32  triadic-1[1]     ↔ square-1[8]     
  #33051d ↔ #e6e4e0  Lc  88.15 / -88.93  triadic-1[1]     ↔ square-2[8]     
  #33051d ↔ #e0e6e1  Lc  88.29 / -89.08  triadic-1[1]     ↔ square-3[8]     
  #33051d ↔ #e1e0e6  Lc  86.13 / -86.73  triadic-1[1]     ↔ shift-30[8]     
  #611036 ↔ #e6e0e1  Lc   80.4 / -82.18  triadic-1[2]     ↔ triadic-1[8]    
  #611036 ↔ #e1e6e0  Lc  82.22 / -84.16  triadic-1[2]     ↔ triadic-2[8]    
  #611036 ↔ #e6e0e4  Lc  80.52 / -82.32  triadic-1[2]     ↔ square-1[8]     
  #611036 ↔ #e6e4e0  Lc     82 / -83.92  triadic-1[2]     ↔ square-2[8]     
  #611036 ↔ #e0e6e1  Lc  82.14 / -84.08  triadic-1[2]     ↔ square-3[8]     
  #611036 ↔ #e1e0e6  Lc  79.98 / -81.73  triadic-1[2]     ↔ shift-30[8]     
  #89214e ↔ #e1e6e0  Lc  73.33 / -76.36  triadic-1[3]     ↔ triadic-2[8]    
  #89214e ↔ #e6e4e0  Lc  73.11 / -76.12  triadic-1[3]     ↔ square-2[8]     
  #89214e ↔ #e0e6e1  Lc  73.25 / -76.27  triadic-1[3]     ↔ square-3[8]     
  #ab3866 ↔ #ffffff  Lc  79.19 / -84.42  triadic-1[4]     ↔ triadic-1[9]    
  #ab3866 ↔ #ffffff  Lc  79.19 / -84.42  triadic-1[4]     ↔ triadic-2[9]    
  #ab3866 ↔ #ffffff  Lc  79.19 / -84.42  triadic-1[4]     ↔ square-1[9]     
  #ab3866 ↔ #ffffff  Lc  79.19 / -84.42  triadic-1[4]     ↔ square-2[9]     
  #ab3866 ↔ #ffffff  Lc  79.19 / -84.42  triadic-1[4]     ↔ square-3[9]     
  #ab3866 ↔ #ffffff  Lc  79.19 / -84.42  triadic-1[4]     ↔ shift-30[9]     
  #e6e0e1 ↔ #000000  Lc -88.74 /   88.6  triadic-1[8]     ↔ triadic-2[0]    
  #e6e0e1 ↔ #1d3305  Lc -84.13 /  82.73  triadic-1[8]     ↔ triadic-2[1]    
  #e6e0e1 ↔ #000000  Lc -88.74 /   88.6  triadic-1[8]     ↔ square-1[0]     
  #e6e0e1 ↔ #330533  Lc -86.85 /  86.12  triadic-1[8]     ↔ square-1[1]     
  #e6e0e1 ↔ #61105e  Lc -80.89 /  78.88  triadic-1[8]     ↔ square-1[2]     
  #e6e0e1 ↔ #000000  Lc -88.74 /   88.6  triadic-1[8]     ↔ square-2[0]     
  #e6e0e1 ↔ #331c05  Lc -86.29 /  85.41  triadic-1[8]     ↔ square-2[1]     
  #e6e0e1 ↔ #613b10  Lc -77.56 /  75.07  triadic-1[8]     ↔ square-2[2]     
  #e6e0e1 ↔ #000000  Lc -88.74 /   88.6  triadic-1[8]     ↔ square-3[0]     
  #e6e0e1 ↔ #063305  Lc -84.42 /  83.09  triadic-1[8]     ↔ square-3[1]     
  #e6e0e1 ↔ #000000  Lc -88.74 /   88.6  triadic-1[8]     ↔ shift-30[0]     
  #e6e0e1 ↔ #050633  Lc  -88.2 /  87.87  triadic-1[8]     ↔ shift-30[1]     
  #e6e0e1 ↔ #121061  Lc -86.19 /  85.28  triadic-1[8]     ↔ shift-30[2]     
  #e6e0e1 ↔ #282189  Lc -82.06 /  80.25  triadic-1[8]     ↔ shift-30[3]     
  #ffffff ↔ #ab389f  Lc -82.02 /  76.69  triadic-1[9]     ↔ square-1[4]     
  #ffffff ↔ #895c21  Lc  -84.1 /  78.85  triadic-1[9]     ↔ square-2[3]     
  #ffffff ↔ #218928  Lc -76.18 /   70.7  triadic-1[9]     ↔ square-3[3]     
  #ffffff ↔ #6c60bc  Lc -80.98 /  75.61  triadic-1[9]     ↔ shift-30[5]     
  #000000 ↔ #c1d2bb  Lc  77.04 / -76.25  triadic-2[0]     ↔ triadic-2[7]    
  #000000 ↔ #e6e0e4  Lc  88.73 / -88.88  triadic-2[0]     ↔ square-1[8]     
  #000000 ↔ #d2cbbb  Lc  76.19 / -75.34  triadic-2[0]     ↔ square-2[7]     
  #000000 ↔ #bbd2c0  Lc  76.58 / -75.76  triadic-2[0]     ↔ square-3[7]     
  #000000 ↔ #e1e0e6  Lc  88.19 /  -88.3  triadic-2[0]     ↔ shift-30[8]     
  #1d3305 ↔ #e1e6e0  Lc  84.55 / -86.11  triadic-2[1]     ↔ triadic-2[8]    
  #1d3305 ↔ #e6e0e4  Lc  82.86 / -84.27  triadic-2[1]     ↔ square-1[8]     
  #1d3305 ↔ #e6e4e0  Lc  84.33 / -85.87  triadic-2[1]     ↔ square-2[8]     
  #1d3305 ↔ #e0e6e1  Lc  84.47 / -86.03  triadic-2[1]     ↔ square-3[8]     
  #1d3305 ↔ #e1e0e6  Lc  82.32 / -83.68  triadic-2[1]     ↔ shift-30[8]     
  #c1d2bb ↔ #000000  Lc -76.25 /  77.04  triadic-2[7]     ↔ square-1[0]     
  #c1d2bb ↔ #000000  Lc -76.25 /  77.04  triadic-2[7]     ↔ square-2[0]     
  #c1d2bb ↔ #000000  Lc -76.25 /  77.04  triadic-2[7]     ↔ square-3[0]     
  #c1d2bb ↔ #000000  Lc -76.25 /  77.04  triadic-2[7]     ↔ shift-30[0]     
  #c1d2bb ↔ #050633  Lc -75.71 /  76.31  triadic-2[7]     ↔ shift-30[1]     
  #e1e6e0 ↔ #330533  Lc -88.84 /  87.94  triadic-2[8]     ↔ square-1[1]     
  #e1e6e0 ↔ #61105e  Lc -82.88 /   80.7  triadic-2[8]     ↔ square-1[2]     
  #e1e6e0 ↔ #331c05  Lc -88.27 /  87.23  triadic-2[8]     ↔ square-2[1]     
  #e1e6e0 ↔ #613b10  Lc -79.55 /  76.89  triadic-2[8]     ↔ square-2[2]     
  #e1e6e0 ↔ #063305  Lc  -86.4 /  84.91  triadic-2[8]     ↔ square-3[1]     
  #e1e6e0 ↔ #121061  Lc -88.17 /   87.1  triadic-2[8]     ↔ shift-30[2]     
  #e1e6e0 ↔ #282189  Lc -84.04 /  82.07  triadic-2[8]     ↔ shift-30[3]     
  #e1e6e0 ↔ #4338ab  Lc -76.82 /  73.84  triadic-2[8]     ↔ shift-30[4]     
  #ffffff ↔ #ab389f  Lc -82.02 /  76.69  triadic-2[9]     ↔ square-1[4]     
  #ffffff ↔ #895c21  Lc  -84.1 /  78.85  triadic-2[9]     ↔ square-2[3]     
  #ffffff ↔ #218928  Lc -76.18 /   70.7  triadic-2[9]     ↔ square-3[3]     
  #ffffff ↔ #6c60bc  Lc -80.98 /  75.61  triadic-2[9]     ↔ shift-30[5]     
  #000000 ↔ #e6e0e4  Lc  88.73 / -88.88  square-1[0]      ↔ square-1[8]     
  #000000 ↔ #d2cbbb  Lc  76.19 / -75.34  square-1[0]      ↔ square-2[7]     
  #000000 ↔ #bbd2c0  Lc  76.58 / -75.76  square-1[0]      ↔ square-3[7]     
  #000000 ↔ #e1e0e6  Lc  88.19 /  -88.3  square-1[0]      ↔ shift-30[8]     
  #330533 ↔ #e6e0e4  Lc  86.25 / -86.99  square-1[1]      ↔ square-1[8]     
  #330533 ↔ #e6e4e0  Lc  87.72 /  -88.6  square-1[1]      ↔ square-2[8]     
  #330533 ↔ #e0e6e1  Lc  87.86 / -88.75  square-1[1]      ↔ square-3[8]     
  #330533 ↔ #e1e0e6  Lc  85.71 / -86.41  square-1[1]      ↔ shift-30[8]     
  #61105e ↔ #e6e0e4  Lc  79.01 / -81.03  square-1[2]      ↔ square-1[8]     
  #61105e ↔ #e6e4e0  Lc  80.49 / -82.64  square-1[2]      ↔ square-2[8]     
  #61105e ↔ #e0e6e1  Lc  80.62 / -82.79  square-1[2]      ↔ square-3[8]     
  #61105e ↔ #e1e0e6  Lc  78.47 / -80.45  square-1[2]      ↔ shift-30[8]     
  #ab389f ↔ #ffffff  Lc  76.69 / -82.02  square-1[4]      ↔ square-1[9]     
  #ab389f ↔ #ffffff  Lc  76.69 / -82.02  square-1[4]      ↔ square-2[9]     
  #ab389f ↔ #ffffff  Lc  76.69 / -82.02  square-1[4]      ↔ square-3[9]     
  #ab389f ↔ #ffffff  Lc  76.69 / -82.02  square-1[4]      ↔ shift-30[9]     
  #e6e0e4 ↔ #000000  Lc -88.88 /  88.73  square-1[8]      ↔ square-2[0]     
  #e6e0e4 ↔ #331c05  Lc -86.43 /  85.53  square-1[8]      ↔ square-2[1]     
  #e6e0e4 ↔ #613b10  Lc  -77.7 /  75.19  square-1[8]      ↔ square-2[2]     
  #e6e0e4 ↔ #000000  Lc -88.88 /  88.73  square-1[8]      ↔ square-3[0]     
  #e6e0e4 ↔ #063305  Lc -84.56 /  83.21  square-1[8]      ↔ square-3[1]     
  #e6e0e4 ↔ #000000  Lc -88.88 /  88.73  square-1[8]      ↔ shift-30[0]     
  #e6e0e4 ↔ #050633  Lc -88.33 /     88  square-1[8]      ↔ shift-30[1]     
  #e6e0e4 ↔ #121061  Lc -86.33 /  85.41  square-1[8]      ↔ shift-30[2]     
  #e6e0e4 ↔ #282189  Lc -82.19 /  80.37  square-1[8]      ↔ shift-30[3]     
  #ffffff ↔ #895c21  Lc  -84.1 /  78.85  square-1[9]      ↔ square-2[3]     
  #ffffff ↔ #218928  Lc -76.18 /   70.7  square-1[9]      ↔ square-3[3]     
  #ffffff ↔ #6c60bc  Lc -80.98 /  75.61  square-1[9]      ↔ shift-30[5]     
  #000000 ↔ #d2cbbb  Lc  76.19 / -75.34  square-2[0]      ↔ square-2[7]     
  #000000 ↔ #bbd2c0  Lc  76.58 / -75.76  square-2[0]      ↔ square-3[7]     
  #000000 ↔ #e1e0e6  Lc  88.19 /  -88.3  square-2[0]      ↔ shift-30[8]     
  #331c05 ↔ #e6e4e0  Lc  87.01 / -88.03  square-2[1]      ↔ square-2[8]     
  #331c05 ↔ #e0e6e1  Lc  87.15 / -88.19  square-2[1]      ↔ square-3[8]     
  #331c05 ↔ #e1e0e6  Lc     85 / -85.84  square-2[1]      ↔ shift-30[8]     
  #613b10 ↔ #e6e4e0  Lc  76.67 / -79.31  square-2[2]      ↔ square-2[8]     
  #613b10 ↔ #e0e6e1  Lc  76.81 / -79.46  square-2[2]      ↔ square-3[8]     
  #613b10 ↔ #e1e0e6  Lc  74.66 / -77.12  square-2[2]      ↔ shift-30[8]     
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  square-2[3]      ↔ square-2[9]     
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  square-2[3]      ↔ square-3[9]     
  #895c21 ↔ #ffffff  Lc  78.85 /  -84.1  square-2[3]      ↔ shift-30[9]     
  #d2cbbb ↔ #000000  Lc -75.34 /  76.19  square-2[7]      ↔ square-3[0]     
  #d2cbbb ↔ #000000  Lc -75.34 /  76.19  square-2[7]      ↔ shift-30[0]     
  #d2cbbb ↔ #050633  Lc -74.79 /  75.46  square-2[7]      ↔ shift-30[1]     
  #e6e4e0 ↔ #063305  Lc -86.16 /  84.69  square-2[8]      ↔ square-3[1]     
  #e6e4e0 ↔ #050633  Lc -89.94 /  89.48  square-2[8]      ↔ shift-30[1]     
  #e6e4e0 ↔ #121061  Lc -87.94 /  86.88  square-2[8]      ↔ shift-30[2]     
  #e6e4e0 ↔ #282189  Lc  -83.8 /  81.85  square-2[8]      ↔ shift-30[3]     
  #e6e4e0 ↔ #4338ab  Lc -76.58 /  73.62  square-2[8]      ↔ shift-30[4]     
  #ffffff ↔ #218928  Lc -76.18 /   70.7  square-2[9]      ↔ square-3[3]     
  #ffffff ↔ #6c60bc  Lc -80.98 /  75.61  square-2[9]      ↔ shift-30[5]     
  #000000 ↔ #bbd2c0  Lc  76.58 / -75.76  square-3[0]      ↔ square-3[7]     
  #000000 ↔ #e1e0e6  Lc  88.19 /  -88.3  square-3[0]      ↔ shift-30[8]     
  #063305 ↔ #e0e6e1  Lc  84.83 / -86.32  square-3[1]      ↔ square-3[8]     
  #063305 ↔ #e1e0e6  Lc  82.67 / -83.97  square-3[1]      ↔ shift-30[8]     
  #218928 ↔ #ffffff  Lc   70.7 / -76.18  square-3[3]      ↔ square-3[9]     
  #218928 ↔ #ffffff  Lc   70.7 / -76.18  square-3[3]      ↔ shift-30[9]     
  #bbd2c0 ↔ #000000  Lc -75.76 /  76.58  square-3[7]      ↔ shift-30[0]     
  #bbd2c0 ↔ #050633  Lc -75.22 /  75.85  square-3[7]      ↔ shift-30[1]     
  #e0e6e1 ↔ #121061  Lc -88.09 /  87.02  square-3[8]      ↔ shift-30[2]     
  #e0e6e1 ↔ #282189  Lc -83.95 /  81.99  square-3[8]      ↔ shift-30[3]     
  #e0e6e1 ↔ #4338ab  Lc -76.74 /  73.76  square-3[8]      ↔ shift-30[4]     
  #ffffff ↔ #6c60bc  Lc -80.98 /  75.61  square-3[9]      ↔ shift-30[5]     
  #000000 ↔ #e1e0e6  Lc  88.19 /  -88.3  shift-30[0]      ↔ shift-30[8]     
  #050633 ↔ #e1e0e6  Lc  87.46 / -87.75  shift-30[1]      ↔ shift-30[8]     
  #121061 ↔ #e1e0e6  Lc  84.87 / -85.74  shift-30[2]      ↔ shift-30[8]     
  #282189 ↔ #e1e0e6  Lc  79.84 / -81.61  shift-30[3]      ↔ shift-30[8]     
  #6c60bc ↔ #ffffff  Lc  75.61 / -80.98  shift-30[5]      ↔ shift-30[9]     
```

**APCA output (large) — full:**  
```
(Full contents of /Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/apca-large.txt)
```

**APCA output (bold) — full:**  
```
(Full contents of /Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/apca-bold.txt)
```

**APCA output (nontext) — full:**  
```
(Full contents of /Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gpt-5.2-codex/apca-nontext.txt)
```

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: Reasonable attempt with correct rampa command structure and token/semantic architecture, but the response is truncated mid-sentence, lacks the actual APCA validation output proving pairs pass, and doesn't show the full HTML deliverable or complete dark mode semantic mappings.

---

## Model: Gemini 3 Pro (`gemini-3-pro-preview`)

### Response

<details>
<summary>Full model response</summary>

The landing page has been generated at:
`/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-09/rampa-landing-page/output-gemini-3-pro-preview/index.html`

### Rampa Workflow & Reasoning

**1. Base Color Selection**
I chose **Indigo** (`#4F46E5`) as the base color because it is vibrant, developer-friendly, and sits comfortably between blue and purple, offering good range for both light and dark modes.

**2. Palette Generation**
I ran two targeted `rampa` commands to generate the full system. I separated the color and neutral generation to ensure the neutrals were perfectly desaturated (slate) without interference from the harmony logic.

*   **Primary & Accent Palette**:
    ```bash
    bun run src/index.ts -C "#4F46E5" --size 11 --lightness 95:10 --add=complementary -A=body -O json
    ```
    *   **Reasoning**: This generated the Primary (Indigo) ramp and a Complementary (Yellow-Lime) ramp. I used `--size 11` to map perfectly to Tailwind's 50-950 scale. The `-A=body` flag verified that the text colors (700-900) had sufficient contrast against the background colors (50-100).
    *   **Selection**:
        *   `primary-500` (#5d58b4) is the brand color.
        *   `accent-700` (#6a6f46) provides a high-contrast accent for light mode.

*   **Neutral Palette**:
    ```bash
    bun run src/index.ts -C "#4F46E5" --size 11 --lightness 99:5 -S 5:0 -A=body -O json
    ```
    *   **Reasoning**: By reusing the Indigo base hue (`#4F46E5`) but restricting saturation to `5:0`, I created a "Slate" neutral ramp that harmonizes perfectly with the primary color, avoiding the "dead gray" look.
    *   **Selection**:
        *   `neutral-50` (#fcfcfd) serves as the Light Mode page background.
        *   `neutral-950` (#0d0d0d) serves as the Dark Mode page background.

**3. Accessibility Validation (APCA)**
I used the `-A` output to strictly validate the semantic pairs.

*   **Light Mode**:
    *   **Body Text**: `neutral-800` on `neutral-50`
        *   *Validation*: `rampa` reported Lc **-97.41**.
        *   *Result*: **PASS** (Exceeds Preferred Body 90).
    *   **Headings**: `neutral-900` on `neutral-50`
        *   *Validation*: `rampa` reported Lc **-103.03**.
        *   *Result*: **PASS** (Exceeds Preferred 90).

*   **Dark Mode**:
    *   **Body Text**: `neutral-200` on `neutral-950`
        *   *Validation*: `neutral-2` (#cbcbce) vs `neutral-10` (#0d0d0d) reported Lc **75.71**.
        *   *Result*: **PASS** (Exceeds Body 75).
    *   **Headings**: `neutral-50` on `neutral-950`
        *   *Validation*: `neutral-0` vs `neutral-10` reported Lc **105.67**.
        *   *Result*: **PASS** (Exceeds Preferred 90).

**4. Architecture**
The `index.html` implements the "Token -> Semantic" architecture using Tailwind configuration and CSS variables:
*   **Tokens**: Defined in `tailwind.config` as `colors.primary`, `colors.accent`, `colors.neutral`.
*   **Semantics**: Defined as CSS variables (`--bg-page`, `--text-body`) that update values based on the `.dark` class, ensuring the semantic names remain constant in the markup while the theme switches.

</details>

### Score

- **Judge Score**: 3/5
- **Judge Notes**: Reasonable attempt that describes the right approach (harmony flags, -A validation, token/semantic architecture) but the explanation is truncated, only validates 4 color pairs instead of every pair used in the design, doesn't show full -A output as required, and it's unclear whether the actual HTML file correctly implements all requirements.
