# Rampa CLI - Iteration 1: Foundation

## Goal
Set up the CLI project structure and implement the most basic functionality: generate a color palette from a base color with text output.

## Deliverable
A working CLI that can run:
```bash
rampa --base="#3B82F6"
rampa -b "#FF0000" --size=12
```

And outputs a simple list of hex colors to stdout.

---

## Tasks

### 1.1 Project Setup
- [ ] Run `bun test` in root to establish baseline (all tests must pass)
- [ ] Create `cli/` directory structure:
  ```
  cli/
  ├── src/
  │   └── index.ts
  ├── package.json
  └── tsconfig.json
  ```
- [ ] Initialize `cli/package.json`:
  ```json
  {
    "name": "rampa-cli",
    "version": "0.1.0",
    "type": "module",
    "scripts": {
      "dev": "bun run src/index.ts",
      "test": "bun test"
    },
    "dependencies": {
      "citty": "^0.1.6",
      "chroma-js": "^3.1.2",
      "culori": "^4.0.1"
    },
    "devDependencies": {
      "@types/bun": "^1.2.17",
      "@types/chroma-js": "^3.1.1",
      "typescript": "^5.5.3"
    }
  }
  ```
- [ ] Configure `cli/tsconfig.json` with path alias to import `../src/engine`
- [ ] Run `cd cli && bun install`

### 1.2 Verify Engine Import
- [ ] Create a test import file to verify engine works without React/DOM
- [ ] Import and test `generateColorRamp` from `../src/engine/ColorEngine`
- [ ] Confirm no browser-specific errors

### 1.3 Basic CLI Implementation
- [ ] Create `cli/src/index.ts` with Citty:
  ```typescript
  import { defineCommand, runMain } from 'citty';
  
  const main = defineCommand({
    meta: {
      name: 'rampa',
      version: '0.1.0',
      description: 'Generate color palettes from a base color',
    },
    args: {
      base: {
        type: 'string',
        alias: 'b',
        description: 'Base color (hex, hsl, oklch)',
        required: true,
      },
      size: {
        type: 'string',
        description: 'Number of colors in palette',
        default: '10',
      },
    },
    run({ args }) {
      // Implementation here
    },
  });
  
  runMain(main);
  ```
- [ ] Implement color generation using engine's `generateColorRamp`
- [ ] Output colors as plain text (one per line)

### 1.4 Basic Validation
- [ ] Validate `--base` is a valid color (using chroma-js)
- [ ] Validate `--size` is a number between 2-20
- [ ] Show helpful error messages for invalid input

---

## Test Scenarios

```bash
# Should work
rampa --base="#3B82F6"
rampa -b "#FF0000"
rampa --base="rgb(59, 130, 246)" --size=8
rampa -b "hsl(217, 91%, 60%)"

# Should fail with helpful error
rampa                           # Missing required --base
rampa --base="notacolor"        # Invalid color
rampa --base="#FF0000" --size=0 # Size out of range
rampa --base="#FF0000" --size=50 # Size out of range
```

## Expected Output

```bash
$ rampa --base="#3B82F6"
#eff6ff
#dbeafe
#bfdbfe
#93c5fd
#60a5fa
#3b82f6
#2563eb
#1d4ed8
#1e40af
#1e3a8a
```

---

## Definition of Done

- [ ] `cd cli && bun run dev -- --base="#FF0000"` outputs 10 hex colors
- [ ] `--size` flag changes the number of output colors
- [ ] Invalid inputs show clear error messages
- [ ] Root `bun test` still passes (no engine regressions)

---

## Next Iteration
→ [Iteration 2: Color Ranges & Format](./iteration-2-ranges.md)
