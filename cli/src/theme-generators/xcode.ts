import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { hexToRgbFloat } from './base';

function xcColorEntry(key: string, hex: string): string {
  const [r, g, b] = hexToRgbFloat(hex);
  return `        <dict>
            <key>name</key>
            <string>${key}</string>
            <key>red</key>
            <real>${r}</real>
            <key>green</key>
            <real>${g}</real>
            <key>blue</key>
            <real>${b}</real>
            <key>alpha</key>
            <real>1</real>
        </dict>`;
}

export const xcodeGenerator: ThemeGenerator = {
  name: 'xcode',

  generate(theme: ThemeYAML): string {
    const c = theme.colors;
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">');
    lines.push('<plist version="1.0">');
    lines.push('<dict>');
    lines.push('    <key>DVTConsoleDebuggerInputTextColor</key>');
    lines.push(xcColorEntry('Debugger Input', c.fg));
    lines.push('    <key>DVTConsoleDebuggerOutputTextColor</key>');
    lines.push(xcColorEntry('Debugger Output', c.fg));
    lines.push('    <key>DVTConsoleDebuggerPromptTextColor</key>');
    lines.push(xcColorEntry('Debugger Prompt', c.blue));
    lines.push('    <key>DVTConsoleExectuableInputTextColor</key>');
    lines.push(xcColorEntry('Executable Input', c.fg));
    lines.push('    <key>DVTConsoleExectuableOutputTextColor</key>');
    lines.push(xcColorEntry('Executable Output', c.fg));
    lines.push('    <key>DVTConsoleTextBackgroundColor</key>');
    lines.push(xcColorEntry('Background', c.bg));
    lines.push('    <key>DVTConsoleTextInsertionPointColor</key>');
    lines.push(xcColorEntry('Cursor', c.fg));
    lines.push('    <key>DVTConsoleTextSelectionColor</key>');
    lines.push(xcColorEntry('Selection', c.brightBlack));

    // ANSI colors
    const ansiNames = [
      'Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White',
    ];
    const normalColors = [c.black, c.red, c.green, c.yellow, c.blue, c.magenta, c.cyan, c.white];
    const brightColors = [c.brightBlack, c.brightRed, c.brightGreen, c.brightYellow, c.brightBlue, c.brightMagenta, c.brightCyan, c.brightWhite];

    for (let i = 0; i < 8; i++) {
      lines.push(`    <key>DVTConsoleANSI${ansiNames[i]}Color</key>`);
      lines.push(xcColorEntry(`ANSI ${ansiNames[i]}`, normalColors[i]));
    }
    for (let i = 0; i < 8; i++) {
      lines.push(`    <key>DVTConsoleANSIBright${ansiNames[i]}Color</key>`);
      lines.push(xcColorEntry(`ANSI Bright ${ansiNames[i]}`, brightColors[i]));
    }

    lines.push('</dict>');
    lines.push('</plist>');

    return lines.join('\n') + '\n';
  },

  installPath(os) {
    if (os === 'darwin') return '~/Library/Developer/Xcode/UserData/FontAndColorThemes';
    return null;
  },

  fileExtension() {
    return '.xccolortheme';
  },
};
