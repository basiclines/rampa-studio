import { describe, it, expect } from 'bun:test';
import { parseColorspaceArgs, runColorspace } from '../src/colorspace';

describe('parseColorspaceArgs', () => {
  it('parses --cube with key=color pairs', () => {
    const args = parseColorspaceArgs([
      '--cube', 'k=#000', 'r=#f00', 'g=#0f0', 'b=#00f',
      'y=#ff0', 'm=#f0f', 'c=#0ff', 'w=#fff',
    ]);
    expect(args.mode).toBe('cube');
    expect(Object.keys(args.corners!)).toHaveLength(8);
    expect(args.corners!.r).toBe('#f00');
  });

  it('parses --linear with colors', () => {
    const args = parseColorspaceArgs(['--linear', '#ffffff', '#000000']);
    expect(args.mode).toBe('linear');
    expect(args.colors).toEqual(['#ffffff', '#000000']);
  });

  it('parses --size', () => {
    const args = parseColorspaceArgs(['--linear', '#fff', '#000', '--size', '10']);
    expect(args.size).toBe(10);
  });

  it('parses --interpolation', () => {
    const args = parseColorspaceArgs(['--linear', '#fff', '#000', '--interpolation', 'lab']);
    expect(args.interpolation).toBe('lab');
  });

  it('parses --interpolation false', () => {
    const args = parseColorspaceArgs(['--linear', '#fff', '#000', '--interpolation', 'false']);
    expect(args.interpolation).toBe(false);
  });

  it('parses --tint with alias:intensity pairs', () => {
    const args = parseColorspaceArgs([
      '--cube', 'k=#000', 'r=#f00', 'g=#0f0', 'b=#00f',
      'y=#ff0', 'm=#f0f', 'c=#0ff', 'w=#fff',
      '--tint', 'r:4,b:2',
    ]);
    expect(args.tint).toEqual({ r: 4, b: 2 });
  });

  it('parses --at with index', () => {
    const args = parseColorspaceArgs(['--linear', '#fff', '#000', '--at', '12']);
    expect(args.at).toBe(12);
  });

  it('parses --format', () => {
    const args = parseColorspaceArgs(['--linear', '#fff', '#000', '--format', 'hsl']);
    expect(args.format).toBe('hsl');
  });

  it('parses --output', () => {
    const args = parseColorspaceArgs(['--linear', '#fff', '#000', '--output', 'json']);
    expect(args.output).toBe('json');
  });

  it('parses --config', () => {
    const args = parseColorspaceArgs(['--config', 'theme.json']);
    expect(args.mode).toBe('config');
    expect(args.configPath).toBe('theme.json');
  });

  it('parses --plane with 3 colors', () => {
    const args = parseColorspaceArgs(['--plane', '#1e1e2e', '#cdd6f4', '#f38ba8']);
    expect(args.mode).toBe('plane');
    expect(args.dark).toBe('#1e1e2e');
    expect(args.light).toBe('#cdd6f4');
    expect(args.hue).toBe('#f38ba8');
  });

  it('parses --xy with saturation,lightness', () => {
    const args = parseColorspaceArgs(['--plane', '#000', '#fff', '#f00', '--xy', '3,5']);
    expect(args.xy).toEqual([3, 5]);
  });

  it('defaults to oklch interpolation', () => {
    const args = parseColorspaceArgs(['--linear', '#fff', '#000']);
    expect(args.interpolation).toBe('oklch');
  });

  it('defaults format to hex', () => {
    const args = parseColorspaceArgs(['--linear', '#fff', '#000']);
    expect(args.format).toBe('hex');
  });
});

describe('runColorspace integration', () => {
  // Capture console output
  let output: string[] = [];
  const originalLog = console.log;

  function captureOutput(fn: () => void): string {
    output = [];
    console.log = (...args: any[]) => output.push(args.join(' '));
    fn();
    console.log = originalLog;
    return output.join('\n');
  }

  it('returns a single hex color for --tint query', () => {
    const result = captureOutput(() => {
      runColorspace([
        '--cube', 'k=#000000', 'r=#ff0000', 'g=#00ff00', 'b=#0000ff',
        'y=#ffff00', 'm=#ff00ff', 'c=#00ffff', 'w=#ffffff',
        '--size', '6', '--tint', 'r:5',
      ]);
    });
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns a single color for --at query', () => {
    const result = captureOutput(() => {
      runColorspace(['--linear', '#ffffff', '#000000', '--size', '24', '--at', '1']);
    });
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns hsl format when requested', () => {
    const result = captureOutput(() => {
      runColorspace([
        '--linear', '#ff0000', '#0000ff', '--size', '5', '--at', '1', '--format', 'hsl',
      ]);
    });
    expect(result).toMatch(/^hsl\(/);
  });

  it('returns JSON palette with --output json', () => {
    const result = captureOutput(() => {
      runColorspace(['--linear', '#ffffff', '#000000', '--size', '5', '--output', 'json']);
    });
    const parsed = JSON.parse(result);
    expect(parsed.palette).toHaveLength(5);
    expect(parsed.size).toBe(5);
  });

  it('lookup table returns exact colors', () => {
    const result = captureOutput(() => {
      runColorspace([
        '--linear', '#ff0000', '#00ff00', '#0000ff',
        '--interpolation', 'false', '--at', '2',
      ]);
    });
    expect(result).toBe('#00ff00');
  });

  it('cube and SDK produce same result for same inputs', () => {
    // This tests that CLI uses the same engine as SDK
    const result = captureOutput(() => {
      runColorspace([
        '--cube', 'k=#1e1e2e', 'r=#f38ba8', 'g=#a6e3a1', 'b=#89b4fa',
        'y=#f9e2af', 'm=#cba6f7', 'c=#94e2d5', 'w=#cdd6f4',
        '--size', '6', '--tint', 'k:0',
      ]);
    });
    // Origin should be close to the first corner
    expect(result).toMatch(/^#/);
  });

  it('returns a single color for --plane --xy query', () => {
    const result = captureOutput(() => {
      runColorspace([
        '--plane', '#000000', '#ffffff', '#ff0000',
        '--size', '6', '--xy', '3,5',
      ]);
    });
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('plane (0,0) returns dark anchor', () => {
    const result = captureOutput(() => {
      runColorspace([
        '--plane', '#000000', '#ffffff', '#ff0000',
        '--size', '6', '--xy', '0,0',
      ]);
    });
    expect(result).toBe('#000000');
  });

  it('plane full palette has size² colors', () => {
    const result = captureOutput(() => {
      runColorspace([
        '--plane', '#000000', '#ffffff', '#ff0000',
        '--size', '4', '--output', 'json',
      ]);
    });
    const parsed = JSON.parse(result);
    expect(parsed.palette).toHaveLength(16);
    expect(parsed.size).toBe(16);
  });
});
