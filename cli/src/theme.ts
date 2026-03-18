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
import { parseThemeYAML, type ThemeYAML } from './theme-schema';
import { generators, SUPPORTED_APPS, themeFileName } from './theme-generators/index';
import { supportsTruecolor } from './utils/terminal-colors';

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
  command: 'list' | 'show' | 'install';
  name: string;
  app: string;
  dryRun: boolean;
  local: boolean;
  all: boolean;
  sort: SortOption[];
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
  ${cyan}rampa theme "Dracula" --show${reset}                ${dim}Show theme colors${reset}
  ${cyan}rampa theme "Dracula" --install ghostty${reset}     ${dim}Install theme for an app${reset}
  ${cyan}rampa theme "Dracula" --install ghostty --dry-run${reset}  ${dim}Preview without writing${reset}

${bold}SUPPORTED APPS${reset}
  ${SUPPORTED_APPS.map(a => `${cyan}${a}${reset}`).join(', ')}

${bold}OPTIONS${reset}
  ${cyan}--install <app>${reset}        ${dim}Target app to generate theme for${reset}
  ${cyan}--show${reset}                 ${dim}Print theme colors and metadata${reset}
  ${cyan}--dry-run${reset}              ${dim}Print generated output without writing file${reset}
  ${cyan}--all${reset}                  ${dim}Show all themes (list shows 100 by default)${reset}
  ${cyan}--sort <field>${reset}         ${dim}Sort by: name (default), installs, mode${reset}
  ${cyan}--local${reset}                ${dim}Use local themes/ directory instead of fetching from GitHub${reset}
  ${cyan}-h, --help${reset}             ${dim}Show this help${reset}

${bold}EXAMPLES${reset}
  ${cyan}rampa theme list${reset}
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

async function listThemes(local: boolean, all: boolean, sorts: SortOption[]): Promise<void> {
  const index = await fetchIndex(local);
  let entries = Object.entries(index);
  const total = entries.length;

  if (total === 0) {
    console.log('No themes found. Run the scraper first or check your themes/ directory.');
    return;
  }

  const dim = '\x1b[2m';
  const reset = '\x1b[0m';
  const needsMeta = sorts.some(s => s !== 'name');

  // Read metadata from YAML files when sorting by anything other than name
  const meta = new Map<string, { installs: number; rating: number; ratings: number; mode: string }>();
  if (needsMeta && local) {
    const themesDir = resolveThemesDir();
    for (const [name, filename] of entries) {
      try {
        const raw = readFileSync(join(themesDir, filename), 'utf8');
        const installsMatch = raw.match(/^\s*installs:\s*(\d+)/m);
        const ratingMatch = raw.match(/^\s*rating:\s*([\d.]+)/m);
        const ratingsMatch = raw.match(/^\s*ratings:\s*(\d+)/m);
        const modeMatch = raw.match(/^\s*mode:\s*"?(dark|light)"?/m);
        meta.set(name, {
          installs: installsMatch ? parseInt(installsMatch[1]) : 0,
          rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
          ratings: ratingsMatch ? parseInt(ratingsMatch[1]) : 0,
          mode: modeMatch ? modeMatch[1] : 'dark',
        });
      } catch {
        meta.set(name, { installs: 0, rating: 0, ratings: 0, mode: 'dark' });
      }
    }
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
  const shown = all ? entries : entries.slice(0, limit);
  const sortLabel = sorts.join(', ');

  console.log(`\n  ${total} themes available (sorted by ${sortLabel}):\n`);
  for (const [name] of shown) {
    const m = meta.get(name);
    const parts: string[] = [name];
    if (m && needsMeta) {
      const info: string[] = [];
      if (sorts.includes('installs')) info.push(`${m.installs.toLocaleString()} installs`);
      if (sorts.includes('rating')) info.push(`★ ${m.rating.toFixed(1)}`);
      if (sorts.includes('ratings')) info.push(`${m.ratings} ratings`);
      if (sorts.includes('mode')) info.push(`(${m.mode})`);
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

    const content = generator.generate(theme);
    const os = platform() as 'darwin' | 'linux' | 'win32';
    const basePath = generator.installPath(os);
    const ext = generator.fileExtension();
    const fileName = themeFileName(theme, ext);

    if (dryRun) {
      console.log(`\n${cyan}── ${generator.name}: ${fileName} ──${reset}\n`);
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
      // Still output the content so the user can manually use it
      console.log(`${dim}Generated content:${reset}\n`);
      console.log(content);
      continue;
    }

    const dir = resolveInstallPath(basePath);
    const filePath = join(dir, fileName);

    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, content, 'utf8');
      console.log(`${green}✓${reset} ${generator.name}: ${filePath}`);
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

// ── Main ──

export async function runTheme(argv: string[]): Promise<void> {
  const args = parseThemeArgs(argv);

  switch (args.command) {
    case 'list':
      await listThemes(args.local, args.all, args.sort);
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
  }
}
