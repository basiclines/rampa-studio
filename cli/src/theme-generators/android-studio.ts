import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { deriveEditorPalette } from '../theme-color-engine';

function hex6(hex: string): string {
  return hex.replace('#', '').toUpperCase();
}

function colorAttr(name: string, hex: string): string {
  return `    <option name="${name}" value="${hex6(hex)}"/>`;
}

function syntaxAttr(name: string, attrs: string[]): string {
  const inner = attrs.map(a => `      ${a}`).join('\n');
  return `    <option name="${name}">\n      <value>\n${inner}\n      </value>\n    </option>`;
}

function fgAttr(name: string, hex: string): string {
  return syntaxAttr(name, [`<option name="FOREGROUND" value="${hex6(hex)}"/>`]);
}

function fgItalicAttr(name: string, hex: string): string {
  return syntaxAttr(name, [
    `<option name="FOREGROUND" value="${hex6(hex)}"/>`,
    `<option name="FONT_TYPE" value="2"/>`,
  ]);
}

function effectAttr(name: string, hex: string, effectType: number): string {
  return syntaxAttr(name, [
    `<option name="EFFECT_COLOR" value="${hex6(hex)}"/>`,
    `<option name="EFFECT_TYPE" value="${effectType}"/>`,
  ]);
}

function bgAttr(name: string, hex: string): string {
  return syntaxAttr(name, [`<option name="BACKGROUND" value="${hex6(hex)}"/>`]);
}

export const androidStudioGenerator: ThemeGenerator = {
  name: 'android-studio',

  generate(theme: ThemeYAML): string {
    const p = deriveEditorPalette(theme);
    const c = theme.colors;
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push(`<scheme name="${theme.name}" version="142" parent_scheme="${p.mode === 'dark' ? 'Darcula' : 'Default'}">`);
    lines.push('  <metaInfo>');
    lines.push(`    <property name="created">rampa</property>`);
    lines.push('  </metaInfo>');

    lines.push('  <colors>');
    lines.push(colorAttr('CARET_COLOR', p.cursor));
    lines.push(colorAttr('BACKGROUND', p.bg));
    lines.push(colorAttr('FOREGROUND', p.fg));
    lines.push(colorAttr('SELECTION_BACKGROUND', p.selection));
    lines.push(colorAttr('SELECTION_FOREGROUND', p.fg));
    lines.push(colorAttr('LINE_NUMBERS_COLOR', p.comment));
    lines.push(colorAttr('LINE_NUMBER_ON_CARET_ROW_COLOR', p.fgMuted));
    lines.push(colorAttr('CARET_ROW_COLOR', p.lineHighlight));
    lines.push(colorAttr('INDENT_GUIDE', p.bgAlt));
    lines.push(colorAttr('SOFT_WRAP_SIGN_COLOR', p.comment));
    lines.push(colorAttr('VCS_ANNOTATION_COLOR_1', p.added));
    lines.push(colorAttr('VCS_ANNOTATION_COLOR_2', p.modified));
    lines.push(colorAttr('VCS_ANNOTATION_COLOR_5', p.removed));
    lines.push('  </colors>');

    lines.push('  <attributes>');
    lines.push(fgAttr('DEFAULT_KEYWORD', p.keyword));
    lines.push(fgAttr('DEFAULT_STRING', p.string));
    lines.push(fgAttr('DEFAULT_NUMBER', p.number));
    lines.push(fgAttr('DEFAULT_FUNCTION_CALL', p.fn));
    lines.push(fgAttr('DEFAULT_CLASS_NAME', p.type));
    lines.push(fgAttr('DEFAULT_INTERFACE_NAME', p.type));
    lines.push(syntaxAttr('DEFAULT_IDENTIFIER', []));
    lines.push(syntaxAttr('DEFAULT_PARAMETER', [`<option name="FONT_TYPE" value="2"/>`]));
    lines.push(fgAttr('DEFAULT_INSTANCE_FIELD', p.variable));
    lines.push(fgAttr('DEFAULT_STATIC_FIELD', p.variable));
    lines.push(fgItalicAttr('LINE_COMMENT', p.comment));
    lines.push(fgAttr('BLOCK_COMMENT', p.comment));
    lines.push(fgAttr('DOC_COMMENT', p.comment));
    lines.push(fgAttr('DEFAULT_OPERATION_SIGN', p.operator));
    lines.push(fgAttr('DEFAULT_BRACES', p.fg));
    lines.push(fgAttr('DEFAULT_BRACKETS', p.fg));
    lines.push(fgAttr('DEFAULT_COMMA', p.fg));
    lines.push(fgAttr('DEFAULT_DOT', p.fg));
    lines.push(fgAttr('DEFAULT_SEMICOLON', p.fg));
    lines.push(syntaxAttr('TEXT', [
      `<option name="FOREGROUND" value="${hex6(p.fg)}"/>`,
      `<option name="BACKGROUND" value="${hex6(p.bg)}"/>`,
    ]));
    lines.push(effectAttr('ERROR_ELEMENTS', p.error, 2));
    lines.push(effectAttr('WARNING_ATTRIBUTES', p.warning, 1));
    lines.push(effectAttr('INFO_ATTRIBUTES', p.info, 1));
    lines.push(bgAttr('DIFF_INSERTED', p.added));
    lines.push(bgAttr('DIFF_DELETED', p.removed));
    lines.push(bgAttr('DIFF_MODIFIED', p.modified));

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
      lines.push(fgAttr(name, hex));
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
