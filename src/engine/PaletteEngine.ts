import { rgbToOklch, oklchToHex } from './OklchMathEngine';

export interface RgbPixel { r: number; g: number; b: number }
export interface OklchPixel { l: number; c: number; h: number }

export interface FrequencyEntry {
  rgb: RgbPixel;
  oklch: OklchPixel;
  hex: string;
  count: number;
}

export interface PaletteEngineEntry {
  hex: string;
  oklch: OklchPixel;
  frequency: number; // 0-1
}

export type AnsiColorName = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

// ── Pixel Sampling ────────────────────────────────────────────

/**
 * Grid-based spatial stratification sampler.
 * Divides the image into a grid and samples one pixel per cell.
 * Skips fully transparent pixels.
 */
export function samplePixels(
  data: Uint8Array,
  width: number,
  height: number,
  sampleSize: number = 50000
): RgbPixel[] {
  const totalPixels = width * height;

  if (totalPixels <= sampleSize) {
    // Small image — use all pixels
    const pixels: RgbPixel[] = [];
    for (let i = 0; i < totalPixels; i++) {
      const offset = i * 4;
      if (data[offset + 3] < 128) continue; // skip transparent
      pixels.push({ r: data[offset], g: data[offset + 1], b: data[offset + 2] });
    }
    return pixels;
  }

  // Calculate grid dimensions
  const ratio = width / height;
  const cols = Math.round(Math.sqrt(sampleSize * ratio));
  const rows = Math.round(sampleSize / cols);
  const cellW = width / cols;
  const cellH = height / rows;

  const pixels: RgbPixel[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = Math.floor(col * cellW + cellW / 2);
      const y = Math.floor(row * cellH + cellH / 2);
      const idx = (y * width + x) * 4;
      if (data[idx + 3] < 128) continue;
      pixels.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
    }
  }
  return pixels;
}

// ── Frequency Map ─────────────────────────────────────────────

