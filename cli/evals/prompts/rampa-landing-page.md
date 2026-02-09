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
