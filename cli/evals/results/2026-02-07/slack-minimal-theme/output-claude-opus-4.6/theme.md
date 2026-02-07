# Slack Minimal Theme — Generated with rampa

## Rampa Commands Used

### Command 1: Neutral gray-blue ramp (backgrounds & text)

```bash
rampa -C "#64748B" --size=10 -L 5:97 -S 15:3 --add=complementary -O json --no-preview
```

**Why:** Starting from a cool slate gray (`#64748B`), this generates 10 steps from near-black to near-white with very low saturation (15→3%), giving us clean neutral grays for backgrounds, text, and hover states. The `--add=complementary` was included to explore warm neutral options but wasn't needed for the final palette.

**Base ramp output:**
| Index | Hex       | Role in theme         |
|-------|-----------|-----------------------|
| 0     | `#0b0d0f` | —                     |
| 1     | `#22272c` | **Top Nav Text** (#10)|
| 2     | `#394149` | **Text Color** (#6)   |
| 3     | `#515a65` | —                     |
| 4     | `#6a7380` | —                     |
| 5     | `#868d98` | —                     |
| 6     | `#a3a7af` | —                     |
| 7     | `#c0c2c7` | —                     |
| 8     | `#dcdddf` | —                     |
| 9     | `#f7f7f8` | **Column BG** (#1), **Top Nav BG** (#9) |

### Command 2: Blue accent + coral accent ramp

```bash
rampa -C "#4F7CAC" --size=8 -L 20:95 -S 60:20 --add=shift:150 -O json --no-preview
```

**Why:** Starting from a muted steel blue (`#4F7CAC`), this generates a blue ramp with decent saturation (60→20%) for active states and light hover tints. The `--add=shift:150` creates a mathematically related warm coral ramp (150° hue shift) for the notification badge — a single command producing both accent families.

**Blue ramp output (base):**
| Index | Hex       | Role in theme              |
|-------|-----------|----------------------------|
| 0     | `#143c52` | —                          |
| 1     | `#245779` | **Active Item** (#3)       |
| 2     | `#366f9d` | —                          |
| 3     | `#5186b9` | —                          |
| 4     | `#7d9dc3` | —                          |
| 5     | `#a6b8d1` | —                          |
| 6     | `#cdd4e1` | **Menu BG Hover** (#2), **Hover Item BG** (#5) |
| 7     | `#f0f1f5` | **Active Item Text** (#4)  |

**Coral ramp output (shift:150):**
| Index | Hex       | Role in theme                 |
|-------|-----------|-------------------------------|
| 0     | `#52141d` | —                             |
| 1     | `#79242c` | —                             |
| 2     | `#9d363b` | —                             |
| 3     | `#b95151` | **Mention Badge** (#7)        |
| 4     | `#c3807d` | —                             |
| 5     | `#d1aaa6` | —                             |
| 6     | `#e1d0cd` | —                             |
| 7     | `#f5f1f0` | **Mention Badge Text** (#8)   |

## Color Mapping (all 10 slots)

| # | Slack Slot          | Hex       | Source                          |
|---|---------------------|-----------|---------------------------------|
| 1 | Column BG           | `#f7f7f8` | Neutral ramp index 9            |
| 2 | Menu BG Hover       | `#cdd4e1` | Blue ramp index 6               |
| 3 | Active Item         | `#245779` | Blue ramp index 1               |
| 4 | Active Item Text    | `#f0f1f5` | Blue ramp index 7               |
| 5 | Hover Item BG       | `#cdd4e1` | Blue ramp index 6               |
| 6 | Text Color          | `#394149` | Neutral ramp index 2            |
| 7 | Mention Badge       | `#b95151` | Coral (shift:150) ramp index 3  |
| 8 | Mention Badge Text  | `#f5f1f0` | Coral (shift:150) ramp index 7  |
| 9 | Top Nav BG          | `#f7f7f8` | Neutral ramp index 9            |
| 10| Top Nav Text        | `#22272c` | Neutral ramp index 1            |

## Design Rationale

- **Light, airy feel**: Near-white backgrounds (`#f7f7f8`) with cool-tinted hover states (`#cdd4e1`) keep the UI breathing.
- **Single accent color**: Deep slate blue (`#245779`) for the active channel creates a clear focal point without overwhelm.
- **Coral badge**: The `shift:150` harmony produces a warm coral (`#b95151`) that's mathematically complementary to the blue, providing natural visual contrast for notifications.
- **High contrast text**: Dark charcoal (`#394149`) on light backgrounds and near-white (`#f0f1f5`) on the blue active item ensure strong readability.
- **Two commands, ten colors**: Only 2 rampa commands generated all colors needed.

## Final Theme String

```
#f7f7f8,#cdd4e1,#245779,#f0f1f5,#cdd4e1,#394149,#b95151,#f5f1f0,#f7f7f8,#22272c
```

Paste this into Slack → Preferences → Themes → Custom Theme.
