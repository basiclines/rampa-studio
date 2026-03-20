import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { deriveEditorPalette } from '../theme-color-engine';

export const windowsTerminalGenerator: ThemeGenerator = {
  name: 'windows-terminal',

  generate(theme: ThemeYAML): string {
    const p = deriveEditorPalette(theme);
    const c = theme.colors;
    const scheme = {
      name: theme.name,
      background: c.bg,
      foreground: c.fg,
      cursorColor: p.cursor,
      selectionBackground: p.selection,
      black: c.black,
      red: c.red,
      green: c.green,
      yellow: c.yellow,
      blue: c.blue,
      purple: c.magenta,
      cyan: c.cyan,
      white: c.white,
      brightBlack: c.brightBlack,
      brightRed: c.brightRed,
      brightGreen: c.brightGreen,
      brightYellow: c.brightYellow,
      brightBlue: c.brightBlue,
      brightPurple: c.brightMagenta,
      brightCyan: c.brightCyan,
      brightWhite: c.brightWhite,
    };

    return JSON.stringify(scheme, null, 2) + '\n';
  },

  installPath(os) {
    if (os === 'win32') return '%LOCALAPPDATA%\\Packages\\Microsoft.WindowsTerminal_8wekyb3d8bbwe\\LocalState';
    return null;
  },

  fileExtension() {
    return '.json';
  },
};
