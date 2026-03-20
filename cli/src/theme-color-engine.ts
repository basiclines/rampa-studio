import type { ThemeYAML } from './theme-schema';
import { PlaneColorSpace } from '../../sdk/src/plane-color-space';
import { hexToOklch, oklchToHex } from '../../src/engine/OklchMathEngine';

export interface EditorPalette {
  // Backgrounds
  bg: string;
  bgAlt: string;
  lineHighlight: string;
  selection: string;
  selectionBorder: string;

  // Foregrounds
  fg: string;
  fgMuted: string;
  comment: string;

  // Cursor
  cursor: string;

  // Syntax tokens
  keyword: string;
  string: string;
  number: string;
  fn: string;
  type: string;
  variable: string;
  operator: string;

  // Diff backgrounds
  added: string;
  removed: string;
  modified: string;

  // Status colors
  error: string;
  warning: string;
  info: string;

  // Pass-through ANSI
  ansi: ThemeYAML['colors'];
  mode: 'dark' | 'light';
}

const PLANE_SIZE = 10;

const h = (c: any): string => `${c}`;

export function deriveEditorPalette(theme: ThemeYAML): EditorPalette {
  const c = theme.colors;
  const bg = c.bg;
  const fg = c.fg;
  const blue = c.blue;
  const green = c.green;
  const yellow = c.yellow;
  const red = c.red;
  const magenta = c.magenta;
  const cyan = c.cyan;

  // type: blue rotated -90° toward teal
  const [bl, bc, bh] = hexToOklch(blue);
  const teal = oklchToHex(bl, bc, ((bh - 90) + 360) % 360);

  const plane = (hue: string) => new PlaneColorSpace(bg, fg, hue).interpolation('lab').size(PLANE_SIZE);

  const bluePlane    = plane(blue);
  const greenPlane   = plane(green);
  const yellowPlane  = plane(yellow);
  const redPlane     = plane(red);
  const magPlane     = plane(magenta);
  const typePlane    = plane(teal);
  const neutralPlane = plane(blue);

  return {
    bg,
    bgAlt: h(neutralPlane.at(2, 1)),
    lineHighlight: h(neutralPlane.at(2, 1)),
    selection: h(bluePlane.at(8, 3)),
    selectionBorder: h(bluePlane.at(5, 4)),

    fg,
    fgMuted: h(neutralPlane.at(0, 7)),
    comment: h(neutralPlane.at(0, 4)),

    cursor: h(bluePlane.at(9, 7)),

    keyword: h(bluePlane.at(9, 7)),
    string: h(greenPlane.at(9, 7)),
    number: h(yellowPlane.at(9, 6)),
    fn: h(yellowPlane.at(9, 7)),
    type: h(typePlane.at(6, 8)),
    variable: fg,
    operator: h(magPlane.at(9, 7)),

    added: h(greenPlane.at(5, 3)),
    removed: h(redPlane.at(5, 3)),
    modified: h(yellowPlane.at(5, 3)),

    error: c.red,
    warning: c.yellow,
    info: c.cyan,

    ansi: c,
    mode: theme.meta.mode,
  };
}
