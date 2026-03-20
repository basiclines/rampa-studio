import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { hexToRgbFloat, ansiArray } from './base';
import { deriveEditorPalette } from '../theme-color-engine';

function colorDict(hex: string): string {
  const [r, g, b] = hexToRgbFloat(hex);
  return [
    '\t\t<dict>',
    `\t\t\t<key>Alpha Component</key>`,
    `\t\t\t<real>1</real>`,
    `\t\t\t<key>Blue Component</key>`,
    `\t\t\t<real>${b}</real>`,
    `\t\t\t<key>Color Space</key>`,
    `\t\t\t<string>sRGB</string>`,
    `\t\t\t<key>Green Component</key>`,
    `\t\t\t<real>${g}</real>`,
    `\t\t\t<key>Red Component</key>`,
    `\t\t\t<real>${r}</real>`,
    '\t\t</dict>',
  ].join('\n');
}

function entry(name: string, hex: string): string {
  return `\t<key>${name}</key>\n${colorDict(hex)}`;
}

const ANSI_NAMES = [
  'Ansi 0 Color', 'Ansi 1 Color', 'Ansi 2 Color', 'Ansi 3 Color',
  'Ansi 4 Color', 'Ansi 5 Color', 'Ansi 6 Color', 'Ansi 7 Color',
  'Ansi 8 Color', 'Ansi 9 Color', 'Ansi 10 Color', 'Ansi 11 Color',
  'Ansi 12 Color', 'Ansi 13 Color', 'Ansi 14 Color', 'Ansi 15 Color',
];

export const iterm2Generator: ThemeGenerator = {
  name: 'iterm2',

  generate(theme: ThemeYAML): string {
    const p = deriveEditorPalette(theme);
    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">');
    lines.push('<plist version="1.0">');
    lines.push('<dict>');

    const colors = ansiArray(theme.colors);
    for (let i = 0; i < 16; i++) {
      lines.push(entry(ANSI_NAMES[i], colors[i]));
    }

    lines.push(entry('Background Color', theme.colors.bg));
    lines.push(entry('Foreground Color', theme.colors.fg));
    lines.push(entry('Cursor Color', p.cursor));
    lines.push(entry('Cursor Text Color', theme.colors.bg));
    lines.push(entry('Selection Color', p.selection));
    lines.push(entry('Selected Text Color', theme.colors.fg));

    lines.push('</dict>');
    lines.push('</plist>');

    return lines.join('\n') + '\n';
  },

  installPath(os) {
    if (os === 'darwin') return '~/Library/Application Support/iTerm2/DynamicProfiles';
    return null;
  },

  fileExtension() {
    return '.itermcolors';
  },
};
