# Slack Minimal Theme

## Command
```bash
bun run src/index.ts --color "#64748B" --add=triadic --saturation 40:5 --lightness 5:98 --size 10 --format hex --no-preview
```

## Rationale
Used a Cool Gray base (`#64748B`) with reduced saturation (`40:5`) and full lightness range (`5:98`) to create a professional, minimal "Nordic" palette. Added `triadic` harmony to find a subtle rose accent.

## Mapping
| Slot | Color | Source | Notes |
|------|-------|--------|-------|
| Column BG | `#192835` | Base #3 | Deep muted slate for contrast |
| Menu BG Hover | `#2c4257` | Base #4 | Subtle step up |
| Active Item | `#425a76` | Base #5 | Lighter slate to indicate selection |
| Active Item Text | `#fafafa` | Base #11 | High contrast white |
| Hover Item BG | `#2c4257` | Base #4 | Consistent with menu hover |
| Text Color | `#bec3cd` | Base #9 | Soft light gray for readability |
| Mention Badge | `#935972` | Triadic-1 #6 | Muted rose accent from harmony |
| Mention Badge Text | `#fafafa` | Base #11 | White text on rose |
| Top Nav BG | `#192835` | Base #3 | Matches column |
| Top Nav Text | `#fafafa` | Base #11 | Matches active text |

## Output
```
#192835,#2c4257,#425a76,#fafafa,#2c4257,#bec3cd,#935972,#fafafa,#192835,#fafafa
```
