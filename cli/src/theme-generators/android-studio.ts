import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { hexToRgb } from './base';

function iclsColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return (r << 16 | g << 8 | b).toString();
}

function option(name: string, hex: string): string {
  return `        <option name="${name}">
          <value>
            <option name="FOREGROUND" value="${iclsColor(hex)}" />
          </value>
        </option>`;
}

export const androidStudioGenerator: ThemeGenerator = {
  name: 'android-studio',

  generate(theme: ThemeYAML): string {
    const c = theme.colors;
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push(`<scheme name="${theme.name}" version="142" parent_scheme="${theme.meta.mode === 'dark' ? 'Darcula' : 'Default'}">`);
    lines.push('  <colors>');
    lines.push(`    <option name="CONSOLE_BACKGROUND_KEY" value="${iclsColor(c.bg)}" />`);
    lines.push('  </colors>');
    lines.push('  <attributes>');
    lines.push(`    <option name="CONSOLE_NORMAL_OUTPUT">`);
    lines.push(`      <value>`);
    lines.push(`        <option name="FOREGROUND" value="${iclsColor(c.fg)}" />`);
    lines.push(`      </value>`);
    lines.push(`    </option>`);

    // Console ANSI colors
    const mapping: [string, string][] = [
      ['CONSOLE_BLACK_OUTPUT', c.black],
      ['CONSOLE_RED_OUTPUT', c.red],
      ['CONSOLE_GREEN_OUTPUT', c.green],
      ['CONSOLE_YELLOW_OUTPUT', c.yellow],
      ['CONSOLE_BLUE_OUTPUT', c.blue],
      ['CONSOLE_MAGENTA_OUTPUT', c.magenta],
      ['CONSOLE_CYAN_OUTPUT', c.cyan],
      ['CONSOLE_WHITE_OUTPUT', c.white],
      ['CONSOLE_BLACK_BRIGHT_OUTPUT', c.brightBlack],
      ['CONSOLE_RED_BRIGHT_OUTPUT', c.brightRed],
      ['CONSOLE_GREEN_BRIGHT_OUTPUT', c.brightGreen],
      ['CONSOLE_YELLOW_BRIGHT_OUTPUT', c.brightYellow],
      ['CONSOLE_BLUE_BRIGHT_OUTPUT', c.brightBlue],
      ['CONSOLE_MAGENTA_BRIGHT_OUTPUT', c.brightMagenta],
      ['CONSOLE_CYAN_BRIGHT_OUTPUT', c.brightCyan],
      ['CONSOLE_WHITE_BRIGHT_OUTPUT', c.brightWhite],
    ];

    for (const [name, hex] of mapping) {
      lines.push(option(name, hex));
    }

    lines.push('  </attributes>');
    lines.push('</scheme>');

    return lines.join('\n') + '\n';
  },

  installPath(os) {
    if (os === 'darwin') return '~/Library/Application Support/Google/AndroidStudio/colors';
    if (os === 'linux') return '~/.config/Google/AndroidStudio/colors';
    if (os === 'win32') return '%APPDATA%\\Google\\AndroidStudio\\colors';
    return null;
  },

  fileExtension() {
    return '.icls';
  },
};
