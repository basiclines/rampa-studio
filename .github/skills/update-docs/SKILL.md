---
name: update-docs
description: Audit and update all rampa project documentation after code changes. Use when adding features, changing defaults, modifying APIs, or before a release.
metadata:
  author: ismael.fyi
  version: "1.0.0"
---

# Update Documentation

Audit and update all project documentation to reflect current code.

## Doc Files to Update

| File | Purpose |
|------|---------|
| `sdk/README.md` | SDK user-facing docs — transforms, palette API, value ranges, type exports |
| `cli/README.md` | CLI user-facing docs — all subcommand flag tables, examples, defaults |
| `cli/src/palette.ts` | CLI palette `showHelp()` function and `parseArgs()` defaults |
| `cli/src/index.ts` | Main `rampa --help` text — subcommand list, IMAGE PALETTE section |
| `cli/src/color.ts` | CLI color subcommand help text and transform flags |
| `AGENTS.md` | Architecture guide — build commands, file map, conventions |

## Source Files to Read

| File | What to check |
|------|---------------|
| `sdk/src/index.ts` | All SDK exports — types and classes |
| `sdk/src/palette.ts` | PaletteResult API surface, options interfaces, defaults |
| `sdk/src/types.ts` | All public type definitions |
| `sdk/src/color-result.ts` | Color transform methods, value ranges |
| `src/engine/PaletteEngine.ts` | Engine defaults — sampleSize, tolerance, bucket counts |
| `cli/src/palette.ts` | CLI palette `parseArgs()` defaults, flag list |
| `cli/src/color.ts` | CLI color transform flags |

## Audit Process

1. **Read source files** to understand current API surface and defaults
2. **Read doc files** to see what's documented
3. **Diff** — find stale defaults, missing features, removed APIs
4. **Update** — make surgical edits to fix gaps
5. **Verify** — CLI help text defaults must match `parseArgs()` defaults in the same file

## Defaults to Track

These change occasionally and must be consistent across all docs:

| Setting | Source of truth | Also appears in |
|---------|----------------|-----------------|
| Sample size | `PaletteEngine.ts` `samplePixels` default | `sdk/palette.ts`, `cli/palette.ts` parseArgs, SDK README, CLI README, CLI help |
| K-means tolerance | `PaletteEngine.ts` `kMeansClustering` default | `sdk/palette.ts` DominantOptions JSDoc, `cli/palette.ts` parseArgs, SDK README, CLI README, CLI help |
| Raw tolerance | `PaletteEngine.ts` `buildRawPalette` default | `cli/palette.ts` parseArgs, CLI README, CLI help |
| Dominant count | `cli/palette.ts` parseArgs default | CLI README, CLI help |
| ANSI count | `PaletteEngine.ts` `buildAnsiPalette` default | SDK README |
| L bucket count | `PaletteEngine.ts` `DEFAULT_L_BUCKETS` array length | `cli/palette.ts` parseArgs `lBuckets`, CLI README, CLI help |
| C bucket count | `PaletteEngine.ts` `DEFAULT_C_BUCKETS` array length | `cli/palette.ts` parseArgs `cBuckets`, CLI README, CLI help |
| H bucket count | `PaletteEngine.ts` `DEFAULT_H_BUCKETS` array length | `cli/palette.ts` parseArgs `hBuckets`, CLI README, CLI help |
| Contrast mode | `sdk/src/contrast.ts` default mode | SDK README, CLI README |

## SDK README Sections to Verify

- Color transforms (lighten, darken, saturate, desaturate, rotate, set, mix, blend)
- Value ranges (HSL s/l and OKLCH l use 0-1 scale, NOT 0-100)
- Ramp introspection (.at(), .colors() on Linear/Plane/CubeColorSpace)
- Palette extraction (palette(), dominant(), raw(), ansi(), group(), sortBy())
- Output formats (json, css, text)
- Type exports (all public types from `sdk/src/index.ts` should be mentioned)

## CLI README Sections to Verify

- `rampa color` flags table (transform flags: --lighten, --darken, etc.)
- `rampa palette` flags table (all flags with correct defaults)
- `rampa palette` usage examples
- `rampa lint` flags
- `rampa colorspace` flags

## Rules

- **Release notes**: Only include SDK/CLI changes. Never include site/editor/landing page changes.
- **Site demos**: Only update `site/` if SDK API changes break existing demos.
- **Value ranges**: 0-1 scale for HSL s/l and OKLCH l. Format string output is unchanged.
- **Help text**: CLI `showHelp()` defaults must exactly match `parseArgs()` defaults in the same file.
