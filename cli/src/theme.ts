#!/usr/bin/env node
/**
 * rampa theme — Universal theme installer
 *
 * Usage:
 *   rampa theme list
 *   rampa theme "Dracula" --show
 *   rampa theme "Dracula" --install ghostty
 *   rampa theme "Dracula" --install ghostty --dry-run
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { spawnSync } from 'node:child_process';
import { parseThemeYAML, type ThemeYAML } from './theme-schema';
import { generators, SUPPORTED_APPS, themeFileName } from './theme-generators/index';
import { supportsTruecolor } from './utils/terminal-colors';
import { PREVIEW_TEMPLATE } from './theme-preview-template';

function hexToRgbTuple(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function colorSwatch(hex: string): string {
  const [r, g, b] = hexToRgbTuple(hex);
  return `\x1b[38;2;${r};${g};${b}m■\x1b[0m`;
}

// ── Constants ──

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/basiclines/rampa-studio/main/themes';

// ── Args ──

type SortOption = 'name' | 'installs' | 'rating' | 'ratings' | 'mode';

interface ThemeArgs {
  command: 'list' | 'show' | 'install' | 'preview';
  name: string;
  app: string;
  dryRun: boolean;
  local: boolean;
  all: boolean;
  sort: SortOption[];
  paired: boolean;
}

function showThemeHelp(): void {
  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';

  const help = `
${bold}rampa theme${reset} — Universal color theme installer

${bold}USAGE${reset}
  ${cyan}rampa theme list${reset}                            ${dim}List all available themes${reset}
  ${cyan}rampa theme list "query"${reset}                    ${dim}Search themes by name${reset}
  ${cyan}rampa theme list --paired${reset}                   ${dim}Only dark/light pairs (one row per pair)${reset}
  ${cyan}rampa theme "Dracula" --show${reset}                ${dim}Show theme colors${reset}
  ${cyan}rampa theme "Dracula" --install ghostty${reset}     ${dim}Install theme for an app${reset}
  ${cyan}rampa theme "Dracula" --install ghostty --dry-run${reset}  ${dim}Preview without writing${reset}

${bold}SUPPORTED APPS${reset}
  ${SUPPORTED_APPS.map(a => `${cyan}${a}${reset}`).join(', ')}

${bold}OPTIONS${reset}
  ${cyan}--install <app>${reset}        ${dim}Target app to generate theme for${reset}
  ${cyan}--show${reset}                 ${dim}Print theme colors and metadata${reset}
  ${cyan}--preview${reset}              ${dim}Open interactive browser preview${reset}
  ${cyan}--dry-run${reset}              ${dim}Print generated output without writing file${reset}
  ${cyan}--all${reset}                  ${dim}Show all themes (list shows 100 by default)${reset}
  ${cyan}--paired${reset}               ${dim}Show only themes that have a dark/light pair (one per pair)${reset}
  ${cyan}--sort <field>${reset}         ${dim}Sort by: name (default), installs, rating, ratings, mode. Chain multiple: --sort rating --sort installs${reset}
  ${cyan}--local${reset}                ${dim}Use local themes/ directory instead of fetching from GitHub${reset}
  ${cyan}-h, --help${reset}             ${dim}Show this help${reset}

${bold}EXAMPLES${reset}
  ${cyan}rampa theme list${reset}
  ${cyan}rampa theme list "Nord"${reset}
  ${cyan}rampa theme list --paired${reset}
  ${cyan}rampa theme list --paired "Solarized"${reset}
  ${cyan}rampa theme list --sort rating --all${reset}
  ${cyan}rampa theme "Tokyo Night" --show${reset}
  ${cyan}rampa theme "Gruvbox Dark Hard" --install alacritty${reset}
  ${cyan}rampa theme "Dracula" --install ghostty,kitty,iterm2${reset}
  ${cyan}rampa theme "Catppuccin Mocha" --install warp --dry-run${reset}
`;
  console.log(help);
  process.exit(0);
}

export function parseThemeArgs(argv: string[]): ThemeArgs {
  const args: ThemeArgs = {
    command: 'list',
    name: '',
    app: '',
    dryRun: false,
    local: false,
    all: false,
    sort: ['name'],
    paired: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      showThemeHelp();
    }

    if (arg === '--install' && argv[i + 1]) {
      args.command = 'install';
      args.app = argv[++i];
      i++;
      continue;
    }

    if (arg === '--show') {
      args.command = 'show';
      i++;
      continue;
    }

    if (arg === '--dry-run') {
      args.dryRun = true;
      i++;
      continue;
    }

    if (arg === '--local') {
      args.local = true;
      i++;
      continue;
    }

    if (arg === '--all') {
      args.all = true;
      i++;
      continue;
    }

    if (arg === '--preview') {
      args.command = 'preview';
      i++;
      continue;
    }

    if (arg === '--paired') {
      args.paired = true;
      i++;
      continue;
    }

    if (arg === '--sort' && argv[i + 1]) {
      const val = argv[++i] as SortOption;
      if (['name', 'installs', 'rating', 'ratings', 'mode'].includes(val)) {
        if (args.sort.length === 1 && args.sort[0] === 'name') {
          args.sort = [val]; // replace default
        } else {
          args.sort.push(val);
        }
      }
      i++;
      continue;
    }

    if (arg === 'list') {
      args.command = 'list';
      i++;
      continue;
    }

    // Positional: theme name
    if (!arg.startsWith('-') && !args.name) {
      args.name = arg;
      i++;
      continue;
    }

    i++;
  }

  return args;
}

// ── Theme loading ──

function resolveThemesDir(): string {
  // Try multiple starting points — compiled binaries can't use import.meta.url
  const startDirs = [
    process.cwd(),
    dirname(process.argv[0]),
  ];
  try { startDirs.push(dirname(new URL(import.meta.url).pathname)); } catch {}

  for (const start of startDirs) {
    let dir = start;
    for (let i = 0; i < 10; i++) {
      const candidate = join(dir, 'themes');
      if (existsSync(candidate)) return candidate;
      dir = dirname(dir);
    }
  }
  return join(process.cwd(), 'themes');
}

async function fetchIndex(local: boolean): Promise<Record<string, string>> {
  if (local) {
    const themesDir = resolveThemesDir();
    const indexPath = join(themesDir, 'index.json');
    if (existsSync(indexPath)) {
      return JSON.parse(readFileSync(indexPath, 'utf8'));
    }
    // Build index from directory listing
    const files = readdirSync(themesDir).filter(f => f.endsWith('.yaml'));
    const index: Record<string, string> = {};
    for (const f of files) {
      const raw = readFileSync(join(themesDir, f), 'utf8');
      const nameMatch = raw.match(/^name:\s*"?([^"\n]+)"?/m);
      if (nameMatch) {
        index[nameMatch[1]] = f;
      }
    }
    return index;
  }

  // Fetch from GitHub
  const url = `${GITHUB_RAW_BASE}/index.json`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch theme index from ${url} (${res.status})`);
    console.error('Try using --local if you have themes/ locally');
    process.exit(1);
  }
  return res.json();
}

async function fetchTheme(filename: string, local: boolean): Promise<ThemeYAML> {
  let raw: string;

  if (local) {
    const themesDir = resolveThemesDir();
    raw = readFileSync(join(themesDir, filename), 'utf8');
  } else {
    const url = `${GITHUB_RAW_BASE}/${filename}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch theme: ${url} (${res.status})`);
      process.exit(1);
    }
    raw = await res.text();
  }

  return parseThemeYAML(raw);
}

function findTheme(index: Record<string, string>, name: string): string | null {
  // Exact match
  if (index[name]) return index[name];

  // Case-insensitive match
  const lower = name.toLowerCase();
  for (const [key, file] of Object.entries(index)) {
    if (key.toLowerCase() === lower) return file;
  }

  // Fuzzy: check if query is contained in theme name
  for (const [key, file] of Object.entries(index)) {
    if (key.toLowerCase().includes(lower)) return file;
  }

  return null;
}

// ── Path resolution ──

function resolveInstallPath(basePath: string): string {
  let resolved = basePath;
  if (resolved.startsWith('~')) {
    resolved = resolved.replace('~', homedir());
  }
  if (resolved.includes('%APPDATA%')) {
    resolved = resolved.replace('%APPDATA%', process.env.APPDATA || '');
  }
  if (resolved.includes('%LOCALAPPDATA%')) {
    resolved = resolved.replace('%LOCALAPPDATA%', process.env.LOCALAPPDATA || '');
  }
  return resolve(resolved);
}

// ── Commands ──

/**
 * Fuzzy match: returns a score ≥ 0 if query matches target, or -1 if no match.
 * Higher score = better match (substring > prefix > subsequence).
 */
