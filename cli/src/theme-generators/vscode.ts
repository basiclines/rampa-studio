import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';

export const vscodeGenerator: ThemeGenerator = {
  name: 'vscode',

  generate(theme: ThemeYAML): string {
    const c = theme.colors;
    const data = {
      name: theme.name,
      type: theme.meta.mode === 'dark' ? 'dark' : 'light',
      colors: {
        'editor.background': c.bg,
        'editor.foreground': c.fg,
        'terminal.background': c.bg,
        'terminal.foreground': c.fg,
        'terminal.ansiBlack': c.black,
        'terminal.ansiRed': c.red,
        'terminal.ansiGreen': c.green,
        'terminal.ansiYellow': c.yellow,
        'terminal.ansiBlue': c.blue,
        'terminal.ansiMagenta': c.magenta,
        'terminal.ansiCyan': c.cyan,
        'terminal.ansiWhite': c.white,
        'terminal.ansiBrightBlack': c.brightBlack,
        'terminal.ansiBrightRed': c.brightRed,
        'terminal.ansiBrightGreen': c.brightGreen,
        'terminal.ansiBrightYellow': c.brightYellow,
        'terminal.ansiBrightBlue': c.brightBlue,
        'terminal.ansiBrightMagenta': c.brightMagenta,
        'terminal.ansiBrightCyan': c.brightCyan,
        'terminal.ansiBrightWhite': c.brightWhite,
      },
    };

    return JSON.stringify(data, null, 2) + '\n';
  },

  installPath() {
    // VSCode themes need to be installed as extensions or added to settings
    return null;
  },

  fileExtension() {
    return '.json';
  },
};
