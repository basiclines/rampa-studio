# Eval: fundure-website

- **Date**: 2026-02-07T00:03:22.643Z
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

Done. Here's the summary:

---

### Rampa Commands Used

**Command 1 — Primary + Harmonies** (generates 5 ramps in one call):
```
rampa -C "#1e2a4a" --size=10 --add=complementary --add=analogous --add=split-complementary -O json
```
- **Base ramp** → `primary-*` tokens (deep navy brand color)
- **Complementary** → `accent-*` tokens (warm gold — the main accent)
- **Analogous** → `secondary-*` tokens (deep violet)
- **Split-complementary-1** → `warm-*` tokens (terracotta)
- **Split-complementary-2** → `success-*` tokens (olive/lime)

**Command 2 — Neutrals** (desaturated base):
```
rampa -C "#1e2a4a" --size=12 -S 15:5 -H 0:0 -O json
```
- Low saturation (15→5%) with no hue shift → `neutral-*` tokens for text, surfaces, borders

### Color Architecture

**Token layer**: 6 ramps (primary, accent, secondary, warm, success, neutral) defined in Tailwind config — all values from rampa output.

**Semantic layer**: CSS custom properties that switch between dark/light mode:
- `surface`, `surface-alt`, `surface-hover` → neutral tokens
- `on-surface`, `on-surface-muted` → neutral tokens (inverted per mode)
- `brand`, `brand-hover` → accent (gold) tokens
- `border` → neutral tokens

HTML uses only semantic names (`bg-surface`, `text-on-surface`, `text-brand`, etc.).

### Artifact
`/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/fundure-website/output-claude-opus-4.6/index.html`

</details>

### Score

- **Judge Score**: 5/5
- **Judge Notes**: All hex values in the HTML exactly match verified rampa output from just 2 efficient commands using --add harmony flags; token/semantic color architecture is properly implemented with CSS custom properties for dark/light mode switching, and the HTML exclusively uses semantic names.

---

## Model: GPT-5.2 Codex (`gpt-5.2-codex`)

### Response

<details>
<summary>Full model response</summary>

Rampa commands: `cd /Users/ismael/Developer/rampa-studio/cli && PATH="./dist:$PATH" rampa --help` (discover flags) and `cd /Users/ismael/Developer/rampa-studio/cli && PATH="./dist:$PATH" rampa --color "midnightblue" --size 11 --add=complementary --add=triadic --add=square -O json --no-preview` (single harmony run for all ramps).  
Color selection: primary + neutral tokens map the base ramp (#000000→#ffffff as 950→50), accent tokens map the complementary ramp (olive/gold values), secondary tokens map square-3 (teal values), and semantic vars reference those token steps for light (50/100/200) vs dark (950/900/800) contexts.  
Artifact: `/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/fundure-website/output-gpt-5.2-codex/index.html`; tests: `bun test` and `bun run build` (baseline + after).

</details>

### Score

- **Judge Score**: 4/5
- **Judge Notes**: All colors sourced from a single efficient rampa command with harmony flags, token→semantic architecture correctly implemented via CSS custom properties, dark/light toggle works, all content present; minor deductions for neutral tokens being duplicated from primary (wasted ramp) and the color-to-token explanation being too brief.

---

## Model: Gemini 3 Pro (`gemini-3-pro-preview`)

### Response

<details>
<summary>Full model response</summary>

I have generated the static website for Fundure Ventures.

### Rampa Workflow & Color Selection

I ran a single, efficient `rampa` command to generate a mathematically harmonious palette based on a sophisticated dark slate base.

**Command:**
```bash
bun run src/index.ts -C "#0f172a" --size 11 --add complementary --add triadic
```

**Reasoning:**
1.  **Base (`#0f172a`)**: Selected a deep "Slate 900" / Dark Navy as the anchor. This provides a sophisticated, trustworthy foundation typical of venture capital.
2.  **Harmony (`complementary`)**: Generated a Gold/Bronze scale. This serves as a perfect accent color that implies value and prestige, contrasting beautifully with the navy base.
3.  **Harmony (`triadic`)**: Generated supporting Red and Green scales (unused in the main UI but available for system states like errors/success if needed).

**Token Mapping:**
I mapped the raw rampa output to semantic design tokens in the Tailwind config:

*   **Primary/Neutral Ramp (`base`)**: Used for page backgrounds, surfaces, and typography.
    *   *Light Mode Surface*: `base-100` (`#e3e4e8`)
    *   *Dark Mode Background*: `base-950` (`#000000`) / `base-900` (`#031630`)
*   **Accent Ramp (`gold`)**: Derived from the complementary harmony.
    *   *Accent Color*: `gold-600` (`#a37b29`) for light mode, `gold-400` (`#c2ac70`) for dark mode.

### Deliverables

The complete website is contained in a single file at:
`/Users/ismael/Developer/rampa-studio/cli/evals/results/2026-02-07/fundure-website/output-gemini-3-pro-preview/index.html`

**Features:**
*   **Semantic Color System**: Defined in Tailwind config (`bg-page-light` / `dark:bg-page-dark`).
*   **Dark Mode**: Fully functional toggle that persists preference.
*   **Typography**: "Plus Jakarta Sans" for a modern, geometric tech feel.
*   **Icons**: Phosphor Icons via CDN.
*   **Responsive**: Mobile-first layout with a grid system for the three pillars.

</details>

### Score

- **Judge Score**: 4/5
- **Judge Notes**: All colors correctly sourced from a single efficient rampa command with harmony flags, token and semantic layers are present in Tailwind config, and the HTML is well-structured with dark mode, icons, fonts, and all required content — but the semantic layer uses light/dark suffixes requiring explicit dark: variants in HTML rather than CSS-variable-based auto-switching semantics, and the requirement to run `rampa --help` first was not explicitly demonstrated.
