#!/usr/bin/env bun
/**
 * Release script for Rampa CLI + SDK
 * Usage: bun run release <version>
 * Example: bun run release 1.0.2
 * 
 * Releases both @basiclines/rampa (CLI) and @basiclines/rampa-sdk (SDK)
 * with the same version to keep them aligned.
 */

import { $ } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CLI_DIR = import.meta.dir.replace("/scripts", "");
const ROOT_DIR = join(CLI_DIR, "..");
const SDK_DIR = join(ROOT_DIR, "sdk");
const HOMEBREW_TAP_DIR = join(ROOT_DIR, "..", "homebrew-tap");

async function main() {
  const version = process.argv[2];
  
  if (!version) {
    console.error("Usage: bun run release <version>");
    console.error("Example: bun run release 1.0.2");
    process.exit(1);
  }

  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(`Invalid version format: ${version}`);
    console.error("Expected format: X.Y.Z (e.g., 1.0.2)");
    process.exit(1);
  }

  console.log(`\n🚀 Releasing Rampa v${version} (CLI + SDK)\n`);

  // Step 1: Run CLI tests
  console.log("🧪 Running CLI tests...");
  try {
    await $`bun test`.cwd(CLI_DIR);
    console.log("✅ CLI tests passed!\n");
  } catch (error) {
    console.error("❌ CLI tests failed! Aborting release.");
    process.exit(1);
  }

  // Step 1b: Run SDK tests
  console.log("🧪 Running SDK tests...");
  try {
    await $`bun test`.cwd(SDK_DIR);
    console.log("✅ SDK tests passed!\n");
  } catch (error) {
    console.error("❌ SDK tests failed! Aborting release.");
    process.exit(1);
  }

  // Step 2: Update version in CLI package.json
  console.log("📦 Updating CLI package.json...");
  const cliPackageJsonPath = join(CLI_DIR, "package.json");
  const cliPackageJson = JSON.parse(readFileSync(cliPackageJsonPath, "utf-8"));
  cliPackageJson.version = version;
  writeFileSync(cliPackageJsonPath, JSON.stringify(cliPackageJson, null, 2) + "\n");

  // Step 2b: Update version in SDK package.json
  console.log("📦 Updating SDK package.json...");
  const sdkPackageJsonPath = join(SDK_DIR, "package.json");
  const sdkPackageJson = JSON.parse(readFileSync(sdkPackageJsonPath, "utf-8"));
  sdkPackageJson.version = version;
  writeFileSync(sdkPackageJsonPath, JSON.stringify(sdkPackageJson, null, 2) + "\n");

  // Step 2c: Update version in index.ts
  console.log("📝 Updating version in source code...");
  const indexPath = join(CLI_DIR, "src/index.ts");
  let indexContent = readFileSync(indexPath, "utf-8");
  indexContent = indexContent.replace(/rampa v\d+\.\d+\.\d+/g, `rampa v${version}`);
  indexContent = indexContent.replace(/version: '\d+\.\d+\.\d+'/g, `version: '${version}'`);
  writeFileSync(indexPath, indexContent);

  // Step 3: Build all platform binaries
  console.log("🔨 Building CLI binaries for all platforms...");
  await $`bun run build:all`.cwd(CLI_DIR);

  // Step 3b: Build SDK
  console.log("🔨 Building SDK...");
  await $`bun run build`.cwd(SDK_DIR);

  // Step 4: Calculate SHA256 hashes
  console.log("🔐 Calculating SHA256 hashes...");
  const hashes: Record<string, string> = {};
  const binaries = [
    "rampa-darwin-arm64",
    "rampa-darwin-x64",
    "rampa-linux-x64",
    "rampa-linux-arm64",
  ];

  for (const binary of binaries) {
    const result = await $`shasum -a 256 dist/${binary}`.cwd(CLI_DIR).text();
    hashes[binary] = result.split(" ")[0];
  }

  // Step 5: Commit and tag
  console.log("📌 Creating git commit and tag...");
  await $`git add -A`.cwd(ROOT_DIR);
  await $`git commit -m ${"Bump version to " + version}`.cwd(ROOT_DIR);
  await $`git tag ${"v" + version}`.cwd(ROOT_DIR);
  await $`git push origin main`.cwd(ROOT_DIR);
  await $`git push origin ${"v" + version}`.cwd(ROOT_DIR);

  // Step 6: Create GitHub release
  console.log("🎉 Creating GitHub release...");
  const releaseNotes = `## Rampa v${version}

### Installation

#### CLI
\\\`\\\`\\\`bash
npm install -g @basiclines/rampa
# or
brew tap basiclines/tap
brew install rampa
\\\`\\\`\\\`

#### SDK
\\\`\\\`\\\`bash
npm install @basiclines/rampa-sdk
\\\`\\\`\\\`

Or download CLI binaries below.
`;

  await $`gh release create ${"v" + version} \
    cli/dist/rampa-darwin-arm64 \
    cli/dist/rampa-darwin-x64 \
    cli/dist/rampa-linux-x64 \
    cli/dist/rampa-linux-arm64 \
    cli/dist/rampa-windows-x64.exe \
    --title ${"v" + version} \
    --notes ${releaseNotes}`.cwd(ROOT_DIR);

  // Step 7: npm publish is handled by GitHub Actions (trusted publishing)
  console.log("📦 npm publish will be handled by CI (trusted publisher via OIDC)...");
  console.log("   The v-tag push triggers .github/workflows/release.yml");

  // Step 8: Update Homebrew formula
  console.log("🍺 Updating Homebrew formula...");
  const formulaPath = join(HOMEBREW_TAP_DIR, "Formula/rampa.rb");
  
  try {
    let formula = readFileSync(formulaPath, "utf-8");
    
    // Update version
    formula = formula.replace(/version "\d+\.\d+\.\d+"/, `version "${version}"`);
    
    // Update URLs
    formula = formula.replace(
      /releases\/download\/v\d+\.\d+\.\d+/g,
      `releases/download/v${version}`
    );
    
    // Update SHA256 hashes
    formula = formula.replace(
      /(url ".*rampa-darwin-arm64"\s+sha256 ")[\da-f]+(")/,
      `$1${hashes["rampa-darwin-arm64"]}$2`
    );
    formula = formula.replace(
      /(url ".*rampa-darwin-x64"\s+sha256 ")[\da-f]+(")/,
      `$1${hashes["rampa-darwin-x64"]}$2`
    );
    formula = formula.replace(
      /(url ".*rampa-linux-x64"\s+sha256 ")[\da-f]+(")/,
      `$1${hashes["rampa-linux-x64"]}$2`
    );
    formula = formula.replace(
      /(url ".*rampa-linux-arm64"\s+sha256 ")[\da-f]+(")/,
      `$1${hashes["rampa-linux-arm64"]}$2`
    );

    writeFileSync(formulaPath, formula);

    // Commit and push Homebrew tap
    await $`git add -A`.cwd(HOMEBREW_TAP_DIR);
    await $`git commit -m ${"Update rampa to v" + version}`.cwd(HOMEBREW_TAP_DIR);
    await $`git push origin main`.cwd(HOMEBREW_TAP_DIR);
    
    console.log("✅ Homebrew formula updated!");
  } catch (error) {
    console.warn("⚠️  Could not update Homebrew formula automatically.");
    console.warn("   Please update manually at:", formulaPath);
    console.warn("   SHA256 hashes:");
    for (const [binary, hash] of Object.entries(hashes)) {
      console.warn(`   ${binary}: ${hash}`);
    }
  }

  console.log(`
✅ Release v${version} complete!

📦 GitHub Release: https://github.com/basiclines/rampa-studio/releases/tag/v${version}
📦 npm CLI: https://www.npmjs.com/package/@basiclines/rampa
📦 npm SDK: https://www.npmjs.com/package/@basiclines/rampa-sdk
🍺 Homebrew: brew upgrade rampa
`);
}

main().catch((error) => {
  console.error("❌ Release failed:", error.message);
  process.exit(1);
});
