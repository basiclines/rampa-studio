Create a clean, modern, minimal Slack sidebar theme using rampa-cli.

## Requirements

1. **Discover rampa first**: Run `rampa --help` to understand all available commands and flags before generating any colors.

2. **Every color must come from rampa output**: Do not invent or hardcode hex codes. Every color value in the final theme must be a direct output from a rampa command.

3. **Use mathematical color combinations**: Use rampa's built-in harmony flags (`--add=complementary`, `--add=triadic`, `--add=square`, `--add=shift:N`, etc.) to generate mathematically related color palettes. Avoid running many separate rampa commands to get ad-hoc colors.

4. **Efficient command usage**: Prefer fewer rampa commands with `--add` flags to generate multiple related ramps at once, rather than running rampa many times with different base colors.

5. **Design intent**: The theme should feel clean, airy, and minimal — think modern SaaS design. Use a neutral/cool base (light gray, soft white, or muted blue-gray) with a single accent color for active states and badges. High contrast for readability. No bright or saturated backgrounds.

## Slack Theme Format

Slack custom themes are 10 comma-separated hex values pasted into Preferences > Themes > Custom:

```
#COLUMN_BG,#MENU_BG_HOVER,#ACTIVE_ITEM,#ACTIVE_ITEM_TEXT,#HOVER_ITEM_BG,#TEXT_COLOR,#MENTION_BADGE,#MENTION_BADGE_TEXT,#TOP_NAV_BG,#TOP_NAV_TEXT
```

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
```
#3F0E40,#350D36,#1164A3,#FFFFFF,#350D36,#FFFFFF,#2BAC76,#CD2553,#350d36,#FFFFFF
```

## Deliverable

Output the complete Slack theme as a single comma-separated line ready to paste into Slack. Show the rampa commands you used and explain which output colors you picked for each of the 10 theme slots.
