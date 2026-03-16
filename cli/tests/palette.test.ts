import { describe, it, expect } from 'bun:test';
import { resolve } from 'path';

const CLI_CMD = `cd "${resolve(__dirname, '..')}" && bun run src/index.ts`;
const TEST_PNG = resolve(__dirname, '../../tests/fixtures/test-palette.png');
const TEST_JPEG = '/Users/basiclines/Downloads/IMG_6588.jpeg';

async function runCli(...args: string[]): Promise<string> {
  const proc = Bun.spawn(['bash', '-c', `${CLI_CMD} palette ${args.join(' ')}`], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

describe('CLI palette subcommand', () => {
  describe('dominant (default)', () => {
    it('shows dominant colors from PNG', async () => {
      const out = await runCli(TEST_PNG);
      expect(out).toContain('Dominant colors');
      expect(out).toContain('#ff0000');
    });

    it('respects --count', async () => {
      const out = await runCli(`${TEST_PNG} --count 2`);
      // Should show 2 entries
      const hexMatches = out.match(/#[0-9a-f]{6}/g) || [];
      // At least 2 from dominant + 1 from average
      expect(hexMatches.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('--raw', () => {
    it('shows raw palette', async () => {
      const out = await runCli(`${TEST_PNG} --raw`);
      expect(out).toContain('Raw palette');
    });
  });

  describe('--ansi', () => {
    it('shows ANSI categories', async () => {
      const out = await runCli(`${TEST_PNG} --ansi`);
      expect(out).toContain('ANSI palette');
      expect(out).toContain('red');
      expect(out).toContain('green');
      expect(out).toContain('blue');
    });
  });

  describe('--average', () => {
    it('shows average color', async () => {
      const out = await runCli(`${TEST_PNG} --average`);
      expect(out).toContain('#');
      expect(out).toContain('oklch');
    });
  });

  describe('--temperature', () => {
    it('shows temperature', async () => {
      const out = await runCli(`${TEST_PNG} --temperature`);
      expect(out).toContain('Temperature:');
    });
  });

  describe('output formats', () => {
    it('--output json returns valid JSON', async () => {
      const out = await runCli(`${TEST_PNG} --output json`);
      const parsed = JSON.parse(out);
      expect(parsed.dominant).toBeDefined();
      expect(parsed.average).toBeDefined();
      expect(parsed.temperature).toBeDefined();
    });

    it('--output css returns CSS', async () => {
      const out = await runCli(`${TEST_PNG} --output css --prefix img`);
      expect(out).toContain(':root {');
      expect(out).toContain('--img-1:');
      expect(out).toContain('--img-avg:');
    });

    it('--ansi --output json returns ANSI JSON', async () => {
      const out = await runCli(`${TEST_PNG} --ansi --output json`);
      const parsed = JSON.parse(out);
      expect(parsed.red).toBeDefined();
      expect(parsed.blue).toBeDefined();
    });
  });

  describe('JPEG files', () => {
    it('loads JPEG and shows dominant colors', async () => {
      const out = await runCli(`${TEST_JPEG} --count 3`);
      expect(out).toContain('Dominant colors');
    });
  });

  describe('help', () => {
    it('shows help with --help', async () => {
      const out = await runCli('--help');
      expect(out).toContain('rampa palette');
      expect(out).toContain('--count');
      expect(out).toContain('--ansi');
      expect(out).toContain('--group');
      expect(out).toContain('--sort');
    });
  });

  describe('--sort', () => {
    it('--sort L sorts dominant by lightness', async () => {
      const out = await runCli(TEST_PNG, '--sort', 'L');
      const lines = out.split('\n').filter(l => l.includes('L='));
      const lValues = lines.map(l => {
        const match = l.match(/L=([\d.]+)/);
        return match ? parseFloat(match[1]) : -1;
      }).filter(v => v >= 0);
      for (let i = 1; i < lValues.length; i++) {
        expect(lValues[i]).toBeGreaterThanOrEqual(lValues[i - 1]);
      }
    });
  });

  describe('--group', () => {
    it('--group L shows lightness buckets', async () => {
      const out = await runCli(TEST_PNG, '--group', 'L');
      expect(out).toContain('Group by L');
      expect(out).toContain('darkest');
      expect(out).toContain('lightest');
    });

    it('--group C shows chroma buckets', async () => {
      const out = await runCli(TEST_PNG, '--group', 'C');
      expect(out).toContain('Group by C');
      expect(out).toContain('gray');
      expect(out).toContain('vivid');
    });

    it('--group H shows hue buckets', async () => {
      const out = await runCli(TEST_PNG, '--group', 'H');
      expect(out).toContain('Group by H');
      expect(out).toContain('red');
      expect(out).toContain('green');
      expect(out).toContain('blue');
    });

    it('--group L --output json returns valid JSON', async () => {
      const out = await runCli(TEST_PNG, '--group', 'L', '--output', 'json');
      const parsed = JSON.parse(out);
      expect(parsed).toHaveProperty('darkest');
      expect(parsed).toHaveProperty('lightest');
    });

    it('--group L --l-buckets 3 creates 3 buckets', async () => {
      const out = await runCli(TEST_PNG, '--group', 'L', '--l-buckets', '3');
      expect(out).toContain('dark');
      expect(out).toContain('mid');
      expect(out).toContain('light');
      expect(out).not.toContain('darkest');
    });
  });
});
