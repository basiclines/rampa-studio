/**
 * Theme Scraper — Fetches color themes from VSCode Marketplace
 *
 * Paginates the full catalog of color-theme extensions, downloads each VSIX,
 * extracts terminal ANSI colors, and writes enriched YAML theme files.
 *
 * Usage: bun run scripts/scrape-themes.ts [--limit N] [--concurrency N]
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { serializeThemeYAML, ANSI_KEYS, type ThemeYAML, type ThemeColors, type ThemeContrast } from '../cli/src/theme-schema';
import { computeApcaLc } from '../src/engine/ApcaEngine';
import { hexToOklch } from '../src/engine/OklchMathEngine';

// ── Config ──

const MARKETPLACE_URL = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';
const THEMES_DIR = join(import.meta.dir, '..', 'themes');
const PAGE_SIZE = 100;
const DEFAULT_CONCURRENCY = 5;
const DELAY_BETWEEN_PAGES = 1500;

// ── CLI args ──

const args = process.argv.slice(2);
let LIMIT = Infinity;
let CONCURRENCY = DEFAULT_CONCURRENCY;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) LIMIT = parseInt(args[++i]);
  if (args[i] === '--concurrency' && args[i + 1]) CONCURRENCY = parseInt(args[++i]);
}

// ── CSS named colors for accent detection ──

const CSS_COLORS: Record<string, [number, number, number]> = {
  red: [0, 100, 50], orange: [30, 100, 50], yellow: [60, 100, 50],
  green: [120, 100, 50], teal: [180, 100, 50], cyan: [190, 100, 50],
  blue: [210, 100, 50], indigo: [240, 100, 50], purple: [270, 100, 50],
  magenta: [300, 100, 50], pink: [330, 100, 50], brown: [30, 50, 40],
};

// ── Marketplace API ──

interface MarketplaceExtension {
  displayName: string;
  publisher: { publisherName: string; displayName: string };
  extensionId: string;
  extensionName: string;
  versions: Array<{
    version: string;
    files: Array<{ assetType: string; source: string }>;
    properties: Array<{ key: string; value: string }>;
  }>;
  statistics: Array<{ statisticName: string; value: number }>;
}

async function fetchPage(page: number, retries = 5): Promise<{ extensions: MarketplaceExtension[]; total: number }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(MARKETPLACE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json;api-version=7.2-preview.1',
      },
      body: JSON.stringify({
        filters: [{
          criteria: [
            { filterType: 8, value: 'Microsoft.VisualStudio.Code' },
            { filterType: 10, value: 'tag:"color-theme"' },
          ],
          pageSize: PAGE_SIZE,
          pageNumber: page,
          sortBy: 12, // Install count
          sortOrder: 0,
        }],
        flags: 914,
      }),
    });

    if (res.status === 429) {
      const wait = Math.pow(2, attempt) * 2000;
      console.log(`   ⏳ Rate limited on page ${page}, retrying in ${wait / 1000}s... (attempt ${attempt + 1}/${retries})`);
      await Bun.sleep(wait);
      continue;
    }

    if (!res.ok) {
      throw new Error(`Marketplace API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const result = data.results[0];
    const total = result.resultMetadata?.[0]?.metadataItems?.[0]?.count || 0;
    return { extensions: result.extensions || [], total };
  }

  console.log(`   ⚠️  Skipping page ${page} after ${retries} retries`);
  return { extensions: [], total: 0 };
}

// ── VSIX download + extraction ──

async function downloadAndExtractThemes(ext: MarketplaceExtension): Promise<ExtractedTheme[]> {
  const version = ext.versions?.[0];
  if (!version) return [];

  const vsixFile = version.files?.find(f => f.assetType === 'Microsoft.VisualStudio.Services.VSIXPackage');
  if (!vsixFile) return [];

  try {
    let buffer: ArrayBuffer | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch(vsixFile.source);
      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 2000;
        await Bun.sleep(wait);
        continue;
      }
      if (!res.ok) return [];
      buffer = await res.arrayBuffer();
      break;
    }
    if (!buffer) return [];

    // Write to temp file, use system unzip (fast + reliable)
    const tmpDir = join(THEMES_DIR, '.tmp', ext.extensionId || 'ext');
    mkdirSync(tmpDir, { recursive: true });
    const vsixPath = join(tmpDir, 'ext.vsix');
    writeFileSync(vsixPath, new Uint8Array(buffer));

    // List theme json files in the zip
    const listProc = Bun.spawn(['unzip', '-l', vsixPath], { stdout: 'pipe', stderr: 'pipe' });
    const listOutput = await new Response(listProc.stdout).text();
    const themeFiles = listOutput.split('\n')
      .map(line => line.trim().split(/\s+/).pop() || '')
      .filter(f => /^extension\/themes?\/.*\.json$/i.test(f));

    if (themeFiles.length === 0) {
      cleanup(tmpDir);
      return [];
    }

    // Extract theme files
    const extractProc = Bun.spawn(['unzip', '-qo', vsixPath, ...themeFiles, '-d', tmpDir], {
      stdout: 'pipe', stderr: 'pipe',
    });
    await extractProc.exited;

    const themes: ExtractedTheme[] = [];
    for (const filePath of themeFiles) {
      try {
        const fullPath = join(tmpDir, filePath);
        if (!existsSync(fullPath)) continue;
        const content = readFileSync(fullPath, 'utf8');
        const parsed = parseVSCodeThemeJson(content);
        if (parsed) {
          themes.push({
            name: parsed.name || filePath.replace(/\.json$/, '').replace(/.*\//, ''),
            colors: parsed.colors,
            extension: ext,
          });
        }
      } catch {
        // Skip unparseable files
      }
    }

    cleanup(tmpDir);
    return themes;
  } catch {
    return [];
  }
}

function cleanup(dir: string): void {
  try {
    const { rmSync } = require('node:fs');
    rmSync(dir, { recursive: true, force: true });
  } catch {}
}

interface ExtractedTheme {
  name: string;
  colors: ThemeColors;
  extension: MarketplaceExtension;
}

// ── VSCode theme JSON parsing ──

const ANSI_MAP: Record<string, keyof ThemeColors> = {
  'terminal.ansiBlack': 'black',
  'terminal.ansiRed': 'red',
  'terminal.ansiGreen': 'green',
  'terminal.ansiYellow': 'yellow',
  'terminal.ansiBlue': 'blue',
  'terminal.ansiMagenta': 'magenta',
  'terminal.ansiCyan': 'cyan',
  'terminal.ansiWhite': 'white',
  'terminal.ansiBrightBlack': 'brightBlack',
  'terminal.ansiBrightRed': 'brightRed',
  'terminal.ansiBrightGreen': 'brightGreen',
  'terminal.ansiBrightYellow': 'brightYellow',
  'terminal.ansiBrightBlue': 'brightBlue',
  'terminal.ansiBrightMagenta': 'brightMagenta',
  'terminal.ansiBrightCyan': 'brightCyan',
  'terminal.ansiBrightWhite': 'brightWhite',
};

function parseVSCodeThemeJson(raw: string): { name: string | null; colors: ThemeColors } | null {
  try {
    // Handle JSONC (comments + trailing commas)
    const clean = raw
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/,(\s*[}\]])/g, '$1');

    const data = JSON.parse(clean);
    const colors = data.colors || {};

    const bg = colors['editor.background'] || colors['terminal.background'];
    const fg = colors['editor.foreground'] || colors['terminal.foreground'];

    if (!bg || !fg) return null;
    if (!isValidHex(bg) || !isValidHex(fg)) return null;

    const result: Partial<ThemeColors> = { bg: normalizeHex(bg), fg: normalizeHex(fg) };
    let ansiCount = 0;

    for (const [vscKey, yamlKey] of Object.entries(ANSI_MAP)) {
      const val = colors[vscKey];
      if (val && isValidHex(val)) {
        result[yamlKey] = normalizeHex(val);
        ansiCount++;
      }
    }

    // Require at least 8 ANSI colors
    if (ansiCount < 8) return null;

    // Fill missing bright colors from normal colors
    const normalToBright: Record<string, string> = {
      black: 'brightBlack', red: 'brightRed', green: 'brightGreen',
      yellow: 'brightYellow', blue: 'brightBlue', magenta: 'brightMagenta',
      cyan: 'brightCyan', white: 'brightWhite',
    };
    for (const [normal, bright] of Object.entries(normalToBright)) {
      if (!result[bright as keyof ThemeColors] && result[normal as keyof ThemeColors]) {
        result[bright as keyof ThemeColors] = result[normal as keyof ThemeColors];
      }
    }

    // Verify all required keys exist
    for (const key of ['bg', 'fg', ...ANSI_KEYS]) {
      if (!result[key as keyof ThemeColors]) return null;
    }

    return { name: data.name || null, colors: result as ThemeColors };
  } catch {
    return null;
  }
}

function isValidHex(val: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(val);
}

function normalizeHex(hex: string): string {
  let h = hex.replace('#', '');
  // Strip alpha if 8-char hex
  if (h.length === 8) h = h.slice(0, 6);
  // Expand 3-char hex
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return '#' + h.toUpperCase();
}

// ── Metadata enrichment ──

function enrichTheme(name: string, colors: ThemeColors, ext: MarketplaceExtension): ThemeYAML {
  const [bgL, bgC, bgH] = hexToOklch(colors.bg);

  // Mode: dark if bg lightness < 0.5
  const mode: 'dark' | 'light' = bgL < 0.5 ? 'dark' : 'light';

  // Hue: null if achromatic (very low/high lightness or very low chroma)
  const hue = (bgC < 0.01 || bgL < 0.05 || bgL > 0.95) ? null : Math.round(bgH);

  // Contrast: APCA Lc between bg and each color
  const contrast = {} as ThemeContrast;
  for (const key of ['fg', ...ANSI_KEYS] as const) {
    const fg = colors[key as keyof ThemeColors];
    contrast[key as keyof ThemeContrast] = Math.round(Math.abs(computeApcaLc(fg, colors.bg)) * 10) / 10;
  }

  // Accent: find the most chromatic ANSI color, match to CSS keyword
  let maxChroma = 0;
  let accentHue = 0;
  for (const key of ANSI_KEYS) {
    const [, c, h] = hexToOklch(colors[key as keyof ThemeColors]);
    if (c > maxChroma) {
      maxChroma = c;
      accentHue = h;
    }
  }
  const accent = closestCssColor(accentHue);

  // Source stats
  const stats = ext.statistics || [];
  const getStat = (name: string) => stats.find(s => s.statisticName === name)?.value || 0;

  // Author and repo from extension properties
  const author = ext.publisher.displayName || ext.publisher.publisherName;
  const props = ext.versions[0]?.properties || [];
  const getProp = (key: string) => props.find(p => p.key === key)?.value || null;
  const repo = getProp('Microsoft.VisualStudio.Services.Links.GitHub')
    || getProp('Microsoft.VisualStudio.Services.Links.Source')
    || null;
  // Clean repo URL: strip .git suffix
  const cleanRepo = repo?.replace(/\.git$/, '') || null;

  return {
    name,
    source: {
      marketplace_id: `${ext.publisher.publisherName}.${ext.extensionName}`,
      version: ext.versions[0]?.version || '0.0.0',
      installs: Math.round(getStat('install')),
      rating: Math.round(getStat('averagerating') * 100) / 100,
      ratings: Math.round(getStat('ratingcount')),
      author,
      repo: cleanRepo,
      url: `https://marketplace.visualstudio.com/items?itemName=${ext.publisher.publisherName}.${ext.extensionName}`,
    },
    colors,
    meta: { mode, accent, hue, contrast },
  };
}

function closestCssColor(hue: number): string {
  let closest = 'red';
  let minDist = Infinity;
  for (const [name, [h]] of Object.entries(CSS_COLORS)) {
    const dist = Math.min(Math.abs(hue - h), 360 - Math.abs(hue - h));
    if (dist < minDist) {
      minDist = dist;
      closest = name;
    }
  }
  return closest;
}

// ── Filename ──

function themeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.yaml';
}

// ── Main ──

async function main() {
  console.log('🎨 Theme Scraper — VSCode Marketplace\n');

  mkdirSync(THEMES_DIR, { recursive: true });

  // Load existing index for incremental runs
  const indexPath = join(THEMES_DIR, 'index.json');
  const existingIndex: Record<string, string> = existsSync(indexPath)
    ? JSON.parse(readFileSync(indexPath, 'utf8'))
    : {};

  const index: Record<string, string> = { ...existingIndex };
  let totalProcessed = 0;
  let totalWritten = 0;
  let page = 1;

  // Phase 1: Paginate marketplace
  console.log('📋 Fetching extension list...');
  const { total } = await fetchPage(1);
  const maxPages = Math.min(Math.ceil(total / PAGE_SIZE), Math.ceil(LIMIT / PAGE_SIZE));
  console.log(`   ${total} color theme extensions found (scraping up to ${Math.min(total, LIMIT)})\n`);

  while (page <= maxPages && totalProcessed < LIMIT) {
    console.log(`📄 Page ${page}/${maxPages}...`);

    const { extensions } = await fetchPage(page);
    if (extensions.length === 0) break;

    // Process extensions in batches for concurrency
    for (let i = 0; i < extensions.length; i += CONCURRENCY) {
      const batch = extensions.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(downloadAndExtractThemes));

      for (const themes of results) {
        for (const { name, colors, extension } of themes) {
          totalProcessed++;

          // Enrich + write
          const theme = enrichTheme(name, colors, extension);
          const filename = themeFilename(theme.name);

          // Avoid name collisions
          let finalFilename = filename;
          if (index[theme.name] && index[theme.name] !== finalFilename) {
            const publisher = extension.publisher.publisherName;
            finalFilename = themeFilename(`${theme.name}-${publisher}`);
          }

          const yaml = serializeThemeYAML(theme);
          writeFileSync(join(THEMES_DIR, finalFilename), yaml, 'utf8');
          index[theme.name] = finalFilename;
          totalWritten++;

          if (totalWritten % 50 === 0) {
            process.stdout.write(`   ✅ ${totalWritten} themes written\r`);
          }
        }
      }

      if (totalProcessed >= LIMIT) break;
    }

    page++;
    await Bun.sleep(DELAY_BETWEEN_PAGES);
  }

  // Write index
  const sortedIndex = Object.fromEntries(
    Object.entries(index).sort((a, b) => a[0].localeCompare(b[0]))
  );
  writeFileSync(indexPath, JSON.stringify(sortedIndex, null, 2) + '\n', 'utf8');

  console.log(`\n\n📊 Done!`);
  console.log(`   Processed: ${totalProcessed} theme files`);
  console.log(`   Written: ${totalWritten} themes`);
  console.log(`   Index: ${Object.keys(index).length} entries → themes/index.json`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
