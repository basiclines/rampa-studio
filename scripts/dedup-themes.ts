/**
 * Theme Deduplication Script
 *
 * Finds themes with identical color palettes (by MD5 fingerprint),
 * keeps the best one based on installs → rating → name length,
 * and removes the rest.
 *
 * Usage: bun run scripts/dedup-themes.ts [--dry-run]
 */

import { readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parseThemeYAML, ANSI_KEYS, type ThemeYAML, type ThemeColors } from '../cli/src/theme-schema';

const THEMES_DIR = join(import.meta.dir, '..', 'themes');
const DRY_RUN = process.argv.includes('--dry-run');

// ── Fingerprint ──

function colorFingerprint(colors: ThemeColors): string {
  const values = [colors.bg, colors.fg, ...ANSI_KEYS.map(k => colors[k as keyof ThemeColors])];
  return createHash('md5').update(values.join(',')).digest('hex');
}

// ── Scoring ──
// Higher is better — installs dominate, then shorter name (original vs fork)

function score(theme: ThemeYAML): number {
  const installs = theme.source?.installs || 0;
  const namePenalty = theme.name.length; // shorter names are more likely the original
  return installs * 1000 - namePenalty;
}

// ── Main ──

function main() {
  console.log('🧹 Theme Deduplication Script\n');

  const files = readdirSync(THEMES_DIR).filter(f => f.endsWith('.yaml'));
  console.log(`   Loaded ${files.length} theme files`);

  // Group by color fingerprint
  const groups = new Map<string, { filename: string; theme: ThemeYAML }[]>();

  let parseErrors = 0;
  for (const filename of files) {
    try {
      const raw = readFileSync(join(THEMES_DIR, filename), 'utf8');
      const theme = parseThemeYAML(raw);
      const fp = colorFingerprint(theme.colors);

      if (!groups.has(fp)) groups.set(fp, []);
      groups.get(fp)!.push({ filename, theme });
    } catch {
      parseErrors++;
    }
  }

  if (parseErrors > 0) {
    console.log(`   ⚠️  ${parseErrors} files failed to parse (skipped)`);
  }

  // Find duplicates
  const dupGroups = [...groups.entries()].filter(([, g]) => g.length > 1);
  const totalDups = dupGroups.reduce((sum, [, g]) => sum + g.length - 1, 0);

  console.log(`   ${groups.size} unique color fingerprints`);
  console.log(`   ${dupGroups.length} groups with duplicates (${totalDups} removals)\n`);

  if (DRY_RUN) {
    console.log('   (dry run — no files modified)\n');
  }

  // Process each group: keep best, remove rest
  let removed = 0;
  const removedNames: string[] = [];
  const index: Record<string, string> = JSON.parse(
    readFileSync(join(THEMES_DIR, 'index.json'), 'utf8')
  );

  let examples = 0;
  for (const [, group] of dupGroups) {
    // Sort by score descending — best first
    group.sort((a, b) => score(b.theme) - score(a.theme));

    const keeper = group[0];
    const dupes = group.slice(1);

    if (examples < 20) {
      const keepInfo = `${keeper.theme.name} (${keeper.theme.source?.installs || 0} installs)`;
      const dupeNames = dupes.map(d => d.theme.name).join(', ');
      console.log(`   ✅ Keep: ${keepInfo}`);
      console.log(`   ❌ Drop: ${dupeNames}`);
      console.log('');
      examples++;
    }

    for (const dupe of dupes) {
      removedNames.push(dupe.theme.name);

      // Remove from index
      delete index[dupe.theme.name];

      if (!DRY_RUN) {
        // Delete file
        try {
          unlinkSync(join(THEMES_DIR, dupe.filename));
        } catch {}
      }
      removed++;
    }
  }

  if (examples < dupGroups.length) {
    console.log(`   ... and ${dupGroups.length - examples} more groups\n`);
  }

  // Write updated index
  if (!DRY_RUN) {
    const sortedIndex = Object.fromEntries(
      Object.entries(index).sort((a, b) => a[0].localeCompare(b[0]))
    );
    writeFileSync(join(THEMES_DIR, 'index.json'), JSON.stringify(sortedIndex, null, 2) + '\n', 'utf8');
  }

  console.log(`📊 Done!`);
  console.log(`   Removed: ${removed} duplicate themes`);
  console.log(`   Remaining: ${Object.keys(index).length} themes in index`);
}

main();
