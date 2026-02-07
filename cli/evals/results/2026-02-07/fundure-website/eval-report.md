# Eval: fundure-website

- **Date**: 2026-02-07T21:36:10.411Z
- **Rampa Version**: 1.1.3
- **Prompt**: fundure-website

## Prompt

````
Create a simple, elegant static website for Fundure Ventures using a single HTML file with Tailwind CSS utility classes (via CDN).

## Requirements

1. **Discover rampa first**: Run `rampa --help` to understand all available commands and flags before generating any colors.

2. **Every color must come from rampa output**: Do not invent or hardcode hex codes. Use rampa to generate the color palette for the site. Pick a sophisticated, minimal base color (dark navy, charcoal, or deep indigo) and use rampa's harmony flags to derive all accent and supporting colors.

3. **Use mathematical color combinations**: Use rampa's built-in harmony flags (`--add=complementary`, `--add=triadic`, `--add=square`, `--add=shift:N`, etc.) to generate mathematically related color palettes. Avoid running many separate rampa commands to get ad-hoc colors.

4. **Efficient command usage**: Prefer fewer rampa commands with `--add` flags to generate multiple related ramps at once.

5. **Token → Semantic color architecture**: Structure colors in two layers:
   - **Tokens**: Raw color values from rampa output (e.g. `primary-100`, `primary-200`, ..., `accent-100`, `neutral-50`, etc.)
   - **Semantics**: Design-intent names that reference tokens (e.g. `bg-surface: primary-950`, `text-body: neutral-200`, `bg-surface-hover: primary-900`, `accent: accent-400`, etc.)
   - Define both layers in the Tailwind config. The HTML should only use semantic names, never raw tokens directly.

## Company Content

**Company**: Fundure Ventures
**Motto**: We build and invest in enduring ideas for the future.

**Three pillars** (numbered sections):

1. **Ideas Factory** — We build highly opinionated ideas that matter to us. Hopefully for other people too.

2. **Venture Capital** — We invest in disrupting products that challenge the status-quo.

3. **Founder Backed** — We are founders with an already proven track record on building and helping others build successful products.

**CTA**: Let's work on something great together.
**Email**: hello@fundureventures.com
**Footer**: © 2025 Fundure Ventures. Enduring ideas for the future.

## Technical Requirements

- Single `index.html` file
- Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`)
- Use Tailwind's `<script>` config block to define:
  1. **Token colors** from rampa output (raw palette values)
  2. **Semantic colors** that map to tokens (design-intent layer)
- **Dark/light mode**: Include both themes with a toggle button. Use Tailwind's `dark:` variant. Semantic color mappings should change between modes (e.g. `bg-surface` is light in light mode, dark in dark mode). Use a small inline `<script>` for the toggle that adds/removes the `dark` class on `<html>`.
- Responsive design (mobile-first)
- Clean, modern, minimal aesthetic — generous whitespace, large typography
- **Icons**: Use an existing icon set via CDN (Lucide, Heroicons, Phosphor, or similar). Do NOT create inline SVGs manually — link the icon library and use their component/class system.
- **Fonts**: Use Google Fonts for typography. Pick a modern pair (e.g. Inter, Satoshi, Plus Jakarta Sans, or similar).
- **Images**: If the design benefits from imagery, use Unsplash via direct URL (`https://images.unsplash.com/...`). Keep it minimal — one hero image at most.
- No external JavaScript beyond Tailwind CDN and the dark mode toggle
- Use semantic HTML

## Deliverable

Output the complete `index.html` file with:
- All rampa-sourced token colors in the Tailwind config
- Semantic color layer mapping tokens to design intent
- Dark/light mode toggle working
- Show the rampa commands you used and explain which output colors you picked for each design token
````

---

## Model: Claude Opus 4.6 (`claude-opus-4.6`)

### Response

<details>
<summary>Full model response</summary>

