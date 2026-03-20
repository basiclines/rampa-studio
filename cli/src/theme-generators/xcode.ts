import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { hexToRgbFloat } from './base';
import { deriveEditorPalette } from '../theme-color-engine';

function xcColor(hex: string, alpha = 1): string {
  const [r, g, b] = hexToRgbFloat(hex);
  return `${r} ${g} ${b} ${alpha}`;
}

function kvStr(key: string, value: string): string {
  return `\t<key>${key}</key>\n\t<string>${value}</string>`;
}

function kvInt(key: string, value: number): string {
  return `\t<key>${key}</key>\n\t<integer>${value}</integer>`;
}

function syntaxDict(entries: [string, string][]): string {
  const inner = entries
    .map(([k, v]) => `\t\t<key>${k}</key>\n\t\t<string>${v}</string>`)
    .join('\n');
  return `\t<key>DVTSourceTextSyntaxColors</key>\n\t<dict>\n${inner}\n\t</dict>`;
}

export const xcodeGenerator: ThemeGenerator = {
  name: 'xcode',

  generate(theme: ThemeYAML): string {
    const p = deriveEditorPalette(theme);
    const c = theme.colors;
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">');
    lines.push('<plist version="1.0">');
    lines.push('<dict>');

    lines.push(kvStr('DVTConsoleDebuggerInputTextColor', xcColor(p.fg)));
    lines.push(kvStr('DVTConsoleDebuggerOutputTextColor', xcColor(p.fg)));
    lines.push(kvStr('DVTConsoleDebuggerPromptTextColor', xcColor(p.keyword)));
    lines.push(kvStr('DVTConsoleExectuableInputTextColor', xcColor(p.fg)));
    lines.push(kvStr('DVTConsoleExectuableOutputTextColor', xcColor(p.fg)));
    lines.push(kvStr('DVTConsoleTextBackgroundColor', xcColor(p.bg)));
    lines.push(kvStr('DVTConsoleTextInsertionPointColor', xcColor(p.cursor)));
    lines.push(kvStr('DVTConsoleTextSelectionColor', xcColor(p.selection, 0.5)));
    lines.push(kvInt('DVTFontAndColorVersion', 1));
    lines.push(kvStr('DVTMarkupTextBackgroundColor', xcColor(p.bgAlt)));
    lines.push(kvStr('DVTMarkupTextBorderColor', xcColor(p.selectionBorder, 0.5)));
    lines.push(kvStr('DVTMarkupTextEmphasisColor', xcColor(p.fg)));
    lines.push(kvStr('DVTMarkupTextInlineCodeColor', xcColor(p.string)));
    lines.push(kvStr('DVTMarkupTextLinkColor', xcColor(p.keyword)));
    lines.push(kvStr('DVTMarkupTextNormalColor', xcColor(p.fg)));
    lines.push(kvStr('DVTSourceTextBackground', xcColor(p.bg)));
    lines.push(kvStr('DVTSourceTextBlockDimBackgroundColor', xcColor(p.selection)));
    lines.push(kvStr('DVTSourceTextCurrentLineHighlightColor', xcColor(p.lineHighlight)));
    lines.push(kvStr('DVTSourceTextInsertionPointColor', xcColor(p.cursor)));
    lines.push(kvStr('DVTSourceTextInvisiblesColor', xcColor(p.comment)));
    lines.push(kvStr('DVTSourceTextSelectionColor', xcColor(p.selection, 0.5)));
    lines.push(kvStr('DVTScrollbarMarkerAnalyzerColor', xcColor(p.keyword)));
    lines.push(kvStr('DVTScrollbarMarkerBreakpointColor', xcColor(p.keyword)));
    lines.push(kvStr('DVTScrollbarMarkerDiffColor', xcColor(p.modified)));
    lines.push(kvStr('DVTScrollbarMarkerDiffConflictColor', xcColor(p.error)));
    lines.push(kvStr('DVTScrollbarMarkerErrorColor', xcColor(p.error)));
    lines.push(kvStr('DVTScrollbarMarkerRuntimeIssueColor', xcColor(p.warning)));
    lines.push(kvStr('DVTScrollbarMarkerWarningColor', xcColor(p.warning)));

    // Syntax colors dict
    lines.push(syntaxDict([
      ['xcode.syntax.attribute', xcColor(p.fn)],
      ['xcode.syntax.character', xcColor(p.string)],
      ['xcode.syntax.comment', xcColor(p.comment)],
      ['xcode.syntax.comment.doc', xcColor(p.comment)],
      ['xcode.syntax.comment.doc.keyword', xcColor(p.comment)],
      ['xcode.syntax.declaration.other', xcColor(p.fn)],
      ['xcode.syntax.declaration.type', xcColor(p.type)],
      ['xcode.syntax.identifier.class', xcColor(p.type)],
      ['xcode.syntax.identifier.class.system', xcColor(p.type)],
      ['xcode.syntax.identifier.constant', xcColor(p.keyword)],
      ['xcode.syntax.identifier.constant.system', xcColor(p.keyword)],
      ['xcode.syntax.identifier.function', xcColor(p.fn)],
      ['xcode.syntax.identifier.function.system', xcColor(p.fn)],
      ['xcode.syntax.identifier.macro', xcColor(p.fn)],
      ['xcode.syntax.identifier.macro.system', xcColor(p.fn)],
      ['xcode.syntax.identifier.type', xcColor(p.type)],
      ['xcode.syntax.identifier.type.system', xcColor(p.type)],
      ['xcode.syntax.identifier.variable', xcColor(p.variable)],
      ['xcode.syntax.identifier.variable.system', xcColor(p.fgMuted)],
      ['xcode.syntax.keyword', xcColor(p.keyword)],
      ['xcode.syntax.number', xcColor(p.number)],
      ['xcode.syntax.plain', xcColor(p.fg)],
      ['xcode.syntax.preprocessor', xcColor(p.operator)],
      ['xcode.syntax.string', xcColor(p.string)],
      ['xcode.syntax.url', xcColor(p.info)],
    ]));

    // ANSI colors
    const ansiNames = ['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White'];
    const normalColors = [c.black, c.red, c.green, c.yellow, c.blue, c.magenta, c.cyan, c.white];
    const brightColors = [c.brightBlack, c.brightRed, c.brightGreen, c.brightYellow, c.brightBlue, c.brightMagenta, c.brightCyan, c.brightWhite];

    for (let i = 0; i < 8; i++) {
      lines.push(kvStr(`DVTConsoleANSI${ansiNames[i]}Color`, xcColor(normalColors[i])));
    }
    for (let i = 0; i < 8; i++) {
      lines.push(kvStr(`DVTConsoleANSIBright${ansiNames[i]}Color`, xcColor(brightColors[i])));
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
