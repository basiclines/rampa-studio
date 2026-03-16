import { describe, it, expect } from 'bun:test';

const CLI_CMD = `cd "${import.meta.dir}/.." && bun run src/index.ts`;

async function runCli(args: string): Promise<string> {
  const proc = Bun.spawn(['bash', '-c', `${CLI_CMD} color ${args}`], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function runCliJson(args: string): Promise<any> {
  const text = await runCli(`${args} --output json`);
  return JSON.parse(text);
}

describe('CLI color transforms', () => {
  describe('lighten / darken', () => {
    it('--lighten increases lightness', async () => {
      const original = await runCliJson("'#666666'");
      const lightened = await runCliJson("'#666666' --lighten 0.1");
      expect(lightened.oklch.l).toBeGreaterThan(original.oklch.l);
    });

    it('--darken decreases lightness', async () => {
      const original = await runCliJson("'#666666'");
      const darkened = await runCliJson("'#666666' --darken 0.1");
      expect(darkened.oklch.l).toBeLessThan(original.oklch.l);
    });
  });

  describe('saturate / desaturate', () => {
    it('--saturate increases chroma', async () => {
      const original = await runCliJson("'#996666'");
      const saturated = await runCliJson("'#996666' --saturate 0.05");
      expect(saturated.oklch.c).toBeGreaterThan(original.oklch.c);
    });

    it('--desaturate decreases chroma', async () => {
      const original = await runCliJson("'#ff0000'");
      const desaturated = await runCliJson("'#ff0000' --desaturate 0.05");
      expect(desaturated.oklch.c).toBeLessThan(original.oklch.c);
    });
  });

  describe('rotate', () => {
    it('--rotate changes hue', async () => {
      const original = await runCliJson("'#ff0000'");
      const rotated = await runCliJson("'#ff0000' --rotate 120");
      expect(rotated.oklch.h).not.toBeCloseTo(original.oklch.h, 0);
    });
  });

  describe('set', () => {
    it('--set-lightness sets absolute lightness', async () => {
      const result = await runCliJson("'#ff0000' --set-lightness 0.5");
      expect(result.oklch.l).toBeCloseTo(0.5, 1);
    });

    it('--set-chroma sets absolute chroma', async () => {
      const result = await runCliJson("'#ff0000' --set-chroma 0.1");
      expect(result.oklch.c).toBeCloseTo(0.1, 1);
    });

    it('--set-hue sets absolute hue', async () => {
      const result = await runCliJson("'#ff0000' --set-hue 180");
      expect(result.oklch.h).toBeCloseTo(180, 0);
    });
  });

  describe('mix', () => {
    it('--mix blends two colors', async () => {
      const result = await runCliJson("'#ff0000' --mix '#0000ff' --ratio 0.5");
      expect(result.hex).not.toBe('#ff0000');
      expect(result.hex).not.toBe('#0000ff');
    });

    it('--mix with --space uses different color space', async () => {
      const oklch = await runCliJson("'#ff0000' --mix '#0000ff' --ratio 0.5");
      const lab = await runCliJson("'#ff0000' --mix '#0000ff' --ratio 0.5 --space lab");
      expect(oklch.hex).not.toBe(lab.hex);
    });
  });

  describe('blend', () => {
    it('--blend with --mode applies blend mode', async () => {
      const result = await runCliJson("'#ff8800' --blend '#0088ff' --ratio 0.5 --mode multiply");
      expect(result.hex).toBeDefined();
      expect(result.hex).not.toBe('#ff8800');
    });
  });

  describe('chaining', () => {
    it('multiple transforms applied left to right', async () => {
      const result = await runCliJson("'#66b172' --lighten 0.1 --desaturate 0.05");
      const original = await runCliJson("'#66b172'");
      expect(result.oklch.l).toBeGreaterThan(original.oklch.l);
    });

    it('transforms with CSS output', async () => {
      const css = await runCli("'#66b172' --lighten 0.1 --desaturate 0.05 -O css --prefix brand");
      expect(css).toContain(':root {');
      expect(css).toContain('--brand-');
    });
  });
});