function fuzzyScore(target: string, query: string): number {
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 1000;
  const idx = t.indexOf(q);
  if (idx === 0) return 900;         // prefix match
  if (idx > 0)  return 800 - idx;   // substring match (earlier = better)
  // subsequence match
  let ti = 0, qi = 0;
  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) qi++;
    ti++;
  }
  return qi === q.length ? 100 - ti : -1;
}

async function listThemes(local: boolean, all: boolean, sorts: SortOption[], query?: string, paired = false): Promise<void> {
  const index = await fetchIndex(local);
  let entries = Object.entries(index);

  // Fuzzy filter when a query is provided.
  // Threshold > 100 accepts all substring matches (score = 800 - offset)
  // but excludes pure subsequence matches (max score = 100).
  if (query) {
    const scored = entries
      .map(e => ({ e, score: fuzzyScore(e[0], query) }))
      .filter(x => x.score > 100)
      .sort((a, b) => b.score - a.score);
    entries = scored.map(x => x.e);
  }

  if (entries.length === 0) {
    console.log(query ? `\n  No themes matching "${query}".\n` : 'No themes found. Run the scraper first or check your themes/ directory.');
    return;
  }

  const dim = '\x1b[2m';
  const reset = '\x1b[0m';
  const needsMeta = sorts.some(s => s !== 'name') || paired;

  // Read metadata from YAML files when sorting by anything other than name,
  // or when --paired filtering requires pair + mode fields.
  const meta = new Map<string, { installs: number; rating: number; ratings: number; mode: string; pair: string | null }>();
  if ((needsMeta || paired) && local) {
    const themesDir = resolveThemesDir();
    for (const [name, filename] of entries) {
      try {
        const raw = readFileSync(join(themesDir, filename), 'utf8');
        const theme = parseThemeYAML(raw);
        meta.set(name, {
          installs: theme.source?.installs || 0,
          rating: theme.source?.rating || 0,
          ratings: theme.source?.ratings || 0,
          mode: theme.meta?.mode || 'dark',
          pair: theme.meta?.pair ?? null,
        });
      } catch {
        meta.set(name, { installs: 0, rating: 0, ratings: 0, mode: 'dark', pair: null });
      }
    }
  }

  // --paired: keep only themes that have a pair, then deduplicate so only
  // the dark member of each pair is shown (fall back to first alphabetically).
  if (paired) {
    const seen = new Set<string>();
    entries = entries.filter(([name]) => {
      const m = meta.get(name);
      if (!m?.pair) return false;                // no pair → exclude
      // Build a canonical key from the two names sorted alphabetically
      const key = [name, m.pair].sort().join('|');
      if (seen.has(key)) return false;           // already showing the other half
      seen.add(key);
      return true;
    });
    // Within each pair prefer the dark member first
    entries.sort((a, b) => {
      const modeA = meta.get(a[0])?.mode ?? 'dark';
      const modeB = meta.get(b[0])?.mode ?? 'dark';
      if (modeA !== modeB) return modeA === 'dark' ? -1 : 1;
      return a[0].localeCompare(b[0]);
    });
  }

  // Apply sorts in order (first sort is primary, chained sorts break ties)
  entries.sort((a, b) => {
    for (const sort of sorts) {
      let cmp = 0;
      switch (sort) {
        case 'name':
          cmp = a[0].localeCompare(b[0]);
          break;
        case 'installs':
          cmp = (meta.get(b[0])?.installs || 0) - (meta.get(a[0])?.installs || 0);
          break;
        case 'rating':
          cmp = (meta.get(b[0])?.rating || 0) - (meta.get(a[0])?.rating || 0);
          break;
        case 'ratings':
          cmp = (meta.get(b[0])?.ratings || 0) - (meta.get(a[0])?.ratings || 0);
          break;
        case 'mode':
          cmp = (meta.get(a[0])?.mode || '').localeCompare(meta.get(b[0])?.mode || '');
          break;
      }
      if (cmp !== 0) return cmp;
    }
    return 0;
  });

  const limit = 100;
  const total = entries.length;
  if (total === 0) {
    const msg = paired && query ? `No paired themes matching "${query}".`
      : paired ? 'No paired themes found.'
      : `No themes matching "${query}".`;
    console.log(`\n  ${msg}\n`);
    return;
  }
  const shown = all ? entries : entries.slice(0, limit);
  const sortLabel = sorts.join(', ');

  let header: string;
  if (paired && query) header = `\n  ${entries.length} paired theme${entries.length === 1 ? '' : 's'} matching "${query}":\n`;
  else if (paired)     header = `\n  ${entries.length} paired theme${entries.length === 1 ? '' : 's'} (dark/light):\n`;
  else if (query)      header = `\n  ${entries.length} theme${entries.length === 1 ? '' : 's'} matching "${query}":\n`;
  else                 header = `\n  ${entries.length} themes available (sorted by ${sortLabel}):\n`;
  console.log(header);

  for (const [name] of shown) {
    const m = meta.get(name);
    const parts: string[] = [name];
    if (m) {
      const info: string[] = [];
      if (paired && m.pair) info.push(`↔ ${m.pair}`);
      if (sorts.includes('installs')) info.push(`${m.installs.toLocaleString()} installs`);
      if (sorts.includes('rating'))   info.push(`★ ${m.rating.toFixed(1)}`);
      if (sorts.includes('ratings'))  info.push(`${m.ratings} ratings`);
      if (sorts.includes('mode'))     info.push(`(${m.mode})`);
      if (info.length) parts.push(`${dim}${info.join('  ')}${reset}`);
    }
    console.log(`  ${parts.join('  ')}`);
  }

  if (!all && total > limit) {
    console.log(`\n  ${dim}Showing ${limit} of ${total} themes. Use --all to see full list.${reset}`);
  }
  console.log('');
}