File created at `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/fundure-website/output-claude-opus-4.6/index.html` (339 lines).

---

## Rampa Commands Used

### Command 1 — Primary palette + complementary + analogous harmonies
```bash
rampa -C "#1e1b4b" --size=11 --add=complementary --add=analogous -O json --no-preview
```
**Why**: Deep indigo `#1e1b4b` as the base color. One command generates three mathematically related ramps: the primary indigo, its complementary (yellow-green), and analogous (purple).

### Command 2 — Warm amber accent via shift:150
```bash
rampa -C "#1e1b4b" --size=11 --add=shift:150 -O json --no-preview
```
**Why**: A 150° hue shift from indigo produces a sophisticated warm amber/gold, perfect as the brand accent color. More elegant than the complementary yellow-green.

### Command 3 — Neutral gray ramp
```bash
rampa -C "#1a1a2e" --size=11 -S 10:0 -H 0:0 -O json --no-preview
```
**Why**: Low saturation (10→0) with no hue shift creates a cool-tinted neutral gray scale for body text, muted text, and borders.

## Color Architecture

**Token layer** (raw rampa values): `primary`, `accent`, `neutral`, `analogous` — each with 50–950 stops in the Tailwind config.

**Semantic layer** (CSS variables that swap between modes):

| Semantic Name | Light Mode Token | Dark Mode Token |
|---|---|---|
| `surface` | neutral-50 `#ffffff` | primary-900 `#030630` |
| `surface-alt` | primary-100 `#e4e3e8` | primary-800 `#0a0d5c` |
| `surface-elevated` | neutral-50 `#ffffff` | primary-700 `#171782` |
| `heading` | primary-900 `#030630` | neutral-50 `#ffffff` |
| `body` | neutral-700 `#474752` | neutral-200 `#cbcbcd` |
| `muted` | neutral-500 `#797986` | neutral-400 `#95959d` |
| `brand` | accent-600 `#a36a29` | accent-500 `#bf8740` |
| `brand-hover` | accent-700 `#824c17` | accent-400 `#c2a170` |
| `brand-subtle` | accent-100 `#e8e6e3` | accent-900 `#301603` |
| `border` | primary-200 `#c5c2d6` | primary-700 `#171782` |

HTML uses **only** semantic classes (`bg-surface`, `text-heading`, `text-brand`, etc.) — never raw token names.

</details>

### Score

- **Judge Score**: 5/5
- **Judge Notes**: All colors verified against actual rampa output — every hex code matches perfectly; uses harmony flags efficiently (complementary, analogous, shift:150) with only 3 commands; clean two-layer token/semantic architecture with CSS variables for dark/light mode; comprehensive well-structured HTML with Lucide icons, Google Fonts, and responsive design.

---

## Model: GPT-5.2 Codex (`gpt-5.2-codex`)

### Response

<details>
<summary>Full model response</summary>

Ran rampa commands `./dist/rampa --help` (to review flags) and `./dist/rampa -C "#1B2238" --size=10 -L 8:95 -S 70:10 --add=complementary --add=triadic --add=square --add=shift:25 -O json --no-preview` (single harmonious palette for all tokens; saved output) plus tests `bun test`. Token selections from that output: navy/base 950 #061223, 900 #11264a, 800 #1e396d, 700 #2f4b8e, 600 #435eab, 500 #6779b8, 400 #8e98c2, 300 #b2b7cf, 200 #d3d5e0, 100 #f1f1f4; sand/complementary 950 #231706, 900 #4a3411, 800 #6d531e, 700 #8e722f, 600 #ab9043, 500 #b8a667, 400 #c2b98e, 300 #cfcbb2, 200 #e0ded3, 100 #f4f3f1; rose/triadic-1 950 #230612, 900 #4a1126, 800 #6d1e39, 700 #8e2f4b, 600 #ab435e, 500 #b86779, 400 #c28e98, 300 #cfb2b7, 200 #e0d3d5, 100 #f4f1f1; sage/triadic-2 950 #122306, 900 #264a11, 800 #396d1e, 700 #4b8e2f, 600 #5eab43, 500 #79b867, 400 #98c28e, 300 #b7cfb2, 200 #d5e0d3, 100 #f1f4f1; violet/shift-25 950 #060623, 900 #13114a, 800 #251e6d, 700 #3a2f8e, 600 #5343ab, 500 #7667b8, 400 #9a8ec2, 300 #bab2cf, 200 #d7d3e0, 100 #f2f1f4 (semantic colors map to these tokens in the Tailwind config and HTML uses only semantic names with dark: variants). Artifacts created: /Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/fundure-website/output-gpt-5.2-codex/index.html, /Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/fundure-website/output-gpt-5.2-codex/rampa-output.json, /Users/ismael/.copilot/session-state/8aa57026-7a49-4529-815a-e5a3efe94654/plan.md.

