# Rampa CLI - Implementation Plan

## Overview
This plan is divided into 7 incremental iterations, each delivering testable functionality.

## Iterations

| # | Name | Key Features | Status |
|---|------|--------------|--------|
| 1 | [Foundation](./iteration-1-foundation.md) | Project setup, `--base`, `--size`, text output | ✅ Complete |
| 2 | [Color Ranges](./iteration-2-ranges.md) | `--lightness`, `--saturation`, `--hue`, `--format` | ⬜ Not started |
| 3 | [Scale Types](./iteration-3-scales.md) | `--lightness-scale`, `--saturation-scale`, `--hue-scale` | ⬜ Not started |
| 4 | [Tinting](./iteration-4-tinting.md) | `--tint-color`, `--tint-opacity`, `--tint-blend` | ⬜ Not started |
| 5 | [Harmony Ramps](./iteration-5-harmony.md) | `--add` (repeatable) | ⬜ Not started |
| 6 | [Output Formats](./iteration-6-outputs.md) | `--output=json\|css`, `--name` | ⬜ Not started |
| 7 | [Build & Distribution](./iteration-7-build.md) | Cross-platform binaries, npm publish | ⬜ Not started |

## Final Steps
- [Release Checklist](./release-checklist.md)

## Reference
- [Defaults Parity](./defaults-parity.md) - Ensures CLI matches website output

---

## Quick Start

After each iteration is complete, you can test with:

```bash
cd cli
bun run dev -- --base="#3B82F6" [flags]
```

---

## Status Legend
- ⬜ Not started
- 🟡 In progress
- ✅ Complete

---

## Full Reference

For the complete plan with help menu and all details, see:
- [CLI_IMPLEMENTATION_PLAN.md](../../CLI_IMPLEMENTATION_PLAN.md)
