/**
 * Shared types and parser for the universal theme YAML format.
 */

// ── Types ──

export interface ThemeSource {
  marketplace_id: string;
  version: string;
  installs: number;
  url: string;
  author: string;
  repo: string | null;
}

export interface ThemeColors {
  bg: string;
  fg: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export interface ThemeContrast {
  fg: number;
  black: number;
  red: number;
  green: number;
  yellow: number;
  blue: number;
  magenta: number;
  cyan: number;
  white: number;
  brightBlack: number;
  brightRed: number;
  brightGreen: number;
  brightYellow: number;
  brightBlue: number;
  brightMagenta: number;
  brightCyan: number;
  brightWhite: number;
}

export interface ThemeMeta {
  mode: 'dark' | 'light';
  accent: string;
  hue: number | null;
  contrast: ThemeContrast;
}

export interface ThemeYAML {
  name: string;
  source: ThemeSource;
  colors: ThemeColors;
  meta: ThemeMeta;
}

// ── ANSI color key ordering (for iteration) ──

export const ANSI_KEYS = [
  'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
] as const;

export const COLOR_KEYS = ['bg', 'fg', ...ANSI_KEYS] as const;

// ── Parser ──

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function stripYamlComment(line: string): string {
  // Don't strip # if it's inside quotes
  let inQuote = false;
  let quoteChar = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (!inQuote && (ch === '"' || ch === "'")) {
      inQuote = true;
      quoteChar = ch;
    } else if (inQuote && ch === quoteChar) {
      inQuote = false;
    } else if (!inQuote && ch === '#') {
      // Only treat as comment if preceded by whitespace or at start
      if (i === 0 || /\s/.test(line[i - 1])) {
        return line.slice(0, i);
      }
    }
  }
  return line;
}

export function parseThemeYAML(raw: string): ThemeYAML {
  const lines = raw.split('\n');
  const data: Record<string, any> = {};
  const stack: { indent: number; obj: Record<string, any> }[] = [{ indent: -1, obj: data }];

  for (const line of lines) {
    // Strip comments but preserve # in quoted strings
    const trimmed = stripYamlComment(line).trimEnd();
    if (!trimmed || trimmed.trim() === '') continue;

    const indent = line.search(/\S/);
    const match = trimmed.match(/^(\s*)([^:]+):\s*(.*)$/);
    if (!match) continue;

    const key = match[2].trim();
    const value = match[3].trim();

    // Pop stack to find parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].obj;

    if (value === '') {
      // Nested object
      const child: Record<string, any> = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      // Scalar value
      parent[key] = parseScalar(value);
    }
  }

  return validateTheme(data);
}

function parseScalar(value: string): string | number | null {
  if (value === 'null' || value === '~') return null;
  const unquoted = value.replace(/^["']|["']$/g, '');
  if (HEX_RE.test(unquoted)) return unquoted;
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;
  return unquoted;
}

function validateTheme(data: Record<string, any>): ThemeYAML {
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Theme missing required field: name');
  }
  if (!data.colors || typeof data.colors !== 'object') {
    throw new Error('Theme missing required field: colors');
  }

  for (const key of COLOR_KEYS) {
    const val = data.colors[key];
    if (!val || !HEX_RE.test(val)) {
      throw new Error(`Theme colors.${key} missing or invalid: ${val}`);
    }
  }

  return data as ThemeYAML;
}

// ── Serializer ──

export function serializeThemeYAML(theme: ThemeYAML): string {
  const lines: string[] = [];
  lines.push(`name: "${theme.name}"`);

  lines.push('source:');
  lines.push(`  marketplace_id: "${theme.source.marketplace_id}"`);
  lines.push(`  version: "${theme.source.version}"`);
  lines.push(`  installs: ${theme.source.installs}`);
  lines.push(`  author: "${theme.source.author}"`);
  lines.push(`  repo: ${theme.source.repo ? '"' + theme.source.repo + '"' : 'null'}`);
  lines.push(`  url: "${theme.source.url}"`);

  lines.push('colors:');
  for (const key of COLOR_KEYS) {
    lines.push(`  ${key}: "${theme.colors[key as keyof ThemeColors]}"`);
  }

  lines.push('meta:');
  lines.push(`  mode: "${theme.meta.mode}"`);
  lines.push(`  accent: "${theme.meta.accent}"`);
  lines.push(`  hue: ${theme.meta.hue === null ? 'null' : theme.meta.hue}`);
  lines.push('  contrast:');
  for (const key of ['fg', ...ANSI_KEYS]) {
    const val = theme.meta.contrast[key as keyof ThemeContrast];
    lines.push(`    ${key}: ${Math.round(val * 10) / 10}`);
  }

  return lines.join('\n') + '\n';
}
