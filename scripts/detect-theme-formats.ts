/**
 * detect-theme-formats.ts — Scans theme GitHub repos for native format files
 *
 * For each theme YAML with a GitHub repo URL, fetches the file tree via the
 * GitHub API and detects native theme files (iTerm2, Ghostty, Alacritty, etc.).
 * Writes pinned raw.githubusercontent.com URLs into source.formats in each YAML.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx bun run scripts/detect-theme-formats.ts
 *   GITHUB_TOKEN=ghp_xxx bun run scripts/detect-theme-formats.ts --dry-run
 *   GITHUB_TOKEN=ghp_xxx bun run scripts/detect-theme-formats.ts --limit 200
 *   GITHUB_TOKEN=ghp_xxx bun run scripts/detect-theme-formats.ts --resume   # skip already scanned
 *
 * Rate limits:
 *   Authenticated: 5,000 req/hr  (2 calls per repo → ~2,500 repos/hr)
 *   The script monitors X-RateLimit-* headers and auto-pauses when low.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseThemeYAML, serializeThemeYAML } from '../cli/src/theme-schema';

// ── Config ──

const THEMES_DIR = join(import.meta.dir, '..', 'themes');
const CONCURRENCY = 8;
const RATELIMIT_PAUSE_THRESHOLD = 20;  // pause when remaining < this
const RATELIMIT_BUFFER_MS = 5000;      // extra buffer after reset

// ── CLI args ──

const args = process.argv.slice(2);
let DRY_RUN = false;
let LIMIT = Infinity;
let RESUME = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dry-run') DRY_RUN = true;
  if (args[i] === '--resume') RESUME = true;
  if (args[i] === '--limit' && args[i + 1]) LIMIT = parseInt(args[++i]);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('❌  GITHUB_TOKEN env var required. Get one at https://github.com/settings/tokens');
  process.exit(1);
}

// ── Format pattern definitions ──

type AppKey =
  | 'ghostty' | 'iterm2' | 'alacritty' | 'kitty' | 'windows-terminal'
  | 'warp' | 'hyper' | 'xcode' | 'android-studio' | 'vim' | 'nvim'
  | 'sublime' | 'zed';

const APP_PATTERNS: Record<AppKey, RegExp[]> = {
  ghostty: [
    /(?:^|[/\\])ghostty[/\\][^/\\]+\.conf$/i,
    /(?:^|[/\\])ghostty[/\\][^/\\]+$/i,
  ],
  iterm2: [
    /\.itermcolors$/i,
  ],
  alacritty: [
    /(?:^|[/\\])alacritty[/\\][^/\\]+\.(toml|yml|yaml)$/i,
    /[^/\\]*alacritty[^/\\]*\.(toml|yml|yaml)$/i,
  ],
  kitty: [
    /(?:^|[/\\])kitty[/\\][^/\\]+\.conf$/i,
    /[^/\\]*\.kitty$/i,
  ],
  'windows-terminal': [
    /(?:^|[/\\])(?:windows[_-]?terminal|wt)[/\\][^/\\]+\.json$/i,
    /[^/\\]*windows[_-]?terminal[^/\\]*\.json$/i,
  ],
  warp: [
    /(?:^|[/\\])warp[/\\][^/\\]+\.yaml$/i,
    /[^/\\]*\.warp-theme$/i,
  ],
  hyper: [
    /(?:^|[/\\])hyper[/\\][^/\\]+\.js$/i,
  ],
  xcode: [
    /\.xccolortheme$/i,
  ],
  'android-studio': [
    /\.icls$/i,
    /(?:^|[/\\])(?:intellij|android[_-]?studio)[/\\][^/\\]+\.xml$/i,
  ],
  vim: [
    /(?:^|[/\\])colors[/\\][^/\\]+\.vim$/i,
  ],
  nvim: [
    /(?:^|[/\\])(?:nvim|neovim)[/\\][^/\\]+\.lua$/i,
    /(?:^|[/\\])lua[/\\](?:[^/\\]+[/\\])*[^/\\]+\.lua$/i,
  ],
  sublime: [
    /\.tmTheme$/i,
    /\.sublime-color-scheme$/i,
  ],
  zed: [
    /(?:^|[/\\])zed[/\\][^/\\]+\.json$/i,
    /[^/\\]*zed[^/\\]*\.json$/i,
  ],
};

function detectFormats(paths: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [app, patterns] of Object.entries(APP_PATTERNS) as [AppKey, RegExp[]][]) {
    for (const pattern of patterns) {
      const match = paths.find(p => pattern.test(p));
      if (match) {
        result[app] = match;
        break;
      }
    }
  }
  return result;
}

// ── GitHub API ──

interface RateLimitState {
  remaining: number;
  reset: number;  // Unix timestamp (seconds)
}

const rateLimitState: RateLimitState = { remaining: 5000, reset: 0 };

async function githubFetch(url: string, retries = 6): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    // Pre-emptive rate limit pause
    if (rateLimitState.remaining < RATELIMIT_PAUSE_THRESHOLD) {
      const now = Math.floor(Date.now() / 1000);
      const waitSecs = Math.max(0, rateLimitState.reset - now) + (RATELIMIT_BUFFER_MS / 1000);
      if (waitSecs > 0) {
        const resetAt = new Date((rateLimitState.reset + RATELIMIT_BUFFER_MS / 1000) * 1000).toLocaleTimeString();
        process.stdout.write(`\n   ⏸  Rate limit low (${rateLimitState.remaining} remaining). Pausing ${Math.ceil(waitSecs)}s until ${resetAt}...\n`);
        await Bun.sleep(waitSecs * 1000);
        rateLimitState.remaining = 5000;
      }
    }

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    // Update rate limit state from headers
    const remaining = res.headers.get('X-RateLimit-Remaining');
    const reset = res.headers.get('X-RateLimit-Reset');
    if (remaining) rateLimitState.remaining = parseInt(remaining);
    if (reset) rateLimitState.reset = parseInt(reset);

    if (res.status === 200) return res;

    // 404 = repo not found or private — no point retrying
    if (res.status === 404) return null;

    // 403 = rate limit exceeded or auth issue
    if (res.status === 403) {
      const body = await res.text().catch(() => '');
      if (body.includes('rate limit')) {
        const waitSecs = Math.max(60, rateLimitState.reset - Math.floor(Date.now() / 1000)) + 5;
        process.stdout.write(`\n   🚫 Rate limit exceeded. Waiting ${waitSecs}s...\n`);
        await Bun.sleep(waitSecs * 1000);
        continue;
      }
      return null; // auth error, not retriable
    }

    // 429 = secondary rate limit (abuse detection) — exponential backoff
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      const wait = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 2000;
      process.stdout.write(`\n   ⚠️  429 secondary rate limit. Waiting ${Math.ceil(wait / 1000)}s...\n`);
      await Bun.sleep(wait);
      continue;
    }

    // 5xx — retry with backoff
    if (res.status >= 500) {
      const wait = Math.pow(2, attempt) * 1000;
      await Bun.sleep(wait);
      continue;
    }

    // Anything else (301 redirect without following, etc.) — skip
    return null;
  }

  return null;
}

interface RepoInfo {
  defaultBranch: string;
}

async function getRepoInfo(owner: string, repo: string): Promise<RepoInfo | null> {
  const res = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res) return null;
  try {
    const data = await res.json();
    return { defaultBranch: data.default_branch || 'main' };
  } catch {
    return null;
  }
}

interface TreeFile {
  path: string;
  type: string;
}

async function getRepoTree(owner: string, repo: string, branch: string): Promise<TreeFile[] | null> {
  const res = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
  if (!res) return null;
  try {
    const data = await res.json();
    if (data.truncated) {
      // Tree truncated (>100k files) — extremely rare for theme repos, proceed anyway
      process.stdout.write(` [truncated]`);
    }
    return (data.tree || []).filter((f: TreeFile) => f.type === 'blob');
  } catch {
    return null;
  }
}

// ── Repo URL parsing ──

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?(?:[/#?].*)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function buildRawUrl(owner: string, repo: string, branch: string, path: string): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

// ── Main ──

async function processRepo(
  yamlFile: string,
  repoUrl: string,
): Promise<{ formats: Record<string, string>; app_count: number } | null> {
  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) return null;

  const { owner, repo } = parsed;

  const info = await getRepoInfo(owner, repo);
  if (!info) return null;

  const tree = await getRepoTree(owner, repo, info.defaultBranch);
  if (!tree) return null;

  const paths = tree.map(f => f.path);
  const detected = detectFormats(paths);

  // Build full raw URLs
  const formats: Record<string, string> = {};
  for (const [app, path] of Object.entries(detected)) {
    formats[app] = buildRawUrl(owner, repo, info.defaultBranch, path);
  }

  return { formats, app_count: Object.keys(formats).length };
}

async function main() {
  console.log('🔍 detect-theme-formats — GitHub repo scanner\n');
  if (DRY_RUN) console.log('   DRY RUN — no files will be written\n');

  const yamlFiles = readdirSync(THEMES_DIR)
    .filter(f => f.endsWith('.yaml') && f !== 'index.json');

  // Load all themes with a GitHub repo URL
  interface Task {
    file: string;
    repoUrl: string;
    name: string;
    alreadyScanned: boolean;
  }

  const tasks: Task[] = [];
  for (const file of yamlFiles) {
    try {
      const raw = readFileSync(join(THEMES_DIR, file), 'utf8');
      const theme = parseThemeYAML(raw);
      const repoUrl = theme.source?.repo;
      if (!repoUrl || !repoUrl.includes('github.com')) continue;
      const alreadyScanned = theme.source.formats !== undefined;
      tasks.push({ file, repoUrl, name: theme.name, alreadyScanned });
    } catch {
      // Skip unparseable
    }
  }

  const toProcess = tasks
    .filter(t => !RESUME || !t.alreadyScanned)
    .slice(0, LIMIT);

  const skipped = tasks.filter(t => RESUME && t.alreadyScanned).length;
  const total = toProcess.length;

  console.log(`   ${tasks.length} themes with GitHub repos`);
  if (RESUME && skipped > 0) console.log(`   ${skipped} already scanned — skipping (--resume)`);
  console.log(`   ${total} to scan\n`);

  if (total === 0) {
    console.log('Nothing to do.');
    return;
  }

  let done = 0;
  let withFormats = 0;
  let totalFormatsFound = 0;
  let errors = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      batch.map(async task => {
        const result = await processRepo(task.file, task.repoUrl);
        return { task, result };
      })
    );

    for (const { task, result } of results) {
      done++;
      const pct = Math.round((done / total) * 100);
      const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));

      if (result === null) {
        errors++;
        process.stdout.write(`\r   [${bar}] ${pct}% (${done}/${total}) — ⚠ skipped ${task.name.slice(0, 30)}   `);
        continue;
      }

      const { formats, app_count } = result;
      if (app_count > 0) {
        withFormats++;
        totalFormatsFound += app_count;
        const apps = Object.keys(formats).join(', ');
        process.stdout.write(`\r   [${bar}] ${pct}% (${done}/${total}) — ✓ ${task.name.slice(0, 25)}: [${apps}]   `);
      } else {
        process.stdout.write(`\r   [${bar}] ${pct}% (${done}/${total}) — · ${task.name.slice(0, 30)}   `);
      }

      if (!DRY_RUN) {
        // Update YAML in-place
        try {
          const raw = readFileSync(join(THEMES_DIR, task.file), 'utf8');
          const theme = parseThemeYAML(raw);
          theme.source.formats = Object.keys(formats).length > 0 ? formats : null;
          writeFileSync(join(THEMES_DIR, task.file), serializeThemeYAML(theme), 'utf8');
        } catch (err) {
          process.stderr.write(`\n   ❌ Failed to write ${task.file}: ${err}\n`);
        }
      }
    }
  }

  process.stdout.write('\n');
  console.log(`\n📊 Done!`);
  console.log(`   Scanned: ${done} repos`);
  console.log(`   With native formats: ${withFormats} themes (${totalFormatsFound} total format files)`);
  console.log(`   Unreachable / private: ${errors}`);
  if (DRY_RUN) console.log(`   (dry run — no files written)`);
}

main().catch(err => {
  console.error('\n\nFatal error:', err);
  process.exit(1);
});