function rgbKey(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function buildFrequencyMap(pixels: RgbPixel[]): FrequencyEntry[] {
  const map = new Map<number, { r: number; g: number; b: number; count: number }>();

  for (const { r, g, b } of pixels) {
    const key = rgbKey(r, g, b);
    const entry = map.get(key);
    if (entry) {
      entry.count++;
    } else {
      map.set(key, { r, g, b, count: 1 });
    }
  }

  const entries: FrequencyEntry[] = [];
  for (const { r, g, b, count } of map.values()) {
    const [l, c, h] = rgbToOklch(r, g, b);
    entries.push({
      rgb: { r, g, b },
      oklch: { l, c, h: isNaN(h) ? 0 : h },
      hex: rgbToHex(r, g, b),
      count,
    });
  }

  entries.sort((a, b) => b.count - a.count);
  return entries;
}

// ── Raw Palette (deltaE dedup) ────────────────────────────────

function oklchDeltaE(a: OklchPixel, b: OklchPixel): number {
  // Approximate perceptual distance in OKLCH space
  // Weighted: L difference matters most, then chroma, then hue
  const dL = (a.l - b.l) * 100; // scale to 0-100 for deltaE-like range
  const dC = (a.c - b.c) * 100;
  const avgC = (a.c + b.c) / 2;
  // Hue difference in radians, weighted by chroma
  const dH_deg = Math.abs(a.h - b.h) > 180
    ? 360 - Math.abs(a.h - b.h)
    : Math.abs(a.h - b.h);
  const dH = (dH_deg / 360) * avgC * 200; // hue matters more at high chroma
  return Math.sqrt(dL * dL + dC * dC + dH * dH);
}

export function buildRawPalette(
  freqMap: FrequencyEntry[],
  tolerance: number = 2,
  maxColors: number = 1000
): PaletteEngineEntry[] {
  const totalCount = freqMap.reduce((sum, e) => sum + e.count, 0);
  const merged: { oklch: OklchPixel; hex: string; count: number }[] = [];

  for (const entry of freqMap) {
    let found = false;
    for (const m of merged) {
      if (oklchDeltaE(entry.oklch, m.oklch) < tolerance) {
        m.count += entry.count;
        // Keep the hex of whichever had more original pixels
        found = true;
        break;
      }
    }
    if (!found) {
      merged.push({ oklch: { ...entry.oklch }, hex: entry.hex, count: entry.count });
    }
    if (merged.length >= maxColors * 3) break; // early exit for very large maps
  }

  merged.sort((a, b) => b.count - a.count);
  const result = merged.slice(0, maxColors);

  return result.map(m => ({
    hex: m.hex,
    oklch: m.oklch,
    frequency: m.count / totalCount,
  }));
}

// ── K-Means Clustering (OKLCH space) ─────────────────────────

interface Centroid {
  l: number;
  c: number;
  hSin: number; // sin(hue) for circular mean
  hCos: number; // cos(hue) for circular mean
  totalWeight: number;
}

// k-means++ seeding: pick initial centroids maximizing distance between them
function kMeansPlusPlusInit(entries: PaletteEngineEntry[], k: number): OklchPixel[] {
  const centroids: OklchPixel[] = [];

  // First centroid: most frequent color
  centroids.push({ ...entries[0].oklch });

  // Remaining centroids: weighted by distance² to nearest existing centroid
  const distances = new Float64Array(entries.length).fill(Infinity);

  for (let ci = 1; ci < k; ci++) {
    // Update distances to nearest centroid
    for (let i = 0; i < entries.length; i++) {
      const d = oklchDeltaE(entries[i].oklch, centroids[ci - 1]);
      if (d < distances[i]) distances[i] = d;
    }

    // Weight by distance² × frequency for better spread
    let totalWeight = 0;
    for (let i = 0; i < entries.length; i++) {
      totalWeight += distances[i] * distances[i] * entries[i].frequency;
    }

    // Pick next centroid proportional to weighted distance²
    let threshold = Math.random() * totalWeight;
    let chosen = 0;
    for (let i = 0; i < entries.length; i++) {
      threshold -= distances[i] * distances[i] * entries[i].frequency;
      if (threshold <= 0) { chosen = i; break; }
    }

    centroids.push({ ...entries[chosen].oklch });
  }

  return centroids;
}

export function kMeansClustering(
  entries: PaletteEngineEntry[],
  count: number = 10,
  tolerance: number = 4,
  maxIterations: number = 20
): PaletteEngineEntry[] {
  if (entries.length <= count) return entries;

  const k = Math.min(count, entries.length);
  let centroids = kMeansPlusPlusInit(entries, k);

  const assignments = new Int32Array(entries.length);
  const totalFreq = entries.reduce((s, e) => s + e.frequency, 0);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // Assign each entry to nearest centroid
    for (let i = 0; i < entries.length; i++) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let j = 0; j < centroids.length; j++) {
        const d = oklchDeltaE(entries[i].oklch, centroids[j]);
        if (d < minDist) {
          minDist = d;
          minIdx = j;
        }
      }
      if (assignments[i] !== minIdx) {
        assignments[i] = minIdx;
        changed = true;
      }
    }

    if (!changed) break;

    // Recompute centroids as weighted mean
    const newCentroids: Centroid[] = Array.from({ length: k }, () => ({
      l: 0, c: 0, hSin: 0, hCos: 0, totalWeight: 0,
    }));

    for (let i = 0; i < entries.length; i++) {
      const ci = assignments[i];
      const w = entries[i].frequency;
      const e = entries[i].oklch;
      const hRad = (e.h * Math.PI) / 180;
      newCentroids[ci].l += e.l * w;
      newCentroids[ci].c += e.c * w;
      newCentroids[ci].hSin += Math.sin(hRad) * w;
      newCentroids[ci].hCos += Math.cos(hRad) * w;
      newCentroids[ci].totalWeight += w;
    }

    centroids = newCentroids.map(nc => {
      if (nc.totalWeight === 0) return { l: 0, c: 0, h: 0 };
      const h = ((Math.atan2(nc.hSin / nc.totalWeight, nc.hCos / nc.totalWeight) * 180) / Math.PI + 360) % 360;
      return {
        l: nc.l / nc.totalWeight,
        c: nc.c / nc.totalWeight,
        h,
      };
    });
  }

  // Build result: one entry per cluster
  const clusterFreqs = new Float64Array(k);
  for (let i = 0; i < entries.length; i++) {
    clusterFreqs[assignments[i]] += entries[i].frequency;
  }

  const result: PaletteEngineEntry[] = [];
  for (let j = 0; j < k; j++) {
    if (clusterFreqs[j] === 0) continue;
    const clamped = {
      l: Math.max(0, Math.min(1, centroids[j].l)),
      c: Math.max(0, centroids[j].c),
      h: centroids[j].h,
    };
    result.push({
      hex: oklchToHex(clamped.l, clamped.c, clamped.h),
      oklch: clamped,
      frequency: clusterFreqs[j] / totalFreq,
    });
  }

  result.sort((a, b) => b.frequency - a.frequency);

  // Post-merge: collapse clusters closer than tolerance deltaE
  const merged: PaletteEngineEntry[] = [];
  for (const entry of result) {
    let wasMerged = false;
    for (const m of merged) {
      if (oklchDeltaE(entry.oklch, m.oklch) < tolerance) {
        m.frequency += entry.frequency;
        wasMerged = true;
        break;
      }
    }
    if (!wasMerged) merged.push({ ...entry });
  }

  return merged;
}

