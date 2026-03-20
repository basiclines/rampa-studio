import type { ThemeYAML } from '../theme-schema';
import type { ThemeGenerator } from './base';
import { deriveEditorPalette } from '../theme-color-engine';

export const vscodeGenerator: ThemeGenerator = {
  name: 'vscode',

  generate(theme: ThemeYAML): string {
    const p = deriveEditorPalette(theme);
    const c = theme.colors;

    const data = {
      name: theme.name,
      type: p.mode === 'dark' ? 'dark' : 'light',
      colors: {
        // Editor UI
        'editor.background': p.bg,
        'editor.foreground': p.fg,
        'editorCursor.foreground': p.cursor,
        'editor.lineHighlightBackground': p.lineHighlight + '1a',
        'editor.selectionBackground': p.selection + '99',
        'editor.inactiveSelectionBackground': p.selection + '55',
        'editor.wordHighlightBackground': p.selection + '55',
        'editor.findMatchBackground': p.fn + '55',
        'editor.findMatchHighlightBackground': p.fn + '33',
        'editorLineNumber.foreground': p.comment,
        'editorLineNumber.activeForeground': p.fgMuted,

        // Chrome/tabs/sidebar
        'editorGroupHeader.tabsBackground': p.bgAlt,
        'tab.activeBackground': p.bg,
        'tab.inactiveBackground': p.bgAlt,
        'tab.activeForeground': p.fg,
        'tab.inactiveForeground': p.comment,
        'tab.activeBorderTop': p.keyword,
        'tab.border': p.bgAlt,
        'sideBar.background': p.bgAlt,
        'sideBar.foreground': p.fg,
        'sideBarTitle.foreground': p.fgMuted,
        'sideBarSectionHeader.background': p.bg,
        'sideBarSectionHeader.foreground': p.fgMuted,
        'activityBar.background': p.bgAlt,
        'activityBar.foreground': p.fg,
        'activityBar.inactiveForeground': p.comment,
        'activityBarBadge.background': p.keyword,
        'activityBarBadge.foreground': p.bg,
        'statusBar.background': p.bgAlt,
        'statusBar.foreground': p.fg,
        'statusBar.noFolderBackground': p.bgAlt,
        'statusBarItem.hoverBackground': p.selection,
        'panel.background': p.bgAlt,
        'panel.border': p.bgAlt,
        'panelTitle.activeBorder': p.keyword,
        'breadcrumb.background': p.bgAlt,
        'breadcrumb.foreground': p.comment,
        'breadcrumb.activeSelectionForeground': p.fg,

        // Input/dropdown/widgets
        'input.background': p.bgAlt,
        'input.foreground': p.fg,
        'input.border': p.selectionBorder,
        'input.placeholderForeground': p.comment,
        'inputOption.activeBackground': p.selection,
        'dropdown.background': p.bgAlt,
        'dropdown.foreground': p.fg,
        'dropdown.border': p.selectionBorder,
        'focusBorder': p.selectionBorder,
        'button.background': p.keyword,
        'button.foreground': p.bg,
        'button.hoverBackground': p.keyword + 'cc',
        'badge.background': p.keyword,
        'badge.foreground': p.bg,
        'progressBar.background': p.keyword,
        'editorSuggestWidget.background': p.bgAlt,
        'editorSuggestWidget.border': p.selectionBorder,
        'editorSuggestWidget.selectedBackground': p.selection,
        'editorSuggestWidget.highlightForeground': p.keyword,
        'editorHoverWidget.background': p.bgAlt,
        'editorHoverWidget.border': p.selectionBorder,

        // Gutter/diff
        'editorGutter.addedBackground': p.added,
        'editorGutter.deletedBackground': p.removed,
        'editorGutter.modifiedBackground': p.modified,
        'gitDecoration.addedResourceForeground': p.string,
        'gitDecoration.deletedResourceForeground': p.error,
        'gitDecoration.modifiedResourceForeground': p.fn,
        'gitDecoration.untrackedResourceForeground': p.string,
        'diffEditor.insertedTextBackground': p.added + '33',
        'diffEditor.removedTextBackground': p.removed + '33',

        // Scrollbar/borders
        'scrollbar.shadow': p.bg,
        'scrollbarSlider.background': p.selection,
        'scrollbarSlider.hoverBackground': p.selectionBorder,
        'scrollbarSlider.activeBackground': p.keyword + '66',
        'editorOverviewRuler.errorForeground': p.error,
        'editorOverviewRuler.warningForeground': p.warning,
        'editorOverviewRuler.addedForeground': p.added,
        'editorOverviewRuler.deletedForeground': p.removed,
        'editorOverviewRuler.modifiedForeground': p.modified,

        // Terminal ANSI
        'terminal.background': p.bg,
        'terminal.foreground': p.fg,
        'terminal.ansiBlack': p.ansi.black,
        'terminal.ansiRed': p.ansi.red,
        'terminal.ansiGreen': p.ansi.green,
        'terminal.ansiYellow': p.ansi.yellow,
        'terminal.ansiBlue': p.ansi.blue,
        'terminal.ansiMagenta': p.ansi.magenta,
        'terminal.ansiCyan': p.ansi.cyan,
        'terminal.ansiWhite': p.ansi.white,
        'terminal.ansiBrightBlack': p.ansi.brightBlack,
        'terminal.ansiBrightRed': p.ansi.brightRed,
        'terminal.ansiBrightGreen': p.ansi.brightGreen,
        'terminal.ansiBrightYellow': p.ansi.brightYellow,
        'terminal.ansiBrightBlue': p.ansi.brightBlue,
        'terminal.ansiBrightMagenta': p.ansi.brightMagenta,
        'terminal.ansiBrightCyan': p.ansi.brightCyan,
        'terminal.ansiBrightWhite': p.ansi.brightWhite,
      },
      tokenColors: [
        {
          name: 'Comment',
          scope: ['comment', 'punctuation.definition.comment'],
          settings: { foreground: p.comment, fontStyle: 'italic' },
        },
        {
          name: 'String',
          scope: ['string', 'constant.other.symbol'],
          settings: { foreground: p.string },
        },
        {
          name: 'Number',
          scope: ['constant.numeric', 'constant.language', 'support.constant', 'constant.language.boolean'],
          settings: { foreground: p.number },
        },
        {
          name: 'Keyword',
          scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.operator'],
          settings: { foreground: p.keyword },
        },
        {
          name: 'Function',
          scope: ['entity.name.function', 'support.function', 'variable.function'],
          settings: { foreground: p.fn },
        },
        {
          name: 'Type',
          scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
          settings: { foreground: p.type },
        },
        {
          name: 'Variable',
          scope: ['variable'],
          settings: { foreground: p.variable },
        },
        {
          name: 'Parameter',
          scope: ['variable.parameter'],
          settings: { fontStyle: 'italic' },
        },
        {
          name: 'Tag / Operator',
          scope: ['entity.name.tag', 'keyword.operator'],
          settings: { foreground: p.operator },
        },
        {
          name: 'Markup Heading',
          scope: ['markup.heading'],
          settings: { foreground: p.keyword, fontStyle: 'bold' },
        },
        {
          name: 'Markup Inserted',
          scope: ['markup.inserted'],
          settings: { foreground: p.string },
        },
        {
          name: 'Markup Deleted',
          scope: ['markup.deleted'],
          settings: { foreground: p.error },
        },
      ],
    };

    return JSON.stringify(data, null, 2) + '\n';
  },

  installPath() {
    return null;
  },

  fileExtension() {
    return '.json';
  },
};
