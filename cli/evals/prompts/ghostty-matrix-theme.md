Create a custom Ghostty terminal theme inspired by the Matrix movie aesthetic (green phosphor text on a dark background).

## Requirements

1. **Discover rampa first**: Run `rampa --help` to understand all available commands and flags before generating any colors.

2. **Every color must come from rampa output**: Do not invent or hardcode hex codes. Every color value in the final theme must be a direct output from a rampa command.

3. **Use mathematical color combinations**: Use rampa's built-in harmony flags (`--add=complementary`, `--add=triadic`, `--add=square`, `--add=shift:N`, etc.) to generate mathematically related color palettes. Avoid running many separate rampa commands to get ad-hoc colors.

4. **Efficient command usage**: Prefer fewer rampa commands with `--add` flags to generate multiple related ramps at once, rather than running rampa many times with different base colors.

5. **Pick a Matrix green as your base color** and build the entire theme from it using rampa's color math.

## Ghostty Theme Format

The theme file uses `key = value` syntax:

```
background = #000000
foreground = #00ff41
cursor-color = #00ff41
selection-background = #003300
selection-foreground = #00ff41
palette = 0=#000000
palette = 1=#ff0000
...
palette = 15=#ffffff
```

You need: background, foreground, cursor-color, selection-background, selection-foreground, and palette entries 0-15 (the 16 ANSI colors: 8 normal + 8 bright variants).

## Deliverable

Output the complete Ghostty theme file with every color sourced from rampa commands. Show the rampa commands you used and explain which output colors you picked for each theme slot.
