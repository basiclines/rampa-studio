import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';

export const warpGenerator: ThemeGenerator = {
  name: 'warp',

  generate(theme: ThemeYAML): string {
    const c = theme.colors;
    const lines: string[] = [];

    lines.push(`accent: "${c.blue}"`);
    lines.push(`background: "${c.bg}"`);
    lines.push(`foreground: "${c.fg}"`);
    lines.push(`cursor: "${c.fg}"`);
    lines.push('terminal_colors:');
    lines.push('  normal:');
    lines.push(`    black: "${c.black}"`);
    lines.push(`    red: "${c.red}"`);
    lines.push(`    green: "${c.green}"`);
    lines.push(`    yellow: "${c.yellow}"`);
    lines.push(`    blue: "${c.blue}"`);
    lines.push(`    magenta: "${c.magenta}"`);
    lines.push(`    cyan: "${c.cyan}"`);
    lines.push(`    white: "${c.white}"`);
    lines.push('  bright:');
    lines.push(`    black: "${c.brightBlack}"`);
    lines.push(`    red: "${c.brightRed}"`);
    lines.push(`    green: "${c.brightGreen}"`);
    lines.push(`    yellow: "${c.brightYellow}"`);
    lines.push(`    blue: "${c.brightBlue}"`);
    lines.push(`    magenta: "${c.brightMagenta}"`);
    lines.push(`    cyan: "${c.brightCyan}"`);
    lines.push(`    white: "${c.brightWhite}"`);

    return lines.join('\n') + '\n';
  },

  installPath(os) {
    if (os === 'darwin' || os === 'linux') return '~/.warp/themes';
    return null;
  },

  fileExtension() {
    return '.yaml';
  },
};
