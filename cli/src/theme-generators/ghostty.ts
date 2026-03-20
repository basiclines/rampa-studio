import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { ansiArray } from './base';
import { deriveEditorPalette } from '../theme-color-engine';

export const ghosttyGenerator: ThemeGenerator = {
  name: 'ghostty',

  generate(theme: ThemeYAML): string {
    const p = deriveEditorPalette(theme);
    const lines: string[] = [];
    lines.push(`background = ${theme.colors.bg}`);
    lines.push(`foreground = ${theme.colors.fg}`);
    lines.push(`cursor-color = ${p.cursor}`);
    lines.push(`selection-background = ${p.selection}`);
    lines.push(`selection-foreground = ${theme.colors.fg}`);

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
