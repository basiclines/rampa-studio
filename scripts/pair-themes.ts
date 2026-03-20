/**
 * Theme Pairing Script
 *
 * Matches dark/light theme pairs by name similarity and same publisher.
 * Writes `meta.pair` into each YAML file pointing to its counterpart.
 *
 * Usage: bun run scripts/pair-themes.ts [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseThemeYAML, serializeThemeYAML, type ThemeYAML } from '../cli/src/theme-schema';

const THEMES_DIR = join(import.meta.dir, '..', 'themes');
const DRY_RUN = process.argv.includes('--dry-run');

// ── Name normalization ──

// Suffixes that indicate dark/light mode in theme names
const DARK_TOKENS = ['dark', 'night', 'midnight', 'noir', 'black', 'darker', 'deep', 'dim', 'dimmed', 'dusk', 'twilight', 'eve', 'evening'];
const LIGHT_TOKENS = ['light', 'day', 'dawn', 'morning', 'bright', 'lighter', 'sunrise', 'noon'];
const ALL_MODE_TOKENS = [...DARK_TOKENS, ...LIGHT_TOKENS];

// Patterns that separate the "base name" from the mode indicator
// e.g. "Gruvbox Dark Medium" → base: "Gruvbox Medium", mode suffix: "Dark"
// e.g. "Tokyo Night Light" → base: "Tokyo Night", mode suffix: "Light"  (but "Night" is also part of the name)
function extractBaseName(name: string): { base: string; modeToken: string | null } {
  // Split on whitespace; also split hyphenated single-word names
  // e.g. "empire-monokai-dark" → ["empire-monokai", "dark"]
  let words = name.split(/\s+/);
  if (words.length === 1 && name.includes('-')) {
    const parts = name.split('-');
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (ALL_MODE_TOKENS.includes(lastPart)) {
      return {
        base: parts.slice(0, -1).join('-'),
        modeToken: lastPart,
      };
    }
    // Also check second-to-last for cases like "theme-dark-v2"
    if (parts.length > 2) {
      const secondLast = parts[parts.length - 2].toLowerCase();
      if (ALL_MODE_TOKENS.includes(secondLast)) {
        const remaining = [...parts.slice(0, -2), ...parts.slice(-1)];
        return {
          base: remaining.join('-'),
          modeToken: secondLast,
        };
      }
    }
  }

  // Strip surrounding punctuation from each word before token-matching
  // so "(Dark)" → "dark", "(Light)" → "light" etc.
  const stripped = (w: string) => w.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');

  // Try removing a single mode token from the end first
  const lastWord = stripped(words[words.length - 1]);
  if (ALL_MODE_TOKENS.includes(lastWord) && words.length > 1) {
    return {
      base: words.slice(0, -1).join(' '),
      modeToken: lastWord,
    };
  }

  // Try removing from the middle/start — find the last mode token
  for (let i = words.length - 1; i >= 0; i--) {
    const lower = stripped(words[i]);
    if (ALL_MODE_TOKENS.includes(lower) && words.length > 1) {
      const remaining = [...words.slice(0, i), ...words.slice(i + 1)];
      return {
        base: remaining.join(' '),
        modeToken: lower,
      };
    }
  }

  return { base: name, modeToken: null };
}

function isOppositeMode(tokenA: string, tokenB: string): boolean {
  const aIsDark = DARK_TOKENS.includes(tokenA);
  const aIsLight = LIGHT_TOKENS.includes(tokenA);
  const bIsDark = DARK_TOKENS.includes(tokenB);
  const bIsLight = LIGHT_TOKENS.includes(tokenB);
  return (aIsDark && bIsLight) || (aIsLight && bIsDark);
}

function normalizeForComparison(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ── Load themes ──

interface ThemeEntry {
  filename: string;
  theme: ThemeYAML;
  base: string;
  baseNorm: string;
  modeToken: string | null;
}

function loadAllThemes(): ThemeEntry[] {
  const files = readdirSync(THEMES_DIR).filter(f => f.endsWith('.yaml'));
  const entries: ThemeEntry[] = [];

  for (const filename of files) {
    try {
      const raw = readFileSync(join(THEMES_DIR, filename), 'utf8');
      const theme = parseThemeYAML(raw);
      const { base, modeToken } = extractBaseName(theme.name);
      entries.push({
        filename,
        theme,
        base,
        baseNorm: normalizeForComparison(base),
        modeToken,
      });
    } catch {
      // Skip unparseable files
    }
  }

  return entries;
}

// ── Pairing logic ──

function findPairs(entries: ThemeEntry[]): Map<string, string> {
  // Group by normalized base name
  const groups = new Map<string, ThemeEntry[]>();
  for (const entry of entries) {
    if (!entry.modeToken) continue; // No mode indicator — can't pair
    const key = entry.baseNorm;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  const pairs = new Map<string, string>(); // theme name → paired theme name

  for (const [, group] of groups) {
    if (group.length < 2) continue;

    // Separate into dark and light candidates
    const darks = group.filter(e => e.modeToken && DARK_TOKENS.includes(e.modeToken));
    const lights = group.filter(e => e.modeToken && LIGHT_TOKENS.includes(e.modeToken));

    if (darks.length === 0 || lights.length === 0) continue;

    // Same publisher gets priority — pair within publisher first
    const pairedDarks = new Set<string>();
    const pairedLights = new Set<string>();

    // Pass 1: Same publisher exact matches
    for (const dark of darks) {
      for (const light of lights) {
        if (pairedDarks.has(dark.theme.name) || pairedLights.has(light.theme.name)) continue;

        const samePublisher = dark.theme.source.marketplace_id.split('.')[0] ===
                              light.theme.source.marketplace_id.split('.')[0];

        if (samePublisher && dark.modeToken && light.modeToken
            && isOppositeMode(dark.modeToken, light.modeToken)
            && dark.theme.meta.mode !== light.theme.meta.mode) {
          pairs.set(dark.theme.name, light.theme.name);
          pairs.set(light.theme.name, dark.theme.name);
          pairedDarks.add(dark.theme.name);
          pairedLights.add(light.theme.name);
        }
      }
    }

    // Pass 2: Cross-publisher (only if unpaired and bases match exactly)
    for (const dark of darks) {
      if (pairedDarks.has(dark.theme.name)) continue;
      for (const light of lights) {
        if (pairedLights.has(light.theme.name)) continue;
        if (dark.baseNorm === light.baseNorm && dark.modeToken && light.modeToken
            && isOppositeMode(dark.modeToken, light.modeToken)
            && dark.theme.meta.mode !== light.theme.meta.mode) {
          pairs.set(dark.theme.name, light.theme.name);
          pairs.set(light.theme.name, dark.theme.name);
          pairedDarks.add(dark.theme.name);
          pairedLights.add(light.theme.name);
          break;
        }
      }
    }
  }

  // Pass 3: Implicit counterpart — one side has a mode token, the other
  // has no token but meta.mode confirms the opposite role.
  // e.g. "Theme (Dark)" ↔ "Theme"  or  "Theme" (dark) ↔ "Theme Dawn"
  const paired = new Set([...pairs.keys()]);

  // Build lookup: normalised full name → entry (for no-token themes)
  const noTokenByNorm = new Map<string, ThemeEntry>();
  for (const entry of entries) {
    if (!entry.modeToken && !paired.has(entry.theme.name)) {
      noTokenByNorm.set(normalizeForComparison(entry.theme.name), entry);
    }
  }

  for (const entry of entries) {
    if (!entry.modeToken || paired.has(entry.theme.name)) continue;

    const implicit = noTokenByNorm.get(entry.baseNorm);
    if (!implicit) continue;
    if (implicit.theme.meta.mode === entry.theme.meta.mode) continue; // same polarity
    if (paired.has(implicit.theme.name)) continue;

    // Require same publisher to avoid false positives across unrelated themes
    const samePublisher = entry.theme.source.marketplace_id.split('.')[0] ===
                          implicit.theme.source.marketplace_id.split('.')[0];
    if (!samePublisher) continue;

    const [dark, light] = entry.theme.meta.mode === 'dark'
      ? [entry, implicit]
      : [implicit, entry];

    pairs.set(dark.theme.name, light.theme.name);
    pairs.set(light.theme.name, dark.theme.name);
    paired.add(dark.theme.name);
    paired.add(light.theme.name);
    noTokenByNorm.delete(entry.baseNorm); // consumed
  }

  return pairs;
}

// ── Main ──

function main() {
  console.log('🔗 Theme Pairing Script\n');

  const entries = loadAllThemes();
  console.log(`   Loaded ${entries.length} themes`);

  const withMode = entries.filter(e => e.modeToken !== null);
  console.log(`   ${withMode.length} have a mode token (dark/light/night/day/...)`);

  const pairs = findPairs(entries);
  console.log(`   ${pairs.size / 2} pairs found\n`);

  if (DRY_RUN) {
    console.log('   (dry run — no files modified)\n');
  }

  // Apply pairs
  let updated = 0;
  const entryMap = new Map(entries.map(e => [e.theme.name, e]));

  for (const [themeName, pairedWith] of pairs) {
    const entry = entryMap.get(themeName);
    if (!entry) continue;

    const currentPair = entry.theme.meta?.pair || null;
    if (currentPair === pairedWith) continue; // Already set

    entry.theme.meta.pair = pairedWith;

    if (!DRY_RUN) {
      const yaml = serializeThemeYAML(entry.theme);
      writeFileSync(join(THEMES_DIR, entry.filename), yaml, 'utf8');
    }

    updated++;
  }

  // Clear stale pairs (themes that had a pair but no longer match)
  let cleared = 0;
  for (const entry of entries) {
    if (entry.theme.meta?.pair && !pairs.has(entry.theme.name)) {
      entry.theme.meta.pair = null;
      if (!DRY_RUN) {
        const yaml = serializeThemeYAML(entry.theme);
        writeFileSync(join(THEMES_DIR, entry.filename), yaml, 'utf8');
      }
      cleared++;
    }
  }

  // Print some example pairs
  const shown = new Set<string>();
  let examples = 0;
  for (const [name, paired] of pairs) {
    if (shown.has(paired)) continue;
    shown.add(name);
    const a = entryMap.get(name)!;
    const b = entryMap.get(paired)!;
    console.log(`   🌗 ${a.theme.name} (${a.theme.meta.mode}) ↔ ${b.theme.name} (${b.theme.meta.mode})`);
    examples++;
    if (examples >= 30) {
      console.log(`   ... and ${pairs.size / 2 - 30} more`);
      break;
    }
  }

  console.log(`\n📊 Done!`);
  console.log(`   Updated: ${updated} files`);
  console.log(`   Cleared: ${cleared} stale pairs`);
  console.log(`   Total pairs: ${pairs.size / 2}`);
}

main();
