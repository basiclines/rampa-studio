Create a custom VS Code color theme that is a purple-accented variant of GitHub Dark Dimmed.

## Requirements

1. **Discover rampa first**: Run `rampa --help` to understand all available commands and flags before generating any colors.

2. **Every accent/highlight color must come from rampa output**: Do not invent or hardcode accent hex codes. Use rampa to generate the purple palette and all derived colors. The base neutral/background colors from GitHub Dark Dimmed can be kept as-is.

3. **Use mathematical color combinations**: Use rampa's built-in harmony flags (`--add=complementary`, `--add=triadic`, `--add=square`, `--add=shift:N`, etc.) to generate mathematically related color palettes from the purple base. This ensures all accent colors are harmonious.

4. **Efficient command usage**: Prefer fewer rampa commands with `--add` flags to generate multiple related ramps at once.

## GitHub Dark Dimmed Base Reference

The theme should preserve the neutral structure of GitHub Dark Dimmed:

- **Editor background**: `#22272e`
- **Editor foreground**: `#adbac7`
- **Sidebar/panel background**: `#1c2128`
- **Line highlight**: `#2d333b`
- **Selection**: `#373e47`
- **Border**: `#444c56`
- **Comments**: `#768390`
- **Cursor**: `#cdd9e5`
- **Line numbers**: `#636e7b`

The original uses blue as primary accent (`#539bf5` for links, buttons, focus) and these syntax colors:
- **Strings**: `#96d0ff` (light blue)
- **Keywords**: `#f47067` (red)
- **Functions**: `#dcbdfb` (purple — already!)
- **Variables**: `#6cb6ff` (blue)
- **Constants**: `#6cb6ff` (blue)
- **Types**: `#f69d50` (orange)

## What to Change

Replace the **blue accent** (`#539bf5`, `#6cb6ff`, `#96d0ff`) with a **purple-based palette** from rampa. Then regenerate all related accent colors (focus rings, button backgrounds, link colors, badge backgrounds, etc.) to match the new purple accent. Syntax highlighting colors that were blue should shift to purple tones, while keeping keywords (red), types (orange), and comments (gray) in their original hue families — but regenerated through rampa for harmonic consistency.

## VS Code Theme Format

The theme is a JSON file with this structure:

```json
{
  "$schema": "vscode://schemas/color-theme",
  "name": "GitHub Dark Dimmed Purple",
  "type": "dark",
  "colors": {
    "editor.background": "#22272e",
    "editor.foreground": "#adbac7",
    "activityBar.background": "#1c2128",
    "statusBar.background": "#1c2128",
    ...
  },
  "tokenColors": [
    {
      "scope": ["comment"],
      "settings": { "foreground": "#768390" }
    },
    {
      "scope": ["string"],
      "settings": { "foreground": "#..." }
    },
    ...
  ]
}
```

Key areas to cover in `colors`:
- `editor.*`, `editorCursor.*`, `editorLineNumber.*`
- `activityBar.*`, `sideBar.*`, `statusBar.*`, `titleBar.*`
- `tab.*`, `panel.*`, `terminal.*`
- `button.*`, `badge.*`, `focusBorder`
- `gitDecoration.*`, `diffEditor.*`
- `list.*`, `input.*`, `dropdown.*`

Key `tokenColors` scopes:
- `comment`, `string`, `keyword`, `variable`, `constant`, `entity.name.function`, `entity.name.type`, `storage`, `support`, `markup.*`

## Deliverable

Output the complete VS Code theme JSON file. Show the rampa commands you used and explain which output colors replaced which original GitHub Dark Dimmed values.
