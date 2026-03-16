# AGENTS.md — rampa-studio

## Build, Test, and Run

```bash
# Web app (dev server)
bun install && bun run dev

# SDK
cd sdk && bun run build          # JS + type declarations
cd sdk && bun test               # 122 tests
cd sdk && bun test --filter "PlaneColorSpace"  # single test group

# CLI
cd cli && bun run build          # compiled binary → dist/rampa
cd cli && bun test               # 23 tests
cd cli && bun test --filter "parseColorspaceArgs"  # single test group

# Type checking (root)
npx tsc --noEmit --skipLibCheck
```

**Known issues:** `vite build` fails on `@react-three/fiber` resolution. Dev server works fine. Use `bun run build:dev` for site builds.

## Architecture

This is a monorepo with a shared color engine consumed by three interfaces:

```
src/engine/          ← Core math (color mixing, interpolation, ramps)
  ├── ColorEngine.ts       Ramp generation with OKLCH lightness/saturation/hue ranges
  ├── ColorSpaceEngine.ts  Linear/Plane/Cube color space generation
  ├── OklchEngine.ts       Color mixing and perceptual uniformity
  ├── HarmonyEngine.ts     Complementary, triadic, analogous, etc.
  └── BlendingEngine.ts    16 blend modes for tinting

sdk/src/             ← npm package (@basiclines/rampa-sdk)
  ├── builder.ts           rampa('#hex').size(10).lightness(10,90) → callable palette
  ├── linear-color-space.ts
  ├── plane-color-space.ts
  └── cube-color-space.ts

cli/src/             ← npm package (@basiclines/rampa)
  ├── index.ts             Main CLI entry (citty framework)
  └── colorspace.ts        `rampa colorspace` subcommand

src/                 ← React web app (rampa.studio)
  ├── components/          shadcn/ui + @react-three/fiber for 3D viewer
  ├── state/               Zustand stores
  └── usecases/            Feature logic (exports, palette operations)
```

**SDK and CLI import directly from `../../src/engine/`** — they are thin wrappers, not copies. All color math lives in the engine.

## Key Conventions

### ColorAccessor API
Color space functions return `ColorAccessor` values — `new String(hex)` wrappers that work in template literals and concatenation, with format conversion methods:
```ts
const r = space(3);
console.log(`${r}`);       // works as string
console.log(r.hsl());      // format conversion
console.log(r.oklch());
```
Do NOT use `.hex` property — use template literals or `.valueOf()`.

### Color Spaces (geometry progression)
- **LinearColorSpace** — 1D ramp (from, to)
- **PlaneColorSpace** — 2D plane (dark, light, hue) — saturation × lightness
- **CubeColorSpace** — 3D cube (8 corner colors: k, r, g, b, y, m, c, w)

All support chainable `.interpolation()`, `.format()`, `.size()`.
All support `.at()` for 0-based Color access and `.colors()` for Color[] arrays.

### Color Transforms
All transforms on `color()` operate in **OKLCH space** and return a new immutable `Color`:
- `lighten(n)`, `darken(n)` — absolute L delta (0-1 scale)
- `saturate(n)`, `desaturate(n)` — absolute chroma delta
- `rotate(n)` — hue rotation in degrees
- `set({ lightness?, chroma?, hue? })` — absolute OKLCH values
- `mix(color, ratio, space?)` — color space interpolation (oklch/lab/srgb)
- `blend(color, opacity, mode)` — compositing modes (multiply/screen/overlay etc.)

### Value Ranges
All structured property values use **0-1 normalized ranges** (CSS-spec aligned):
- `hsl.s`, `hsl.l` — 0 to 1 (not 0-100)
- `oklch.l` — 0 to 1 (not 0-100)
- `oklch.c` — 0 to ~0.4 (native OKLCH)
- Hue values are always 0-360 degrees
- `.format()` string output uses CSS conventions (percentages where appropriate)

### SDK Type Declarations
When adding new types, interfaces, or classes to the SDK:
- Define types/interfaces in `sdk/src/types.ts`
- **Import AND re-export** them from `sdk/src/index.ts` — both the `import type { … }` block and the `export type { … }` block must be updated
- Export new classes from the `export { … }` line in `sdk/src/index.ts`
- Rebuild with `cd sdk && bun run build` and verify the `.d.ts` files appear in `sdk/dist/`

### Input Validation
All color space constructors validate that input colors use the same format (hex, rgb, hsl, oklch). Mixed formats throw. Use `detectColorFormat()` and `validateSameFormat()` from `sdk/src/color-result.ts`.

### Export Functions
When adding a new color space type, update ALL export functions in `src/usecases/GenerateExports.ts`: `getSpaceColors`, `generateSpaceJsonExport`, `generateSpaceSdkExport`, `generateSpaceCliExport`, `generateSpaceCssExport`.

### CLI Argument Patterns
CLI uses manual argument parsing (not a framework for `colorspace` subcommand). When adding flags:
- Add parsing in `parseColorspaceArgs()`
- Add config file support in `loadConfig()`
- Preserve new fields in the config merge block (lines ~339-348)
- Guard `interpolation === false` for modes that need it

### Testing
- Runtime: `bun:test` with `describe`/`it`/`expect`
- SDK tests verify palette sizes, index clamping, format conversion, and interpolation modes
- CLI tests verify argument parsing and flag combinations
- CLI binary must be built (`bun run build`) before running accessibility tests

## Release Process

1. Bump version in `sdk/package.json` and `cli/package.json` (keep in sync)
2. Commit, tag as `v{version}`, push with `--tags`
3. Create a GitHub release with release notes summarizing changes
4. CI (`release.yml`) runs tests then publishes both packages to npm

**Always include release notes** when creating a GitHub release. Summarize new features, fixes, and breaking changes. Use the PR descriptions and commit messages as source material.

**Always ask the user before committing and pushing.**
