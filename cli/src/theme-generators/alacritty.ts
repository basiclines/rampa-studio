import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { themeFileName } from './base';

const NORMAL_KEYS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;

export const alacrittyGenerator: ThemeGenerator = {
  name: 'alacritty',

  generate(theme: ThemeYAML): string {
    const c = theme.colors;
    const lines: string[] = [];

    lines.push('[colors.primary]');
    lines.push(`background = "${c.bg}"`);
    lines.push(`foreground = "${c.fg}"`);
    lines.push('');
    lines.push('[colors.cursor]');
    lines.push(`cursor = "${c.fg}"`);
    lines.push(`text = "${c.bg}"`);
    lines.push('');
    lines.push('[colors.normal]');
    lines.push(`black = "${c.black}"`);
    lines.push(`red = "${c.red}"`);
    lines.push(`green = "${c.green}"`);
    lines.push(`yellow = "${c.yellow}"`);
    lines.push(`blue = "${c.blue}"`);
    lines.push(`magenta = "${c.magenta}"`);
    lines.push(`cyan = "${c.cyan}"`);
    lines.push(`white = "${c.white}"`);
    lines.push('');
    lines.push('[colors.bright]');
    lines.push(`black = "${c.brightBlack}"`);
    lines.push(`red = "${c.brightRed}"`);
    lines.push(`green = "${c.brightGreen}"`);
    lines.push(`yellow = "${c.brightYellow}"`);
    lines.push(`blue = "${c.brightBlue}"`);
    lines.push(`magenta = "${c.brightMagenta}"`);
    lines.push(`cyan = "${c.brightCyan}"`);
    lines.push(`white = "${c.brightWhite}"`);

    return lines.join('\n') + '\n';
  },

  installPath(os) {
    if (os === 'darwin' || os === 'linux') return '~/.config/alacritty/themes';
    if (os === 'win32') return '%APPDATA%\\alacritty\\themes';
    return null;
  },

  fileExtension() {
    return '.toml';
  },
};
