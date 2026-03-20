import type { ThemeGenerator } from './base';
import { ghosttyGenerator } from './ghostty';
import { iterm2Generator } from './iterm2';
import { alacrittyGenerator } from './alacritty';
import { kittyGenerator } from './kitty';
import { windowsTerminalGenerator } from './windows-terminal';
import { warpGenerator } from './warp';
import { hyperGenerator } from './hyper';
import { vscodeGenerator } from './vscode';
import { xcodeGenerator } from './xcode';
import { androidStudioGenerator } from './android-studio';

export const generators: Record<string, ThemeGenerator> = {
  ghostty: ghosttyGenerator,
  iterm2: iterm2Generator,
  iterm: iterm2Generator,
  alacritty: alacrittyGenerator,
  kitty: kittyGenerator,
  'windows-terminal': windowsTerminalGenerator,
  wt: windowsTerminalGenerator,
  warp: warpGenerator,
  hyper: hyperGenerator,
  vscode: vscodeGenerator,
  xcode: xcodeGenerator,
  'android-studio': androidStudioGenerator,
};

export const SUPPORTED_APPS = Object.keys(generators);

export type { ThemeGenerator } from './base';
export { themeFileName } from './base';
