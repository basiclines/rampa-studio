import { describe, it, expect } from 'bun:test';
import { rampa } from '../src/index';

/**
 * Integration tests that verify the SDK produces the same colors as the CLI.
 * Each test runs the CLI as a subprocess and compares hex output with SDK results.
 */

async function runCli(args: string): Promise<{ ramps: { name: string; colors: { hex: string }[] }[] }> {
  // Quote hex colors for bash (# is a comment character)
  const quotedArgs = args.replace(/(#[0-9a-fA-F]+)/g, '"$1"');
  const proc = Bun.spawn(
    ['bash', '-c', `cd "${import.meta.dir}/../../cli" && bun run src/index.ts ${quotedArgs}`],
    {
      stdout: 'pipe',
      stderr: 'pipe',
    }
  );
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return JSON.parse(text);
}

function extractHexColors(cliOutput: { ramps: { name: string; colors: { hex: string }[] }[] }): string[][] {
  return cliOutput.ramps.map(r => r.colors.map(c => c.hex));
}

describe('SDK ↔ CLI parity', () => {
  it('default ramp: same colors for --color "#3b82f6" --size=5', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --output json');
    const sdkResult = rampa('#3b82f6').size(5).generate();

    const cliHexColors = extractHexColors(cliResult);
    const sdkHexColors = sdkResult.ramps.map(r => r.colors);

    expect(sdkHexColors).toEqual(cliHexColors);
  });

  it('default ramp: same colors for --color "#fe0000" --size=10', async () => {
    const cliResult = await runCli('--color #fe0000 --size=10 --output json');
    const sdkResult = rampa('#fe0000').size(10).generate();

    const cliHexColors = extractHexColors(cliResult);
    const sdkHexColors = sdkResult.ramps.map(r => r.colors);

    expect(sdkHexColors).toEqual(cliHexColors);
  });

  it('custom lightness range: --lightness 10:90', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --lightness 10:90 --output json');
    const sdkResult = rampa('#3b82f6').size(5).lightness(10, 90).generate();

    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('custom saturation range: --saturation 80:20', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --saturation 80:20 --output json');
    const sdkResult = rampa('#3b82f6').size(5).saturation(80, 20).generate();

    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('custom hue range: --hue -30:30', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --hue=-30:30 --output json');
    const sdkResult = rampa('#3b82f6').size(5).hue(-30, 30).generate();

    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('fibonacci lightness scale', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=8 --lightness-scale fibonacci --output json');
    const sdkResult = rampa('#3b82f6').size(8).lightnessScale('fibonacci').generate();

    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('ease-in-out saturation scale', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=8 --saturation-scale ease-in-out --output json');
    const sdkResult = rampa('#3b82f6').size(8).saturationScale('ease-in-out').generate();

    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('tinting: --tint-color #FF0000 --tint-opacity 20', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --tint-color #FF0000 --tint-opacity 20 --output json');
    const sdkResult = rampa('#3b82f6').size(5).tint('#FF0000', 20).generate();

    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('tinting with blend mode: --tint-blend multiply', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --tint-color #FF0000 --tint-opacity 30 --tint-blend multiply --output json');
    const sdkResult = rampa('#3b82f6').size(5).tint('#FF0000', 30, 'multiply').generate();

    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('complementary harmony', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --add=complementary --output json');
    const sdkResult = rampa('#3b82f6').size(5).add('complementary').generate();

    expect(sdkResult.ramps.map(r => r.name)).toEqual(cliResult.ramps.map(r => r.name));
    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('triadic harmony', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --add=triadic --output json');
    const sdkResult = rampa('#3b82f6').size(5).add('triadic').generate();

    expect(sdkResult.ramps.map(r => r.name)).toEqual(cliResult.ramps.map(r => r.name));
    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('shift harmony: --add=shift:45', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --add=shift:45 --output json');
    const sdkResult = rampa('#3b82f6').size(5).add('shift', 45).generate();

    expect(sdkResult.ramps.map(r => r.name)).toEqual(cliResult.ramps.map(r => r.name));
    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('multiple harmonies: complementary + shift:90', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --add=complementary --add=shift:90 --output json');
    const sdkResult = rampa('#3b82f6').size(5).add('complementary').add('shift', 90).generate();

    expect(sdkResult.ramps.map(r => r.name)).toEqual(cliResult.ramps.map(r => r.name));
    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('combined: lightness + saturation + scale + tint + harmony', async () => {
    const cliResult = await runCli('--color #e74c3c --size=8 --lightness 5:95 --saturation 90:10 --lightness-scale golden-ratio --tint-color #0000FF --tint-opacity 10 --add=analogous --output json');
    const sdkResult = rampa('#e74c3c')
      .size(8)
      .lightness(5, 95)
      .saturation(90, 10)
      .lightnessScale('golden-ratio')
      .tint('#0000FF', 10)
      .add('analogous')
      .generate();

    expect(sdkResult.ramps.map(r => r.name)).toEqual(cliResult.ramps.map(r => r.name));
    expect(sdkResult.ramps.map(r => r.colors)).toEqual(extractHexColors(cliResult));
  });

  it('hsl format parity', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --format hsl --output json');
    const sdkResult = rampa('#3b82f6').size(5).format('hsl').generate();

    // CLI JSON with --format hsl returns structured {hsl: {h,s,l}} objects.
    // SDK returns formatted hsl() strings. Compare by converting CLI structured to strings.
    const cliHslStrings = cliResult.ramps.map(r =>
      r.colors.map((c: any) => `hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`)
    );
    const sdkColors = sdkResult.ramps.map(r => r.colors);

    expect(sdkColors).toEqual(cliHslStrings);
  });

  it('rgb format parity', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --format rgb --output json');
    const sdkResult = rampa('#3b82f6').size(5).format('rgb').generate();

    const cliRgbStrings = cliResult.ramps.map(r =>
      r.colors.map((c: any) => `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`)
    );
    const sdkColors = sdkResult.ramps.map(r => r.colors);

    expect(sdkColors).toEqual(cliRgbStrings);
  });

  it('oklch format parity', async () => {
    const cliResult = await runCli('--color #3b82f6 --size=5 --format oklch --output json');
    const sdkResult = rampa('#3b82f6').size(5).format('oklch').generate();

    const cliOklchStrings = cliResult.ramps.map(r =>
      r.colors.map((c: any) => `oklch(${c.oklch.l.toFixed(1)}% ${c.oklch.c.toFixed(3)} ${c.oklch.h})`)
    );
    const sdkColors = sdkResult.ramps.map(r => r.colors);

    expect(sdkColors).toEqual(cliOklchStrings);
  });

  it('readOnly: all formats match --read-only', async () => {
    const proc = Bun.spawn(
      ['bash', '-c', `cd "${import.meta.dir}/../../cli" && bun run src/index.ts --color "#fe0000" --read-only --output json`],
      { stdout: 'pipe', stderr: 'pipe' }
    );
    const text = await new Response(proc.stdout).text();
    await proc.exited;
    const cliResult = JSON.parse(text);

    const sdkResult = rampa.readOnly('#fe0000').generate();

    expect(sdkResult).toEqual(cliResult.color);
  });

  it('readOnly with format: matches --read-only --format hsl', async () => {
    const proc = Bun.spawn(
      ['bash', '-c', `cd "${import.meta.dir}/../../cli" && bun run src/index.ts --color "#fe0000" --read-only --format hsl --output json`],
      { stdout: 'pipe', stderr: 'pipe' }
    );
    const text = await new Response(proc.stdout).text();
    await proc.exited;
    const cliResult = JSON.parse(text);

    const sdkResult = rampa.readOnly('#fe0000').format('hsl').generate();
    // CLI returns { color: { value: "hsl(...)", hsl: {...} } }
    expect(sdkResult).toBe(cliResult.color.value);
  });
});

describe('CLI Integration - Mix', () => {
  it('mix: SDK rampa.mix() matches CLI --mix JSON output', async () => {
    const proc = Bun.spawn(
      ['bash', '-c', `cd "${import.meta.dir}/../../cli" && bun run src/index.ts --color "#ff0000" --mix "#0000ff" --steps=5 --output json`],
      { stdout: 'pipe', stderr: 'pipe' }
    );
    const text = await new Response(proc.stdout).text();
    await proc.exited;
    const cliResult = JSON.parse(text);

    // Generate same colors with SDK
    const sdkColors: string[] = [];
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      sdkColors.push(rampa.mix('#ff0000', '#0000ff', t));
    }

    expect(cliResult.colors).toHaveLength(5);
    for (let i = 0; i < 5; i++) {
      expect(sdkColors[i].toLowerCase()).toBe(cliResult.colors[i].hex.toLowerCase());
    }
  });

  it('mix: handles black to white gradient', async () => {
    const proc = Bun.spawn(
      ['bash', '-c', `cd "${import.meta.dir}/../../cli" && bun run src/index.ts --color "#000000" --mix "#ffffff" --steps=3 --output json`],
      { stdout: 'pipe', stderr: 'pipe' }
    );
    const text = await new Response(proc.stdout).text();
    await proc.exited;
    const cliResult = JSON.parse(text);

    const sdkColors = [0, 0.5, 1].map(t => rampa.mix('#000000', '#ffffff', t));

    expect(cliResult.colors).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(sdkColors[i].toLowerCase()).toBe(cliResult.colors[i].hex.toLowerCase());
    }
  });
});
