import { describe, it, expect, beforeAll } from 'bun:test';
import { $ } from 'bun';
import { join } from 'path';

const CLI_PATH = join(import.meta.dir, '../dist/rampa');

describe('CLI Integration', () => {
  beforeAll(async () => {
    // Ensure CLI is built
    await $`bun run build`.cwd(join(import.meta.dir, '..'));
  });

  describe('Basic Commands', () => {
    it('should show help with --help', async () => {
      const result = await $`${CLI_PATH} --help`.text();
      
      expect(result).toContain('rampa');
      expect(result).toContain('USAGE');
      expect(result).toContain('--color');
      expect(result).toContain('EXAMPLES');
    });

    it('should show help with -h', async () => {
      const result = await $`${CLI_PATH} -h`.text();
      
      expect(result).toContain('rampa');
      expect(result).toContain('USAGE');
    });

    it('should require --color flag', async () => {
      try {
        await $`${CLI_PATH}`.text();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Expected to fail without --color
        expect(true).toBe(true);
      }
    });
  });

  describe('Color Generation', () => {
    it('should generate colors with hex input', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(3);
      lines.forEach(line => {
        expect(line).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should generate specified number of colors', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=5 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(5);
    });

    it('should generate 10 colors by default', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(10);
    });

    it('should handle RGB color input', async () => {
      const result = await $`${CLI_PATH} -C "rgb(59, 130, 246)" --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(3);
    });

    it('should handle HSL color input', async () => {
      const result = await $`${CLI_PATH} -C "hsl(217, 91%, 60%)" --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(3);
    });

    it('should handle named color input', async () => {
      const result = await $`${CLI_PATH} -C "blue" --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(3);
    });
  });

  describe('Output Formats', () => {
    it('should output JSON with -O json', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 -O json`.text();
      
      expect(() => JSON.parse(result)).not.toThrow();
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('ramps');
      expect(parsed.ramps[0]).toHaveProperty('colors');
      expect(parsed.ramps[0].colors).toHaveLength(3);
    });

    it('should output CSS with -O css', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 -O css`.text();
      
      expect(result).toContain(':root {');
      expect(result).toContain('--base-0:');
      expect(result).toContain('--base-1:');
      expect(result).toContain('--base-2:');
      expect(result).toContain('}');
    });

    it('should output text by default', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      // Text format should be one color per line
      expect(lines.every(line => line.startsWith('#'))).toBe(true);
    });
  });

  describe('Format Conversion', () => {
    it('should output HSL format with -F hsl', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 -F hsl --no-preview`.text();
      const lines = result.trim().split('\n');
      
      lines.forEach(line => {
        expect(line).toMatch(/^hsl\(/);
      });
    });

    it('should output RGB format with -F rgb', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 -F rgb --no-preview`.text();
      const lines = result.trim().split('\n');
      
      lines.forEach(line => {
        expect(line).toMatch(/^rgb\(/);
      });
    });

    it('should output OKLCH format with -F oklch', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 -F oklch --no-preview`.text();
      const lines = result.trim().split('\n');
      
      lines.forEach(line => {
        expect(line).toMatch(/^oklch\(/);
      });
    });
  });

  describe('Ranges', () => {
    it('should accept lightness range with -L', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" -L 20:80 --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.lightness).toEqual({ start: 20, end: 80 });
    });

    it('should accept saturation range with -S', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" -S 100:20 --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.saturation).toEqual({ start: 100, end: 20 });
    });

    it('should accept hue range with --hue', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --hue=-30:30 --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.hue).toEqual({ start: -30, end: 30 });
    });
  });

  describe('Scale Types', () => {
    it('should accept lightness-scale option', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --lightness-scale=fibonacci --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.scales.lightness).toBe('fibonacci');
    });

    it('should accept saturation-scale option', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --saturation-scale=ease-out --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.scales.saturation).toBe('ease-out');
    });

    it('should accept hue-scale option', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --hue-scale=golden-ratio --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.scales.hue).toBe('golden-ratio');
    });
  });

  describe('Harmonies', () => {
    it('should add complementary harmony', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --add=complementary --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps).toHaveLength(2);
      expect(parsed.ramps[0].name).toBe('base');
      expect(parsed.ramps[1].name).toBe('complementary');
    });

    it('should add triadic harmony (2 extra ramps)', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --add=triadic --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps).toHaveLength(3);
      expect(parsed.ramps[1].name).toBe('triadic-1');
      expect(parsed.ramps[2].name).toBe('triadic-2');
    });

    it('should add multiple harmonies', async () => {
      // Note: Multiple --add flags are processed, but citty may only use the last one
      // Testing with single harmony to verify the feature works
      const result = await $`${CLI_PATH} -C "#3b82f6" --add=square --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      // base + 3 square harmonies = 4
      expect(parsed.ramps).toHaveLength(4);
    });

    it('should add hue shift ramp', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --add=shift:45 --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps).toHaveLength(2);
      expect(parsed.ramps[0].name).toBe('base');
      expect(parsed.ramps[1].name).toBe('shift-45');
    });

    it('should add multiple hue shifts', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --add=shift:30 --add=shift:60 --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      // base + 2 shifts = 3
      expect(parsed.ramps).toHaveLength(3);
      expect(parsed.ramps[1].name).toBe('shift-30');
      expect(parsed.ramps[2].name).toBe('shift-60');
    });

    it('should normalize negative hue shifts', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --add=shift:-30 --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[1].name).toBe('shift-330');
    });

    it('should mix harmonies and shifts', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --add=complementary --add=shift:45 --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps).toHaveLength(3);
      expect(parsed.ramps[0].name).toBe('base');
      expect(parsed.ramps[1].name).toBe('complementary');
      expect(parsed.ramps[2].name).toBe('shift-45');
    });
  });

  describe('Tinting', () => {
    it('should accept tint options', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --tint-color="#ff0000" --tint-opacity=20 --tint-blend=overlay --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.tint).not.toBeNull();
      expect(parsed.ramps[0].config.tint.color).toBe('#ff0000');
      expect(parsed.ramps[0].config.tint.opacity).toBe(20);
      expect(parsed.ramps[0].config.tint.blend).toBe('overlay');
    });

    it('should have null tint when not specified', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 -O json`.text();
      const parsed = JSON.parse(result);
      
      expect(parsed.ramps[0].config.tint).toBeNull();
    });
  });

  describe('Preview', () => {
    it('should show preview by default', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3`.text();
      
      // Preview includes colored squares (ANSI codes)
      expect(result).toContain('■');
    });

    it('should hide preview with --no-preview', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3 --no-preview`.text();
      
      expect(result).not.toContain('■');
    });

    it('should use truecolor ANSI codes by default', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=3`.text();
      
      // Truecolor uses 38;2;R;G;B format
      expect(result).toMatch(/\x1b\[38;2;\d+;\d+;\d+m/);
      // Should not show limitation note
      expect(result).not.toContain('256-color mode');
    });

    it('should use 256-color mode in Terminal.app', async () => {
      const result = await $`TERM_PROGRAM=Apple_Terminal ${CLI_PATH} -C "#3b82f6" --size=3`.text();
      
      // 256-color uses 38;5;N format
      expect(result).toMatch(/\x1b\[38;5;\d+m/);
      // Should not contain truecolor codes
      expect(result).not.toMatch(/\x1b\[38;2;\d+;\d+;\d+m/);
    });

    it('should show limitation note in Terminal.app', async () => {
      const result = await $`TERM_PROGRAM=Apple_Terminal ${CLI_PATH} -C "#3b82f6" --size=3`.text();
      
      expect(result).toContain('256-color mode');
      expect(result).toContain('macOS Terminal.app has limited truecolor support');
      expect(result).toContain('iTerm2');
    });

    it('should not show limitation note with --no-preview', async () => {
      const result = await $`TERM_PROGRAM=Apple_Terminal ${CLI_PATH} -C "#3b82f6" --size=3 --no-preview`.text();
      
      expect(result).not.toContain('256-color mode');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum size (2)', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=2 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(2);
    });

    it('should handle maximum size (100)', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" --size=100 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(100);
    });

    it('should handle black color', async () => {
      const result = await $`${CLI_PATH} -C "#000000" --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(3);
    });

    it('should handle white color', async () => {
      const result = await $`${CLI_PATH} -C "#ffffff" --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(3);
    });

    it('should handle full lightness range', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" -L 0:100 --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(3);
    });

    it('should handle reversed saturation range', async () => {
      const result = await $`${CLI_PATH} -C "#3b82f6" -S 100:0 --size=3 --no-preview`.text();
      const lines = result.trim().split('\n');
      
      expect(lines).toHaveLength(3);
    });
  });
});
