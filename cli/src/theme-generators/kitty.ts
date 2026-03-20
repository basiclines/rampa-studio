import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { ansiArray } from './base';
import { deriveEditorPalette } from '../theme-color-engine';

export const kittyGenerator: ThemeGenerator = {
  name: 'kitty',

  generate(theme: ThemeYAML): string {
    const p = deriveEditorPalette(theme);
    const lines: string[] = [];
    lines.push(`background ${theme.colors.bg}`);
    lines.push(`foreground ${theme.colors.fg}`);
    lines.push(`cursor ${p.cursor}`);
    lines.push(`cursor_text_color ${theme.colors.bg}`);
    lines.push(`selection_background ${p.selection}`);
    lines.push(`selection_foreground ${theme.colors.fg}`);
    lines.push('');

    const colors = ansiArray(theme.colors);
    for (let i = 0; i < 16; i++) {
      lines.push(`color${i} ${colors[i]}`);
    }

    return lines.join('\n') + '\n';
  },

  installPath(os) {
    if (os === 'darwin' || os === 'linux') return '~/.config/kitty/themes';
    return null;
  },

  fileExtension() {
    return '.conf';
  },
};