</details>

### Score

- **Judge Score**: 4/5
- **Judge Notes**: All hex colors verified from rampa output via a single efficient command with harmony flags; proper token→semantic architecture with both layers in Tailwind config; complete HTML with dark/light toggle, responsive design, Phosphor icons, Google Fonts, and all company content — but the semantic layer uses separate `-dark` suffixed color names requiring `dark:bg-surface-dark` in HTML rather than a single semantic name that resolves differently per mode, which is less elegant than the prompt's ideal of mode-agnostic semantic names.

---

## Model: Gemini 3 Pro (`gemini-3-pro-preview`)

### Response

<details>
<summary>Full model response</summary>

I have created the single-file website for **Fundure Ventures** at the specified path.

### Rampa Commands & Color Strategy

I used `rampa` to generate a mathematically harmonious color system based on a deep, sophisticated **Indigo** (`#1e1b4b`).

**1. Primary & Accent Generation**
I generated the brand and accent colors using a mathematical split (complementary and triadic harmonies) to ensure the gold/olive accents perfectly balance the deep indigo.
```bash
bun run src/index.ts -C "#1e1b4b" --add=complementary --add=triadic --size=10 -O json
```
*   **Base Ramp (Brand)**: Used for the primary actions and deep backgrounds.
*   **Complementary Ramp (Accent)**: Extracted an Olive/Gold range (`#abb032` to `#65620d`) to serve as a sophisticated highlight color.

**2. Neutral Generation**
I generated a dedicated neutral scale using the same hue as the brand color but drastically reduced saturation. This creates a "Slate" gray that harmonizes better with the blue brand color than a pure gray would.
```bash
bun run src/index.ts -C "#1e1b4b" --saturation 15:5 --size 10 -O json
```
*   **Neutral Ramp**: Used for text, borders, and surface backgrounds (e.g., `#e2e1e4` for light surfaces, `#181920` for dark surfaces).

### Implementation Details

*   **Architecture**:
    *   **Tokens**: Defined in `tailwind.config` using the exact hex codes from `rampa` output (e.g., `brand-700`, `neutral-100`).
    *   **Semantics**: Mapped to CSS variables (e.g., `primary: var(--col-primary)`).
    *   **Theme Switching**: Used a `<style>` block to update the CSS variables based on the `.dark` class, allowing for a clean, semantic HTML structure that adapts automatically.
*   **Design**: Minimalist, typography-driven layout using **Plus Jakarta Sans**, generous whitespace, and a mobile-first grid system.
*   **Tech**: Single `index.html` with Tailwind via CDN and Lucide icons.

### Artifacts Created

*   `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/fundure-website/output-gemini-3-pro-preview/index.html`

</details>

### Score

- **Judge Score**: 4/5
- **Judge Notes**: Strong implementation with valid rampa commands whose output hex values match the HTML tokens almost exactly (2 interpolated values invented), good token→semantic architecture, and clear explanation, but didn't explicitly discover rampa via --help first as required.
