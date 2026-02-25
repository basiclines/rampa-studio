import { describe, it, expect, beforeAll } from 'bun:test';
import { $ } from 'bun';
import { join } from 'path';
import { parseLintArgs } from '../src/lint';
import { parseInspectArgs } from '../src/inspect';

beforeAll(async () => {
  await $`bun run build`.cwd(join(import.meta.dir, '..'));
});

describe('rampa lint', () => {
  describe('parseLintArgs', () => {
    it('should parse --foreground and --background', () => {
      const args = parseLintArgs(['--foreground', '#fff', '--background', '#000']);
      expect(args.foreground).toBe('#fff');
      expect(args.background).toBe('#000');
      expect(args.mode).toBe('apca');
      expect(args.output).toBe('text');
    });

    it('should parse --fg and --bg shorthand', () => {
      const args = parseLintArgs(['--fg', '#fff', '--bg', '#000']);
      expect(args.foreground).toBe('#fff');
      expect(args.background).toBe('#000');
    });

    it('should parse --mode wcag', () => {
      const args = parseLintArgs(['--fg', '#fff', '--bg', '#000', '--mode', 'wcag']);
      expect(args.mode).toBe('wcag');
    });

    it('should parse --output json', () => {
      const args = parseLintArgs(['--fg', '#fff', '--bg', '#000', '--output', 'json']);
      expect(args.output).toBe('json');
    });

    it('should parse -O css', () => {
      const args = parseLintArgs(['--fg', '#fff', '--bg', '#000', '-O', 'css']);
      expect(args.output).toBe('css');
    });
  });

  describe('CLI integration - lint', () => {
    const CLI = './dist/rampa';

    it('should output text by default', () => {
      const result = Bun.spawnSync([CLI, 'lint', '--fg', '#ffffff', '--bg', '#000000'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('Contrast Lint');
      expect(output).toContain('Pass');
    });

    it('should output JSON', () => {
      const result = Bun.spawnSync([CLI, 'lint', '--fg', '#fff', '--bg', '#000', '--output', 'json'], { cwd: import.meta.dir + '/..', });
      const json = JSON.parse(result.stdout.toString());
      expect(json.mode).toBe('apca');
      expect(json.score).toBeDefined();
      expect(json.levels).toBeInstanceOf(Array);
    });

    it('should output CSS', () => {
      const result = Bun.spawnSync([CLI, 'lint', '--fg', '#fff', '--bg', '#000', '-O', 'css'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('--lint-foreground');
      expect(output).toContain('--lint-background');
    });

    it('should support WCAG mode', () => {
      const result = Bun.spawnSync([CLI, 'lint', '--fg', '#fff', '--bg', '#000', '--mode', 'wcag'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('WCAG 2.x');
    });

    it('should show warnings for near-identical colors', () => {
      const result = Bun.spawnSync([CLI, 'lint', '--fg', '#333333', '--bg', '#343434'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('Warning');
      expect(output).toContain('nearly identical');
    });

    it('should show warnings for pure black/white', () => {
      const result = Bun.spawnSync([CLI, 'lint', '--fg', '#000000', '--bg', '#ffffff'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('#000000');
      expect(output).toContain('#ffffff');
    });

    it('should include warnings in JSON output', () => {
      const result = Bun.spawnSync([CLI, 'lint', '--fg', '#000000', '--bg', '#ffffff', '-O', 'json'], { cwd: import.meta.dir + '/..', });
      const json = JSON.parse(result.stdout.toString());
      expect(json.warnings.length).toBeGreaterThan(0);
    });

    it('should show help with --help', () => {
      const result = Bun.spawnSync([CLI, 'lint', '--help'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('--foreground');
      expect(output).toContain('--background');
    });
  });
});

describe('rampa inspect', () => {
  describe('parseInspectArgs', () => {
    it('should parse -c', () => {
      const args = parseInspectArgs(['-c', '#ff6600']);
      expect(args.color).toBe('#ff6600');
      expect(args.output).toBe('text');
    });

    it('should parse --color', () => {
      const args = parseInspectArgs(['--color', '#ff6600']);
      expect(args.color).toBe('#ff6600');
    });

    it('should parse --output json', () => {
      const args = parseInspectArgs(['-c', '#ff6600', '--output', 'json']);
      expect(args.output).toBe('json');
    });

    it('should parse -O css', () => {
      const args = parseInspectArgs(['-c', '#ff6600', '-O', 'css']);
      expect(args.output).toBe('css');
    });
  });

  describe('CLI integration - inspect', () => {
    const CLI = './dist/rampa';

    it('should output text by default', () => {
      const result = Bun.spawnSync([CLI, 'inspect', '-c', '#ff6600'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('Color Inspect');
      expect(output).toContain('hex:');
      expect(output).toContain('rgb:');
      expect(output).toContain('hsl:');
      expect(output).toContain('oklch:');
    });

    it('should output JSON with destructured values', () => {
      const result = Bun.spawnSync([CLI, 'inspect', '-c', '#ff6600', '--output', 'json'], { cwd: import.meta.dir + '/..', });
      const json = JSON.parse(result.stdout.toString());
      expect(json.hex).toBeDefined();
      expect(json.rgb.raw).toBeDefined();
      expect(json.rgb.r).toBe(255);
      expect(json.rgb.g).toBe(102);
      expect(json.rgb.b).toBe(0);
      expect(json.hsl.h).toBeDefined();
      expect(json.hsl.s).toBeDefined();
      expect(json.hsl.l).toBeDefined();
      expect(json.hsl.raw).toBeDefined();
      expect(json.oklch.l).toBeDefined();
      expect(json.oklch.c).toBeDefined();
      expect(json.oklch.h).toBeDefined();
      expect(json.oklch.raw).toBeDefined();
    });

    it('should output CSS', () => {
      const result = Bun.spawnSync([CLI, 'inspect', '-c', '#ff6600', '-O', 'css'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('--color-hex:');
      expect(output).toContain('--color-rgb:');
      expect(output).toContain('--color-hsl:');
      expect(output).toContain('--color-oklch:');
    });

    it('should accept rgb input', () => {
      const result = Bun.spawnSync([CLI, 'inspect', '-c', 'rgb(255, 102, 0)', '--output', 'json'], { cwd: import.meta.dir + '/..', });
      const json = JSON.parse(result.stdout.toString());
      expect(json.hex).toBeDefined();
    });

    it('should show help with --help', () => {
      const result = Bun.spawnSync([CLI, 'inspect', '--help'], { cwd: import.meta.dir + '/..', });
      const output = result.stdout.toString();
      expect(output).toContain('-c, --color');
    });
  });
});
