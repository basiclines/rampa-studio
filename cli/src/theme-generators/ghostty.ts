import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { themeFileName, ansiArray } from './base';

const ANSI_NAMES = [
  'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  'bright_black', 'bright_red', 'bright_green', 'bright_yellow',
  'bright_blue', 'bright_magenta', 'bright_cyan', 'bright_white',
];

export const ghosttyGenerator: ThemeGenerator = {
  name: 'ghostty',

  generate(theme: ThemeYAML): string {
    const lines: string[] = [];
    lines.push(`background = ${theme.colors.bg}`);
    lines.push(`foreground = ${theme.colors.fg}`);
    lines.push(`cursor-color = ${theme.colors.fg}`);

    const colors = ansiArray(theme.colors);
    for (let i = 0; i < 16; i++) {
      lines.push(`palette = ${i}=${colors[i]}`);
    }

    return lines.join('\n') + '\n';
  },

  installPath(os) {
    if (os === 'darwin' || os === 'linux') return '~/.config/ghostty/themes';
    if (os === 'win32') return '%APPDATA%\\ghostty\\themes';
    return null;
  },

  fileExtension() {
    return '';
  },
};
