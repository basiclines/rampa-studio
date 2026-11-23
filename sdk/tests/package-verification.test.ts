import { describe, expect, it } from 'bun:test';
import { resolve } from 'path';

const script = resolve(__dirname, '../scripts/verify-package.cjs');

async function verifyPackage(metadata: unknown) {
  const proc = Bun.spawn(['node', script], {
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  proc.stdin.write(JSON.stringify(metadata));
  proc.stdin.end();
  const stderr = await new Response(proc.stderr).text();
  return { exitCode: await proc.exited, stderr };
}

describe('SDK package verification', () => {
  const packageInfo = { files: [{ path: 'dist/index.d.ts' }] };

  it('accepts npm 11 array output', async () => {
    expect((await verifyPackage([packageInfo])).exitCode).toBe(0);
  });

  it('accepts npm 12 package-keyed output', async () => {
    expect((await verifyPackage({ '@basiclines/rampa-sdk': packageInfo })).exitCode).toBe(0);
  });

  it('rejects packages missing the entry declaration', async () => {
    const result = await verifyPackage({ '@basiclines/rampa-sdk': { files: [] } });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('SDK package is missing dist/index.d.ts');
  });
});