// ── ANSI Classification ──────────────────────────────────────

export function classifyAnsi(oklch: OklchPixel): AnsiColorName {
  const { l, c, h } = oklch;

  // Achromatic: low chroma
  if (c < 0.03) {
    if (l < 0.25) return 'black';
    if (l > 0.75) return 'white';
    return l < 0.5 ? 'black' : 'white';
  }

  // Dark colors with some chroma
  if (l < 0.15) return 'black';
  if (l > 0.85 && c < 0.05) return 'white';

  // Chromatic: classify by hue
  if (h >= 330 || h < 30) return 'red';
  if (h >= 30 && h < 60) return 'yellow'; // orange-ish → yellow
  if (h >= 60 && h < 90) return 'yellow';
  if (h >= 90 && h < 170) return 'green';
  if (h >= 170 && h < 210) return 'cyan';
  if (h >= 210 && h < 270) return 'blue';
  if (h >= 270 && h < 330) return 'magenta';

  return 'white'; // fallback
}

export function buildAnsiPalette(
  entries: PaletteEngineEntry[],
  countPerCategory: number = 5,
  tolerance: number = 4
): Record<AnsiColorName, PaletteEngineEntry[]> {
  const buckets: Record<AnsiColorName, PaletteEngineEntry[]> = {
    black: [], red: [], green: [], yellow: [],
    blue: [], magenta: [], cyan: [], white: [],
  };

  for (const entry of entries) {
    const name = classifyAnsi(entry.oklch);
    const bucket = buckets[name];
    if (bucket.length >= countPerCategory) continue;

    // Skip if too close to an existing entry in this bucket
    const tooClose = bucket.some(b => oklchDeltaE(entry.oklch, b.oklch) < tolerance);
    if (tooClose) continue;

    bucket.push(entry);
  }

  // Sort each bucket by frequency descending
  for (const key of Object.keys(buckets) as AnsiColorName[]) {
    buckets[key].sort((a, b) => b.frequency - a.frequency);
  }

  return buckets;
}

// ── Average Color ────────────────────────────────────────────

export function computeAverage(entries: PaletteEngineEntry[]): OklchPixel {
  let totalW = 0;
  let sumL = 0;
  let sumC = 0;
  let sumSin = 0;
  let sumCos = 0;

  for (const e of entries) {
    const w = e.frequency;
    sumL += e.oklch.l * w;
    sumC += e.oklch.c * w;
    const hRad = (e.oklch.h * Math.PI) / 180;
    sumSin += Math.sin(hRad) * w;
    sumCos += Math.cos(hRad) * w;
    totalW += w;
  }

  if (totalW === 0) return { l: 0, c: 0, h: 0 };

  const h = ((Math.atan2(sumSin / totalW, sumCos / totalW) * 180) / Math.PI + 360) % 360;
  return {
    l: sumL / totalW,
    c: sumC / totalW,
    h,
  };
}

// ── Temperature ──────────────────────────────────────────────

export function classifyTemperature(entries: PaletteEngineEntry[]): 'warm' | 'cool' | 'neutral' {
  let warmWeight = 0;
  let coolWeight = 0;
  let neutralWeight = 0;

  for (const e of entries) {
    const { h, c } = e.oklch;
    const w = e.frequency;

    if (c < 0.03) {
      neutralWeight += w;
      continue;
    }

    // Warm hues: red, orange, yellow (roughly 0-90, 330-360)
    if ((h >= 330 || h < 90)) {
      warmWeight += w;
    }
    // Cool hues: green, cyan, blue (roughly 90-270)
    else if (h >= 90 && h < 270) {
      coolWeight += w;
    }
    // Magenta is mixed — slightly warm
    else {
      warmWeight += w * 0.6;
      coolWeight += w * 0.4;
    }
  }

  const total = warmWeight + coolWeight + neutralWeight;
  if (total === 0) return 'neutral';

  const warmRatio = warmWeight / total;
  const coolRatio = coolWeight / total;

  if (Math.abs(warmRatio - coolRatio) < 0.1) return 'neutral';
  return warmRatio > coolRatio ? 'warm' : 'cool';
}
