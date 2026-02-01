# Rampa CLI - Iteration 7: Build & Distribution

## Prerequisites
✅ Iteration 1-6 complete and tested

## Goal
Set up build scripts for cross-platform compilation and prepare for distribution.

## Deliverable
Standalone executables for all major platforms that can be distributed without requiring Bun/Node.js installation.

---

## Tasks

### 7.1 Add Build Scripts
- [ ] Update `cli/package.json` with build scripts:
  ```json
  {
    "scripts": {
      "dev": "bun run src/index.ts",
      "test": "bun test",
      "build": "bun build ./src/index.ts --compile --outfile=./dist/rampa",
      "build:darwin-arm64": "bun build ./src/index.ts --compile --target=bun-darwin-arm64 --outfile=./dist/rampa-darwin-arm64",
      "build:darwin-x64": "bun build ./src/index.ts --compile --target=bun-darwin-x64 --outfile=./dist/rampa-darwin-x64",
      "build:linux-x64": "bun build ./src/index.ts --compile --target=bun-linux-x64 --outfile=./dist/rampa-linux-x64",
      "build:linux-arm64": "bun build ./src/index.ts --compile --target=bun-linux-arm64 --outfile=./dist/rampa-linux-arm64",
      "build:windows-x64": "bun build ./src/index.ts --compile --target=bun-windows-x64 --outfile=./dist/rampa-windows-x64.exe",
      "build:all": "bun run build:darwin-arm64 && bun run build:darwin-x64 && bun run build:linux-x64 && bun run build:linux-arm64 && bun run build:windows-x64"
    }
  }
  ```

### 7.2 Create dist Directory
- [ ] Add `cli/dist/` to `.gitignore`
- [ ] Create `cli/dist/.gitkeep` for empty directory

### 7.3 Configure Package for npm
- [ ] Update `cli/package.json` for npm publishing:
  ```json
  {
    "name": "rampa-cli",
    "version": "1.0.0",
    "description": "Generate mathematically accurate color palettes from a base color",
    "type": "module",
    "bin": {
      "rampa": "./dist/rampa"
    },
    "files": [
      "dist/rampa",
      "README.md"
    ],
    "repository": {
      "type": "git",
      "url": "https://github.com/your-username/rampa-studio"
    },
    "keywords": [
      "color",
      "palette",
      "cli",
      "design",
      "oklch",
      "accessibility"
    ],
    "author": "Your Name",
    "license": "MIT"
  }
  ```

### 7.4 Add --version Flag
- [ ] Ensure version is read from package.json
- [ ] `rampa --version` outputs: `rampa v1.0.0`

### 7.5 Implement Full Help
- [ ] Implement the complete `--help` output as specified in the main plan
- [ ] Ensure all sections are included:
  - USAGE
  - REQUIRED
  - COLOR FORMAT
  - PALETTE SIZE
  - COLOR RANGES
  - SCALE TYPES
  - TINTING
  - ADD HARMONY RAMPS
  - OUTPUT
  - OTHER
  - EXAMPLES

### 7.6 Create CLI README
- [ ] Create `cli/README.md` with:
  - Installation instructions
  - Quick start examples
  - Full flag reference
  - Output format examples
  - Build instructions

### 7.7 Test Compiled Binaries
- [ ] Build for current platform
- [ ] Test all functionality with compiled binary
- [ ] Verify binary size is reasonable
- [ ] Test on clean system without Bun installed (if possible)

---

## Build Targets

| Target | Platform | Architecture | Output File |
|--------|----------|--------------|-------------|
| `bun-darwin-arm64` | macOS | Apple Silicon | `rampa-darwin-arm64` |
| `bun-darwin-x64` | macOS | Intel | `rampa-darwin-x64` |
| `bun-linux-x64` | Linux | x64 | `rampa-linux-x64` |
| `bun-linux-arm64` | Linux | ARM64 | `rampa-linux-arm64` |
| `bun-windows-x64` | Windows | x64 | `rampa-windows-x64.exe` |

---

## Test Scenarios

```bash
# Build for current platform
cd cli
bun run build

# Test compiled binary
./dist/rampa --version
./dist/rampa --help
./dist/rampa --base="#3B82F6"
./dist/rampa -b "#FF0000" -l 10:90 --lightness-scale=fibonacci --add=complementary -o css -n red

# Build all platforms
bun run build:all

# Verify all binaries created
ls -la dist/
```

## Expected Build Output

```bash
$ bun run build:all

$ ls -la cli/dist/
total 245760
-rwxr-xr-x  rampa-darwin-arm64    48M
-rwxr-xr-x  rampa-darwin-x64      52M
-rwxr-xr-x  rampa-linux-x64       50M
-rwxr-xr-x  rampa-linux-arm64     48M
-rwxr-xr-x  rampa-windows-x64.exe 55M
```

---

## Definition of Done

- [ ] `bun run build` creates working binary for current platform
- [ ] `bun run build:all` creates binaries for all 5 platforms
- [ ] Compiled binary works without Bun installed
- [ ] `--version` shows correct version
- [ ] `--help` shows complete documentation
- [ ] `cli/README.md` is complete and accurate
- [ ] Package is ready for npm publish (optional)
- [ ] Root `bun test` still passes

---

## Previous Iteration
← [Iteration 6: Output Formats](./iteration-6-outputs.md)

## Final Checklist
→ [Release Checklist](./release-checklist.md)
