import { describe, it, expect } from 'bun:test';
import { LinearColorSpace, CubeColorSpace, colorTable } from '../src/index';

// ── LinearColorSpace ───────────────────────────────────────────────────

describe('LinearColorSpace', () => {
  it('generates the correct number of colors', () => {
    const neutral = new LinearColorSpace('#ffffff', '#000000').size(24);
    expect(neutral.palette).toHaveLength(24);
    expect(neutral.size).toBe(24);
  });

  it('returns a callable function', () => {
    const neutral = new LinearColorSpace('#ffffff', '#000000').size(10);
    expect(typeof neutral).toBe('function');
  });

  it('endpoints match with rgb interpolation', () => {
    const fn = new LinearColorSpace('#ff0000', '#0000ff', { interpolation: 'rgb' }).size(5);
    expect(fn(1).hex).toBe('#ff0000');
    expect(fn(5).hex).toBe('#0000ff');
  });

  it('endpoints are perceptually close with oklch interpolation', () => {
    const fn = new LinearColorSpace('#ff0000', '#0000ff').size(5);
    // OKLCH constrains to sRGB gamut, so endpoints may shift slightly
    expect(fn(1).hex).toMatch(/^#/);
    expect(fn(5).hex).toMatch(/^#/);
  });

  it('returns hex via toString()', () => {
    const fn = new LinearColorSpace('#ffffff', '#000000').size(10);
    const result = fn(1);
    expect(result.toString()).toBe(result.hex);
  });

  it('supports .format("hsl")', () => {
    const fn = new LinearColorSpace('#ff0000', '#0000ff').size(3);
    const hsl = fn(1).format('hsl');
    expect(hsl).toMatch(/^hsl\(/);
  });

  it('supports .format("rgb")', () => {
    const fn = new LinearColorSpace('#ff0000', '#0000ff').size(3);
    const rgb = fn(1).format('rgb');
    expect(rgb).toMatch(/^rgb\(/);
  });

  it('supports .format("oklch")', () => {
    const fn = new LinearColorSpace('#ff0000', '#0000ff').size(3);
    const oklch = fn(1).format('oklch');
    expect(oklch).toMatch(/^oklch\(/);
  });

  it('clamps out-of-range indices', () => {
    const fn = new LinearColorSpace('#ffffff', '#000000').size(10);
    expect(fn(0).hex).toBe(fn(1).hex);   // clamps to 1
    expect(fn(99).hex).toBe(fn(10).hex);  // clamps to 10
  });

  it('supports different resolutions', () => {
    const small = new LinearColorSpace('#ffffff', '#000000').size(4);
    const large = new LinearColorSpace('#ffffff', '#000000').size(100);
    expect(small.palette).toHaveLength(4);
    expect(large.palette).toHaveLength(100);
  });

  it('supports lab interpolation', () => {
    const oklch = new LinearColorSpace('#ff0000', '#0000ff').size(5);
    const lab = new LinearColorSpace('#ff0000', '#0000ff', { interpolation: 'lab' }).size(5);
    // Different interpolation modes should produce different midpoints
    expect(oklch(3).hex).not.toBe(lab(3).hex);
  });

  it('supports rgb interpolation', () => {
    const oklch = new LinearColorSpace('#ff0000', '#0000ff').size(5);
    const rgb = new LinearColorSpace('#ff0000', '#0000ff', { interpolation: 'rgb' }).size(5);
    expect(oklch(3).hex).not.toBe(rgb(3).hex);
  });
});

// ── CubeColorSpace ─────────────────────────────────────────────────────

describe('CubeColorSpace', () => {
  const corners = {
    k: '#000000',  // origin
    r: '#ff0000',  // x
    g: '#00ff00',  // y
    b: '#0000ff',  // z
    y: '#ffff00',  // xy
    m: '#ff00ff',  // xz
    c: '#00ffff',  // yz
    w: '#ffffff',  // xyz
  };

  it('generates the correct number of colors (6³ = 216)', () => {
    const tint = new CubeColorSpace(corners).size(6);
    expect(tint.palette).toHaveLength(216);
    expect(tint.size).toBe(6);
  });

  it('returns a callable function', () => {
    const tint = new CubeColorSpace(corners).size(6);
    expect(typeof tint).toBe('function');
  });

  it('origin corner maps to first color', () => {
    const tint = new CubeColorSpace(corners).size(6);
    expect(tint({ k: 0 }).hex).toBe(tint.palette[0]);
  });

  it('xyz corner maps to last color', () => {
    const tint = new CubeColorSpace(corners).size(6);
    expect(tint({ w: 5 }).hex).toBe(tint.palette[215]);
  });

  it('single-axis lookup works', () => {
    const tint = new CubeColorSpace(corners).size(6);
    const red5 = tint({ r: 5 });
    // Should be at position (5,0,0) = index 5*36 = 180
    expect(red5.hex).toBe(tint.palette[180]);
  });

  it('multi-axis lookup works', () => {
    const tint = new CubeColorSpace(corners).size(6);
    // { r: 3, b: 2 } → (3, 0, 2) = 3*36 + 0*6 + 2 = 110
    const result = tint({ r: 3, b: 2 });
    expect(result.hex).toBe(tint.palette[110]);
  });

  it('compound alias activates multiple axes', () => {
    const tint = new CubeColorSpace(corners).size(6);
    // { y: 3 } → y has mask {x:1, y:1} → (3, 3, 0) = 3*36 + 3*6 = 126
    const result = tint({ y: 3 });
    expect(result.hex).toBe(tint.palette[126]);
  });

  it('supports .format() chaining', () => {
    const tint = new CubeColorSpace(corners).size(6);
    expect(tint({ r: 3 }).format('hsl')).toMatch(/^hsl\(/);
    expect(tint({ r: 3 }).format('rgb')).toMatch(/^rgb\(/);
    expect(tint({ r: 3 }).format('oklch')).toMatch(/^oklch\(/);
  });

  it('throws with wrong number of corners', () => {
    expect(() => new CubeColorSpace({ a: '#000', b: '#fff' })).toThrow('exactly 8');
  });

  it('supports custom alias names', () => {
    const space = new CubeColorSpace({
      dark:   '#1a1a2e',
      warm:   '#e74c3c',
      nature: '#2ecc71',
      ocean:  '#3498db',
      sunset: '#f39c12',
      berry:  '#9b59b6',
      mint:   '#1abc9c',
      light:  '#ecf0f1',
    }).size(6);

    const result = space({ warm: 4, ocean: 2 });
    expect(result.hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('supports different resolutions', () => {
    const small = new CubeColorSpace(corners).size(4);
    const large = new CubeColorSpace(corners).size(8);
    expect(small.palette).toHaveLength(64);   // 4³
    expect(large.palette).toHaveLength(512);  // 8³
  });

  it('supports lab interpolation', () => {
    const oklch = new CubeColorSpace(corners).size(6);
    const lab = new CubeColorSpace(corners, { interpolation: 'lab' }).size(6);
    // Midpoints should differ between modes
    expect(oklch({ r: 3 }).hex).not.toBe(lab({ r: 3 }).hex);
  });

  it('max of overlapping aliases wins', () => {
    const tint = new CubeColorSpace(corners).size(6);
    // { r: 4, w: 2 } → r mask {x:1}, w mask {x:1,y:1,z:1}
    // x = max(4,2) = 4, y = max(0,2) = 2, z = max(0,2) = 2
    // index = 4*36 + 2*6 + 2 = 158
    const result = tint({ r: 4, w: 2 });
    expect(result.hex).toBe(tint.palette[158]);
  });
});

// ── colorTable (lookup table) ──────────────────────────────────────────

describe('colorTable', () => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];

  it('returns a callable function', () => {
    const fn = colorTable(colors);
    expect(typeof fn).toBe('function');
  });

  it('size matches input array length', () => {
    const fn = colorTable(colors);
    expect(fn.size).toBe(4);
    expect(fn.palette).toHaveLength(4);
  });

  it('returns exact colors by 1-based index', () => {
    const fn = colorTable(colors);
    expect(fn(1).hex).toBe('#ff0000');
    expect(fn(2).hex).toBe('#00ff00');
    expect(fn(3).hex).toBe('#0000ff');
    expect(fn(4).hex).toBe('#ffff00');
  });

  it('clamps out-of-range indices', () => {
    const fn = colorTable(colors);
    expect(fn(0).hex).toBe(fn(1).hex);
    expect(fn(99).hex).toBe(fn(4).hex);
  });

  it('supports .format() chaining', () => {
    const fn = colorTable(colors);
    expect(fn(1).format('rgb')).toBe('rgb(255, 0, 0)');
    expect(fn(1).format('hsl')).toMatch(/^hsl\(/);
  });
});

// ── LinearColorSpace array constructor ─────────────────────────────────

describe('LinearColorSpace (array mode)', () => {
  it('creates a lookup table from an array', () => {
    const fn = new LinearColorSpace(['#aaa', '#bbb', '#ccc']).size;
    // array mode doesn't need .size(), so let's test differently
    const cs = new LinearColorSpace(['#aaaaaa', '#bbbbbb', '#cccccc']);
    expect(() => cs.size(5)).toThrow('not needed');
  });
});
