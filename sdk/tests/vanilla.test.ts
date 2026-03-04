import { describe, it, expect } from 'bun:test';

describe('vanilla entry point', () => {
  it('assigns Rampa to globalThis with expected exports', async () => {
    // Import the vanilla entry point which assigns to globalThis
    await import('../src/vanilla');

    const R = (globalThis as any).Rampa;
    expect(R).toBeDefined();
    expect(typeof R.rampa).toBe('function');
    expect(typeof R.color).toBe('function');
    expect(typeof R.RampaBuilder).toBe('function');
    expect(typeof R.ReadOnlyBuilder).toBe('function');
    expect(typeof R.LinearColorSpace).toBe('function');
    expect(typeof R.CubeColorSpace).toBe('function');
    expect(typeof R.PlaneColorSpace).toBe('function');
    expect(typeof R.ContrastBuilder).toBe('function');
  });

  it('rampa generates a palette', async () => {
    const R = (globalThis as any).Rampa;
    const result = R.rampa('#3b82f6').size(5).generate();
    expect(result.ramps).toBeDefined();
    expect(result.ramps[0].colors).toHaveLength(5);
  });

  it('color spaces work', async () => {
    const R = (globalThis as any).Rampa;
    const linear = new R.LinearColorSpace('#ffffff', '#000000').size(10);
    expect('' + linear(5)).toMatch(/^#[0-9a-f]{6}$/);
  });
});