async function showTheme(name: string, local: boolean): Promise<void> {
  const index = await fetchIndex(local);
  const file = findTheme(index, name);
  if (!file) {
    console.error(`Theme not found: "${name}"`);
    suggestSimilar(name, Object.keys(index));
    process.exit(1);
  }

  const theme = await fetchTheme(file, local);
  const canPreview = supportsTruecolor();

  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';

  console.log(`\n  ${bold}${theme.name}${reset}  ${dim}(${theme.meta.mode})${reset}`);
  console.log(`  ${dim}by ${theme.source.author}${reset}`);
  if (theme.source.repo) {
    console.log(`  ${dim}${theme.source.repo}${reset}`);
  }
  console.log(`  ${dim}${theme.source.url}${reset}`);
  console.log(`  ${dim}${theme.source.installs.toLocaleString()} installs${reset}\n`);

  const printColor = (label: string, hex: string, contrast?: number) => {
    const swatch = canPreview ? colorSwatch(hex) + ' ' : '';
    const contrastStr = contrast !== undefined ? `  ${dim}Lc ${contrast}${reset}` : '';
    console.log(`  ${swatch}${hex}  ${cyan}${label.padEnd(14)}${reset}${contrastStr}`);
  };

  printColor('bg', theme.colors.bg);
  printColor('fg', theme.colors.fg, theme.meta.contrast.fg);
  console.log('');

  const ansiLabels = [
    'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  ] as const;

  for (const label of ansiLabels) {
    const c = theme.colors[label];
    printColor(label, c, theme.meta.contrast[label]);
  }
  console.log('');
  for (const label of ansiLabels) {
    const brightLabel = `bright${label.charAt(0).toUpperCase() + label.slice(1)}` as keyof typeof theme.colors;
    const c = theme.colors[brightLabel];
    const contrastKey = brightLabel as keyof typeof theme.meta.contrast;
    printColor(brightLabel, c, theme.meta.contrast[contrastKey]);
  }

  console.log(`\n  ${dim}accent: ${theme.meta.accent}  hue: ${theme.meta.hue ?? 'none'}${reset}\n`);
}

async function installTheme(name: string, appList: string, dryRun: boolean, local: boolean): Promise<void> {
  const index = await fetchIndex(local);
  const file = findTheme(index, name);
  if (!file) {
    console.error(`Theme not found: "${name}"`);
    suggestSimilar(name, Object.keys(index));
    process.exit(1);
  }

  const theme = await fetchTheme(file, local);
  const apps = appList.split(',').map(a => a.trim().toLowerCase());

  const green = '\x1b[32m';
  const red = '\x1b[31m';
  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';

  for (const app of apps) {
    const generator = generators[app];
    if (!generator) {
      console.error(`${red}✗${reset} Unknown app: "${app}". Supported: ${SUPPORTED_APPS.join(', ')}`);
      continue;
    }

    const os = platform() as 'darwin' | 'linux' | 'win32';
    const basePath = generator.installPath(os);
    const nativeUrl = theme.source?.formats?.[app];

    // ── Native format: fetch from repo ──
    if (nativeUrl) {
      const nativeFile = nativeUrl.split('/').pop() || themeFileName(theme, generator.fileExtension());

      if (dryRun) {
        console.log(`\n${cyan}── ${generator.name}: ${nativeFile} (native) ──${reset}`);
        console.log(`${dim}Would fetch: ${nativeUrl}${reset}`);
        if (basePath) console.log(`${dim}Would write to: ${resolveInstallPath(basePath)}/${nativeFile}${reset}`);
        continue;
      }

      let content: string;
      try {
        const res = await fetch(nativeUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        content = await res.text();
      } catch (err: any) {
        console.error(`${red}✗${reset} ${generator.name}: failed to fetch native file — ${err.message}`);
        console.log(`${dim}Falling back to generated format...${reset}`);
        // fall through to generator below
        const generated = generator.generate(theme);
        if (basePath) {
          const dir = resolveInstallPath(basePath);
          const filePath = join(dir, themeFileName(theme, generator.fileExtension()));
          try {
            mkdirSync(dir, { recursive: true });
            writeFileSync(filePath, generated, 'utf8');
            console.log(`${green}✓${reset} ${generator.name}: ${filePath} ${dim}(generated)${reset}`);
          } catch (e: any) {
            console.error(`${red}✗${reset} ${generator.name}: ${e.message}`);
          }
        }
        continue;
      }

      if (!basePath) {
        console.log(`${red}✗${reset} ${generator.name}: not supported on ${os}`);
        console.log(`${dim}Native file content:${reset}\n`);
        console.log(content);
        continue;
      }

      const dir = resolveInstallPath(basePath);
      const filePath = join(dir, nativeFile);
      try {
        mkdirSync(dir, { recursive: true });
        writeFileSync(filePath, content, 'utf8');
        console.log(`${green}✓${reset} ${generator.name}: ${filePath} ${dim}(native)${reset}`);
      } catch (err: any) {
        console.error(`${red}✗${reset} ${generator.name}: ${err.message}`);
      }
      continue;
    }

    // ── Generated format: ANSI-16 fallback ──
    const content = generator.generate(theme);
    const ext = generator.fileExtension();
    const fileName = themeFileName(theme, ext);

    if (dryRun) {
      console.log(`\n${cyan}── ${generator.name}: ${fileName} (generated) ──${reset}\n`);
      if (basePath) {
        console.log(`${dim}Would write to: ${resolveInstallPath(basePath)}/${fileName}${reset}\n`);
      } else {
        console.log(`${dim}No install path for ${os} — output only${reset}\n`);
      }
      console.log(content);
      continue;
    }

    if (!basePath) {
      console.log(`${red}✗${reset} ${generator.name}: not supported on ${os}`);
      console.log(`${dim}Generated content:${reset}\n`);
      console.log(content);
      continue;
    }

    const dir = resolveInstallPath(basePath);
    const filePath = join(dir, fileName);

    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, content, 'utf8');
      console.log(`${green}✓${reset} ${generator.name}: ${filePath} ${dim}(generated)${reset}`);
    } catch (err: any) {
      console.error(`${red}✗${reset} ${generator.name}: ${err.message}`);
    }
  }
}

