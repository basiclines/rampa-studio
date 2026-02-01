# Rampa CLI - Iteration 6: Output Formats

## Prerequisites
✅ Iteration 1-5 complete and tested

## Goal
Add JSON and CSS output formats alongside the existing text format.

## Deliverable
```bash
rampa --base="#3B82F6" --output=json
rampa --base="#FF0000" --output=css --name=danger
```

---

## Tasks

### 6.1 Create Output Formatters
- [ ] Create `cli/src/formatters/` directory
- [ ] Create `cli/src/formatters/text.ts` (extract existing logic):
  ```typescript
  export function formatText(ramps: RampOutput[]): string {
    // One color per line, with headers for multiple ramps
  }
  ```

- [ ] Create `cli/src/formatters/json.ts`:
  ```typescript
  export function formatJson(ramps: RampOutput[]): string {
    // Full configuration + colors as JSON
  }
  ```

- [ ] Create `cli/src/formatters/css.ts`:
  ```typescript
  export function formatCss(ramps: RampOutput[]): string {
    // CSS custom properties format
  }
  ```

### 6.2 JSON Output Structure
- [ ] Include full config and generated colors:
  ```json
  {
    "ramps": [
      {
        "name": "ramp",
        "baseColor": "#3B82F6",
        "config": {
          "size": 10,
          "lightness": { "start": 5, "end": 95 },
          "saturation": { "start": 0, "end": 100 },
          "hue": { "start": 0, "end": 0 },
          "scales": {
            "lightness": "linear",
            "saturation": "linear",
            "hue": "linear"
          },
          "tint": null
        },
        "colors": [
          "#eff6ff",
          "#dbeafe",
          ...
        ]
      }
    ]
  }
  ```

### 6.3 CSS Output Structure
- [ ] Generate CSS custom properties:
  ```css
  :root {
    /* ramp */
    --ramp-0: #eff6ff;
    --ramp-10: #dbeafe;
    --ramp-20: #bfdbfe;
    --ramp-30: #93c5fd;
    --ramp-40: #60a5fa;
    --ramp-50: #3b82f6;
    --ramp-60: #2563eb;
    --ramp-70: #1d4ed8;
    --ramp-80: #1e40af;
    --ramp-90: #1e3a8a;
  }
  ```
- [ ] Support `--name` flag for custom variable prefix
- [ ] Handle multiple ramps (from `--add`):
  ```css
  :root {
    /* blue */
    --blue-0: #eff6ff;
    ...
    
    /* blue-complementary */
    --blue-complementary-0: #fff7ed;
    ...
  }
  ```

### 6.4 Add Output Flag
- [ ] Add/update `--output` / `-o` flag:
  ```typescript
  output: {
    type: 'string',
    alias: 'o',
    description: 'Output format: text, json, css',
    default: 'text',
  },
  ```
- [ ] Validate output format is one of: `text`, `json`, `css`

### 6.5 Add Name Flag
- [ ] Add `--name` / `-n` flag:
  ```typescript
  name: {
    type: 'string',
    alias: 'n',
    description: 'Ramp name (for CSS variables)',
    default: 'ramp',
  },
  ```
- [ ] Sanitize name for CSS (lowercase, no spaces, alphanumeric + hyphens)

---

## Test Scenarios

```bash
# Text output (default)
rampa -b "#3B82F6"
rampa -b "#3B82F6" --output=text

# JSON output
rampa -b "#3B82F6" --output=json
rampa -b "#3B82F6" -o json --add=complementary
rampa -b "#3B82F6" -o json -l 10:90 --lightness-scale=fibonacci

# CSS output
rampa -b "#3B82F6" --output=css
rampa -b "#3B82F6" -o css --name=primary
rampa -b "#3B82F6" -o css -n blue --add=complementary

# Name sanitization
rampa -b "#3B82F6" -o css --name="My Color"  # becomes: my-color
rampa -b "#3B82F6" -o css --name="Primary 1" # becomes: primary-1

# Should fail
rampa -b "#3B82F6" --output=xml  # unsupported format
```

## Expected Outputs

### JSON
```bash
$ rampa --base="#3B82F6" --output=json --size=3
```
```json
{
  "ramps": [
    {
      "name": "ramp",
      "baseColor": "#3B82F6",
      "config": {
        "size": 3,
        "lightness": { "start": 5, "end": 95 },
        "saturation": { "start": 0, "end": 100 },
        "hue": { "start": 0, "end": 0 },
        "scales": {
          "lightness": "linear",
          "saturation": "linear",
          "hue": "linear"
        },
        "tint": null
      },
      "colors": ["#eff6ff", "#3b82f6", "#1e3a8a"]
    }
  ]
}
```

### CSS
```bash
$ rampa --base="#3B82F6" --output=css --name=blue --size=5
```
```css
:root {
  /* blue */
  --blue-0: #eff6ff;
  --blue-25: #93c5fd;
  --blue-50: #3b82f6;
  --blue-75: #1d4ed8;
  --blue-100: #1e3a8a;
}
```

---

## Definition of Done

- [ ] `--output=text` works (default, existing behavior)
- [ ] `--output=json` outputs valid, well-structured JSON
- [ ] `--output=css` outputs valid CSS custom properties
- [ ] `--name` customizes the CSS variable prefix
- [ ] All output formats work with `--add` (multiple ramps)
- [ ] All previous functionality still works
- [ ] Root `bun test` still passes

---

## Previous Iteration
← [Iteration 5: Harmony Ramps](./iteration-5-harmony.md)

## Next Iteration
→ [Iteration 7: Build & Distribution](./iteration-7-build.md)
