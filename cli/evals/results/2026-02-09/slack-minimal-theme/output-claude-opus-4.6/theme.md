# Minimal Slack Sidebar Theme — Generated with rampa-cli

## Rampa Commands Used

### Command 1: Neutral blue-gray ramp + warm shift accent
```bash
rampa -C "#4f8cc9" --size=8 -L 97:20 -S 5:55 --hue="-5:5" --add=shift:150 --no-preview -O json
```

**Purpose**: Generate 8 neutral blue-gray shades from near-white (#f7f7f8) to dark (#243142) for the sidebar structure, plus a warm reddish-brown shifted ramp for potential warm accents.

**Base ramp output**:
| Index | Hex       | Role            |
|-------|-----------|-----------------|
| 0     | #f7f7f8   | Lightest        |
| 1     | #d9dcde   | Light gray      |
| 2     | #b9c0c6   | Mid-light       |
| 3     | #96a4b0   | Mid             |
| 4     | #72879c   | Mid-dark        |
| 5     | #546982   | Dark            |
| 6     | #3b4d63   | Darker          |
| 7     | #243142   | Darkest         |

**Shift-150 ramp output** (warm accent):
| Index | Hex       |
|-------|-----------|
| 0     | #f8f7f7   |
| 1     | #ded9d9   |
| 2     | #c6b9b9   |
| 3     | #b09697   |
| 4     | #9c7272   |
| 5     | #825654   |
| 6     | #633d3b   |
| 7     | #422724   |

### Command 2: Saturated accent blues + warm reds
```bash
rampa -C "#4f8cc9" --size=6 -L 50:35 -S 60:80 --hue="0:0" --add=shift:150 --no-preview -O json
```

**Purpose**: Generate saturated accent colors for interactive states (active item, badges). Higher saturation (60-80%) and mid-range lightness (50-35%) for visibility.

**Base ramp output** (blue accents):
| Index | Hex       |
|-------|-----------|
| 0     | #577fa8   |
| 1     | #4f78a1   |
| 2     | #487099   |
| 3     | #416990   |
| 4     | #3a6188   |
| 5     | #33597f   |

**Shift-150 ramp output** (warm red accents):
| Index | Hex       |
|-------|-----------|
| 0     | #a85757   |
| 1     | #a14f4f   |
| 2     | #994848   |
| 3     | #904141   |
| 4     | #883a3a   |
| 5     | #7f3333   |

## Color Assignments

| # | Slot              | Hex       | Source                          | Rationale                                              |
|---|-------------------|-----------|---------------------------------|--------------------------------------------------------|
| 1 | Column BG         | #f7f7f8   | Cmd 1, base ramp, index 0      | Near-white for clean, airy sidebar background          |
| 2 | Menu BG Hover     | #d9dcde   | Cmd 1, base ramp, index 1      | Subtle light gray hover — visible but not distracting  |
| 3 | Active Item       | #577fa8   | Cmd 2, base ramp, index 0      | Saturated blue for clear active channel highlight       |
| 4 | Active Item Text  | #f7f7f8   | Cmd 1, base ramp, index 0      | White text on blue active background for max contrast   |
| 5 | Hover Item BG     | #d9dcde   | Cmd 1, base ramp, index 1      | Same subtle gray as menu hover for consistency          |
| 6 | Text Color        | #3b4d63   | Cmd 1, base ramp, index 6      | Dark blue-gray text — high contrast on light background |
| 7 | Mention Badge     | #a85757   | Cmd 2, shift-150 ramp, index 0 | Warm red badge — draws attention via color contrast     |
| 8 | Mention Badge Text| #f7f7f8   | Cmd 1, base ramp, index 0      | White text on red badge for readability                 |
| 9 | Top Nav BG        | #243142   | Cmd 1, base ramp, index 7      | Dark navy top bar — anchors the layout                  |
| 10| Top Nav Text      | #f7f7f8   | Cmd 1, base ramp, index 0      | White text on dark nav for contrast                     |

## Final Theme

```
#f7f7f8,#d9dcde,#577fa8,#f7f7f8,#d9dcde,#3b4d63,#a85757,#f7f7f8,#243142,#f7f7f8
```

Copy and paste the line above into **Slack → Preferences → Themes → Custom Theme**.