function suggestSimilar(query: string, names: string[]): void {
  const lower = query.toLowerCase();
  const matches = names
    .filter(n => n.toLowerCase().includes(lower) || lower.includes(n.toLowerCase()))
    .slice(0, 5);
  if (matches.length > 0) {
    const dim = '\x1b[2m';
    const reset = '\x1b[0m';
    console.error(`${dim}Did you mean: ${matches.join(', ')}?${reset}`);
  }
}

// ── Preview ──

function buildThemeJS(theme: ThemeYAML, mode: 'dark' | 'light'): string {
  const c = theme.colors;
  const contrast = theme.meta.contrast;
  const makeDescs = () => {
    const result: Record<string, string> = {
      bg: `mode: ${theme.meta.mode}`,
      fg: `Lc ${contrast.fg}`,
    };
    // Map to underscore keys used by the template's colorMeta array
    const keyMap: Record<string, string> = {
      black: 'black', red: 'red', green: 'green', yellow: 'yellow',
      blue: 'blue', magenta: 'magenta', cyan: 'cyan', white: 'white',
      brightBlack: 'black_bright', brightRed: 'red_bright', brightGreen: 'green_bright',
      brightYellow: 'yellow_bright', brightBlue: 'blue_bright',
      brightMagenta: 'magenta_bright', brightCyan: 'cyan_bright', brightWhite: 'white_bright',
    };
    for (const [k, mapped] of Object.entries(keyMap)) {
      result[mapped] = `Lc ${contrast[k as keyof typeof contrast]}`;
    }
    return result;
  };

  return JSON.stringify({
    name: theme.name,
    variant: mode === 'dark' ? 'Dark' : 'Light',
    subtitle: [
      `${theme.meta.mode} mode`,
      theme.meta.accent ? `accent: ${theme.meta.accent}` : null,
      theme.meta.hue !== null ? `hue: ${theme.meta.hue}°` : null,
      theme.source?.installs ? `${theme.source.installs.toLocaleString()} installs` : null,
    ].filter(Boolean).join(' · '),
    terminalComment: `# ${theme.name}`,
    bg: c.bg, fg: c.fg,
    black: c.black, white: c.white,
    black_bright: c.brightBlack, white_bright: c.brightWhite,
    colors: {
      red: c.red, green: c.green, blue: c.blue, yellow: c.yellow,
      magenta: c.magenta, cyan: c.cyan,
      red_bright: c.brightRed, green_bright: c.brightGreen,
      blue_bright: c.brightBlue, yellow_bright: c.brightYellow,
      magenta_bright: c.brightMagenta, cyan_bright: c.brightCyan,
    },
    descs: makeDescs(),
  });
}

