/**
 * CSS and JSON formatters for color space results.
 */

/**
 * Format a 1D palette as CSS custom properties.
 * Output: :root { --{prefix}-0: #...; --{prefix}-1: #...; }
 */
export function linearToCSS(palette: string[], prefix: string = 'color'): string {
  const lines: string[] = [':root {'];
  for (let i = 0; i < palette.length; i++) {
    lines.push(`  --${prefix}-${i}: ${palette[i]};`);
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Format a 1D palette as JSON.
 */
export function linearToJSON(palette: string[], prefix: string = 'color'): string {
  return JSON.stringify({ name: prefix, colors: palette }, null, 2);
}

/**
 * Format a 2D plane palette as CSS custom properties.
 * Output: :root { --{prefix}-{sat}-{lgt}: #...; }
 */
export function planeToCSS(palette: string[], size: number, prefix: string = 'color'): string {
  const lines: string[] = [':root {'];
  for (let sat = 0; sat < size; sat++) {
    for (let lgt = 0; lgt < size; lgt++) {
      const idx = sat * size + lgt;
      lines.push(`  --${prefix}-${sat}-${lgt}: ${palette[idx]};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Format a 2D plane palette as JSON.
 */
export function planeToJSON(palette: string[], size: number, prefix: string = 'color'): string {
  const grid: string[][] = [];
  for (let sat = 0; sat < size; sat++) {
    const row: string[] = [];
    for (let lgt = 0; lgt < size; lgt++) {
      row.push(palette[sat * size + lgt]);
    }
    grid.push(row);
  }
  return JSON.stringify({ name: prefix, size, colors: grid }, null, 2);
}

/**
 * Format a 3D cube palette as CSS custom properties.
 * Output: :root { --{prefix}-{x}-{y}-{z}: #...; }
 */
export function cubeToCSS(palette: string[], size: number, prefix: string = 'color'): string {
  const lines: string[] = [':root {'];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const idx = x * size * size + y * size + z;
        lines.push(`  --${prefix}-${x}-${y}-${z}: ${palette[idx]};`);
      }
    }
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Format a 3D cube palette as JSON.
 */
export function cubeToJSON(palette: string[], size: number, prefix: string = 'color'): string {
  const cube: string[][][] = [];
  for (let x = 0; x < size; x++) {
    const plane: string[][] = [];
    for (let y = 0; y < size; y++) {
      const row: string[] = [];
      for (let z = 0; z < size; z++) {
        row.push(palette[x * size * size + y * size + z]);
      }
      plane.push(row);
    }
    cube.push(plane);
  }
  return JSON.stringify({ name: prefix, size, colors: cube }, null, 2);
}