function buildCSSVars(theme: ThemeYAML, selector: string): string {
  const c = theme.colors;
  const isLight = theme.meta.mode === 'light';
  const cardBg = isLight ? '#ffffff' : adjustHex(c.bg, 8);
  const muted = isLight
    ? `rgba(${hexToRgbTuple(c.fg).join(',')}, 0.5)`
    : `rgba(${hexToRgbTuple(c.fg).join(',')}, 0.45)`;
  return `  ${selector} {
    --bg: ${c.bg};
    --fg: ${c.fg};
    --card-bg: ${cardBg};
    --card-border: rgba(${hexToRgbTuple(c.fg).join(',')}, 0.08);
    --card-shadow: rgba(0,0,0,0.25);
    --card-shadow-hover: rgba(0,0,0,0.4);
    --muted: ${muted};
    --terminal-bg: ${c.bg};
    --terminal-fg: ${c.fg};
    --terminal-bar: rgba(${isLight ? '0,0,0,0.06' : '255,255,255,0.06'});
    --red: ${c.red};
    --green: ${c.green};
    --blue: ${c.blue};
    --yellow: ${c.yellow};
    --magenta: ${c.magenta};
    --cyan: ${c.cyan};
    --red-bright: ${c.brightRed};
    --green-bright: ${c.brightGreen};
    --blue-bright: ${c.brightBlue};
    --yellow-bright: ${c.brightYellow};
    --magenta-bright: ${c.brightMagenta};
    --cyan-bright: ${c.brightCyan};
  }`;
}

function adjustHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgbTuple(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  return `#${[r, g, b].map(v => clamp(v + amount).toString(16).padStart(2, '0')).join('')}`;
}

async function previewTheme(name: string, local: boolean): Promise<void> {
  const index = await fetchIndex(local);
  const file = findTheme(index, name);
  if (!file) {
    console.error(`Theme not found: "${name}"`);
    suggestSimilar(name, Object.keys(index));
    process.exit(1);
  }

  const theme = await fetchTheme(file, local);
  let pairTheme: ThemeYAML | null = null;

  if (theme.meta.pair) {
    const pairFile = findTheme(index, theme.meta.pair);
    if (pairFile) {
      try { pairTheme = await fetchTheme(pairFile, local); } catch {}
    }
  }

  // Determine which is dark and which is light
  const darkTheme = theme.meta.mode === 'dark' ? theme : (pairTheme?.meta.mode === 'dark' ? pairTheme : theme);
  const lightTheme = theme.meta.mode === 'light' ? theme : (pairTheme?.meta.mode === 'light' ? pairTheme : null);

  // Load template — embedded at build time for compiled binary support
  let html = PREVIEW_TEMPLATE;

  // Inject override <style> and <script> just before </body>
  const darkSelector = ':root, [data-theme="dark"]';
  const lightSelector = '[data-theme="light"]';

  const darkCSS = buildCSSVars(darkTheme, darkSelector);
  const lightCSS = lightTheme ? buildCSSVars(lightTheme, lightSelector) : buildCSSVars(darkTheme, lightSelector);

  const darkJS = buildThemeJS(darkTheme, 'dark');
  const lightJS = lightTheme ? buildThemeJS(lightTheme, 'light') : buildThemeJS(darkTheme, 'light');

  const injected = `
  <style>
  /* ── Theme override: ${theme.name} ── */
  ${darkCSS}
  ${lightCSS}
  /* ── Install section styles ── */
  .install-section { margin-top: 1rem; }
  .install-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .install-select {
    background: var(--card-bg); color: var(--fg);
    border: 1px solid var(--card-border); border-radius: 8px;
    padding: 0.4rem 0.75rem; font-size: 0.85rem; font-family: inherit;
    cursor: pointer; outline: none;
  }
  .install-select:focus { border-color: var(--fg); }
  .install-cmd {
    flex: 1; min-width: 0;
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 8px; padding: 0.6rem 1rem;
    font-family: 'SFMono-Regular', 'Consolas', monospace; font-size: 0.85rem;
    color: var(--fg); white-space: nowrap; overflow-x: auto;
    display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
  }
  .install-cmd code { flex: 1; }
  .install-cmd .cl-key { color: var(--fg); }
  .install-cmd .cl-value { color: var(--magenta); font-weight: 600; }
  .install-copy { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.8rem; padding: 0; flex-shrink: 0; }
  .install-copy:hover { color: var(--fg); }
  </style>
  <script>
  // Override theme data
  themes.dark = ${darkJS};
  themes.light = ${lightJS};
  document.title = '${theme.name.replace(/'/g, "\\'")} — rampa theme preview';

  // Hide Sarela-specific prose
  document.querySelector('.romanji')?.remove();
  document.querySelector('.intro')?.remove();
  document.querySelector('.intro-sig')?.remove();

  // Repurpose origin-badge as metadata chips (accent · author · repo)
  (function() {
    const badge = document.querySelector('.origin-badge');
    if (!badge) return;
    const accent = '${theme.meta.accent || ''}';
    const author = '${(theme.source?.author || '').replace(/'/g, "\\'")}';
    const repo = '${(theme.source?.repo || '').replace(/'/g, "\\'")}';
    const url = '${(theme.source?.url || '').replace(/'/g, "\\'")}';
    const parts = [];
    if (accent) parts.push(\`<span>🎨</span> \${accent}\`);
    if (author && url) parts.push(\`by <a href="\${url}" target="_blank" rel="noopener" style="color:inherit">\${author}</a>\`);
    else if (author) parts.push(\`by \${author}\`);
    if (repo) parts.push(\`<a href="\${repo}" target="_blank" rel="noopener" style="color:inherit">↗ source</a>\`);
    if (parts.length) {
      badge.innerHTML = parts.join('<span style="opacity:0.3;margin:0 0.3rem">·</span>');
    } else {
      badge.remove();
    }
  })();

  // Hide dark/light toggle if no pair
  ${pairTheme ? '' : `document.querySelector('.theme-toggle')?.style.setProperty('display', 'none');`}

  // Default to list view
  setColorView('list');

  // Banner: set name, hide romanji/tagline
  const posterTitle = document.querySelector('.poster-title');
  if (posterTitle) posterTitle.textContent = '${theme.name.replace(/'/g, "\\'")}';
  document.querySelector('.poster-romanji')?.remove();
  document.querySelector('.poster-tagline')?.remove();
  const posterMetas = document.querySelectorAll('.poster-meta');
  if (posterMetas[0]) posterMetas[0].textContent = 'color theme · 16 colors${pairTheme ? ' · dark & light' : ''}';
  if (posterMetas[1]) posterMetas[1].textContent = 'built with rampa';

  // Patch renderColorViews to show APCA contrast in the list desc column
  const _origRenderColorViews = renderColorViews;
  renderColorViews = function() {
    _origRenderColorViews();
    const mode = document.documentElement.getAttribute('data-theme') || 'dark';
    const t = themes[mode];
    document.querySelectorAll('.color-list-item').forEach((item) => {
      const nameEl = item.querySelector('.color-list-name');
      const descEl = item.querySelector('.color-list-desc');
      if (!descEl || !nameEl) return;
      const colorName = nameEl.textContent.trim().toLowerCase()
        .replace('bright ', '').split(' ').reverse().join('_');
      // Try direct key, then _bright suffix variant
      const label = nameEl.textContent.trim().toLowerCase();
      const keyMap = {
        'red':'red','green':'green','blue':'blue','yellow':'yellow',
        'magenta':'magenta','cyan':'cyan',
        'bright red':'red_bright','bright green':'green_bright','bright blue':'blue_bright',
        'bright yellow':'yellow_bright','bright magenta':'magenta_bright','bright cyan':'cyan_bright',
      };
      const desc = t.descs[keyMap[label]];
      if (desc) descEl.textContent = desc;
    });
  };

  // Replace export section with install command UI
  (function() {
    const ua = navigator.userAgent;
    const isMac = /Mac/.test(ua) && !/iPhone|iPad/.test(ua);
    const isWin = /Win/.test(ua);
    // const isLinux = !isMac && !isWin;

    const allApps = [
      { value: 'ghostty',          label: 'Ghostty',          os: ['mac','linux'] },
      { value: 'iterm2',           label: 'iTerm2',            os: ['mac'] },
      { value: 'alacritty',        label: 'Alacritty',         os: ['mac','linux','win'] },
      { value: 'kitty',            label: 'Kitty',             os: ['mac','linux'] },
      { value: 'warp',             label: 'Warp',              os: ['mac','linux'] },
      { value: 'hyper',            label: 'Hyper',             os: ['mac','linux','win'] },
      { value: 'windows-terminal', label: 'Windows Terminal',  os: ['win'] },
      { value: 'vscode',           label: 'VS Code',           os: ['mac','linux','win'] },
      { value: 'xcode',            label: 'Xcode',             os: ['mac'] },
      { value: 'android-studio',   label: 'Android Studio',    os: ['mac','linux','win'] },
    ];

    const osKey = isMac ? 'mac' : isWin ? 'win' : 'linux';
    const apps = allApps.filter(a => a.os.includes(osKey));
    const themeName = '${theme.name.replace(/'/g, "\\'")}';

    function buildCmd(app) {
      return \`rampa theme "\${themeName}" --install \${app}\`;
    }

    const exportSection = document.getElementById('sec-export');
    if (!exportSection) return;

    const opts = apps.map(a => \`<option value="\${a.value}">\${a.label}</option>\`).join('');
    exportSection.innerHTML = \`
      <div class="colors-header">
        <p class="section-title">Install</p>
      </div>
      <div class="install-section">
        <div class="install-row">
          <select class="install-select" id="install-app-select">\${opts}</select>
          <div class="install-cmd" id="install-cmd-block">
            <code id="install-cmd-text"></code>
            <button class="install-copy" id="install-copy-btn" title="Copy">Copy</button>
          </div>
        </div>
      </div>
    \`;

    function updateCmd() {
      const app = document.getElementById('install-app-select').value;
      document.getElementById('install-cmd-text').textContent = buildCmd(app);
    }

    document.getElementById('install-app-select').addEventListener('change', updateCmd);
    document.getElementById('install-copy-btn').addEventListener('click', () => {
      const app = document.getElementById('install-app-select').value;
      navigator.clipboard.writeText(buildCmd(app)).then(() => {
        const btn = document.getElementById('install-copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    });

    updateCmd();
  })();

  setTheme('${theme.meta.mode}');
  renderColorViews();
  </script>`;

  html = html.replace('</body>', injected + '\n</body>');

  // Replace exact footer content
  const footerOld = `Built with <a href="https://github.com/basiclines/rampa-studio" target="_blank" rel="noopener">rampa</a> by <a href="https://github.com/basiclines" target="_blank" rel="noopener">@basiclines</a>
      <span class="footer-dot">·</span>
      Colors extracted from photographs using k-means++ clustering`;
  const authorLine = theme.source?.author
    ? `Theme by <a href="${theme.source.url}" target="_blank" rel="noopener">${theme.source.author}</a> &nbsp;·&nbsp; `
    : '';
  const footerNew = `${authorLine}Built with <a href="https://github.com/basiclines/rampa-studio" target="_blank" rel="noopener">rampa</a> — theme preview`;
  html = html.replace(footerOld, footerNew);

  // Serve with Bun
  const PORT = 7432;
  const server = Bun.serve({
    port: PORT,
    fetch() {
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    },
  });

  const url = `http://localhost:${PORT}`;
  console.log(`\n  🎨 Previewing: ${theme.name}`);
  if (pairTheme) console.log(`  🔗 Paired with: ${pairTheme.name}`);
  console.log(`  ${url}\n`);
  console.log(`  Press Ctrl+C to stop\n`);

  // Open browser
  const opener = platform() === 'darwin' ? 'open' : platform() === 'win32' ? 'start' : 'xdg-open';
  spawnSync(opener, [url]);

  // Keep server alive — setInterval prevents the process from exiting
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (!server.url) { clearInterval(interval); resolve(); }
    }, 1000);
    process.on('SIGINT', () => { clearInterval(interval); server.stop(); resolve(); });
    process.on('SIGTERM', () => { clearInterval(interval); server.stop(); resolve(); });
  });
}

export async function runTheme(argv: string[]): Promise<void> {
  const args = parseThemeArgs(argv);

  switch (args.command) {
    case 'list':
      await listThemes(args.local, args.all, args.sort, args.name || undefined, args.paired);
      break;

    case 'show':
      if (!args.name) {
        console.error('Usage: rampa theme <name> --show');
        process.exit(1);
      }
      await showTheme(args.name, args.local);
      break;

    case 'install':
      if (!args.name) {
        console.error('Usage: rampa theme <name> --install <app>');
        process.exit(1);
      }
      if (!args.app) {
        console.error('Usage: rampa theme <name> --install <app>');
        console.error(`Supported apps: ${SUPPORTED_APPS.join(', ')}`);
        process.exit(1);
      }
      await installTheme(args.name, args.app, args.dryRun, args.local);
      break;

    case 'preview':
      if (!args.name) {
        console.error('Usage: rampa theme <name> --preview');
        process.exit(1);
      }
      await previewTheme(args.name, args.local);
      break;
  }
}
