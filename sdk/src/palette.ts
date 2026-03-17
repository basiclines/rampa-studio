import { decodeImage } from '../../src/engine/ImageDecoder';
import {
  samplePixels,
  buildFrequencyMap,
  buildRawPalette,
  kMeansClustering,
  buildAnsiPalette,
  buildGroupPalette,
  getDefaultBuckets,
  computeAverage,
  classifyTemperature,
  type PaletteEngineEntry,
  type AnsiColorName,
  type GroupByProperty,
  type GroupBucket,
} from '../../src/engine/PaletteEngine';
import { oklchToHex } from '../../src/engine/OklchMathEngine';
import { createColor } from './color-result';
import type { Color, RampaOutputFormat } from './types';

export interface PaletteEntry {
  color: Color;
  frequency: number;
}

export interface PaletteOptions {
  /** Number of pixels to sample (default: 50000) */
  sampleSize?: number;
}

export interface RawOptions {
  /** DeltaE tolerance for merging near-duplicates (default: 2) */
  tolerance?: number;
  /** Maximum colors to return (default: 1000) */
  maxColors?: number;
}

export interface DominantOptions {
  /** Number of dominant colors to return (default: 10) */
  count?: number;
  /** DeltaE tolerance for clustering radius (default: 4) */
  tolerance?: number;
}

export interface AnsiOptions {
  /** Max colors per ANSI category (default: 5) */
  count?: number;
  /** DeltaE tolerance for dedup within each category (default: 4) */
  tolerance?: number;
}

export interface GroupOptions {
  /** OKLCH property to group by */
  by: GroupByProperty;
  /** Max colors per bucket (default: 5) */
  count?: number;
  /** DeltaE tolerance for dedup within each bucket (default: 4) */
  tolerance?: number;
  /** Custom bucket boundaries (overrides defaults) */
  buckets?: GroupBucket[];
}

export type SortField = 'frequency' | 'L' | 'C' | 'H';

export interface SortablePaletteEntries extends Array<PaletteEntry> {
  sortBy(field: SortField): SortablePaletteEntries;
}

export interface SortablePaletteGroups extends Record<string, PaletteEntry[]> {
  sortBy(field: SortField): SortablePaletteGroups;
}

export interface PaletteResult {
  /** All unique colors, most frequent first, near-duplicates merged */
  raw(options?: RawOptions): SortablePaletteEntries;
  /** Top N dominant color groups via k-means clustering */
  dominant(options?: DominantOptions): SortablePaletteEntries;
  /** Shortcut into dominant results (0-based index) */
  at(index: number): PaletteEntry;
  /** Colors classified into ANSI categories */
  ansi(options?: AnsiOptions): SortablePaletteGroups;
  /** Colors grouped by OKLCH property (L, C, or H) */
  group(options: GroupOptions): SortablePaletteGroups;
  /** Weighted average color of the image */
  average(): Color;
  /** Overall color temperature */
  temperature(): 'warm' | 'cool' | 'neutral';
  /** Export as json, css, or text */
  output(format: RampaOutputFormat, prefix?: string): string;
}

function sortEntriesByField(entries: PaletteEntry[], field: SortField): PaletteEntry[] {
  const sorted = [...entries];
  switch (field) {
    case 'L': return sorted.sort((a, b) => a.color.oklch.l - b.color.oklch.l);
    case 'C': return sorted.sort((a, b) => a.color.oklch.c - b.color.oklch.c);
    case 'H': return sorted.sort((a, b) => a.color.oklch.h - b.color.oklch.h);
    default: return sorted.sort((a, b) => b.frequency - a.frequency);
  }
}

function makeSortableEntries(entries: PaletteEntry[]): SortablePaletteEntries {
  const arr = [...entries] as SortablePaletteEntries;
  Object.defineProperty(arr, 'sortBy', {
    enumerable: false,
    value(field: SortField): SortablePaletteEntries {
      return makeSortableEntries(sortEntriesByField(arr, field));
    },
  });
  return arr;
}

function makeSortableGroups(groups: Record<string, PaletteEntry[]>): SortablePaletteGroups {
  const result = { ...groups } as SortablePaletteGroups;
  Object.defineProperty(result, 'sortBy', {
    enumerable: false,
    value(field: SortField): SortablePaletteGroups {
      const sorted: Record<string, PaletteEntry[]> = {};
      for (const [key, entries] of Object.entries(result)) {
        sorted[key] = sortEntriesByField(entries, field);
      }
      return makeSortableGroups(sorted);
    },
  });
  return result;
}

function engineToEntry(e: PaletteEngineEntry): PaletteEntry {
  return { color: createColor(e.hex), frequency: e.frequency };
}

function engineArrayToEntries(arr: PaletteEngineEntry[]): PaletteEntry[] {
  return arr.map(engineToEntry);
}

export async function palette(filePath: string, options?: PaletteOptions): Promise<PaletteResult> {
  const { sampleSize = 50000 } = options || {};

  const image = decodeImage(filePath);
  const pixels = samplePixels(image.data, image.width, image.height, sampleSize);
  const freqMap = buildFrequencyMap(pixels);

  // Cache results for repeated calls with same options
  let cachedRaw: Map<string, SortablePaletteEntries> = new Map();
  let cachedDominant: Map<string, SortablePaletteEntries> = new Map();
  let cachedAnsi: Map<string, SortablePaletteGroups> = new Map();
  let cachedGroup: Map<string, SortablePaletteGroups> = new Map();
  let cachedAverage: Color | null = null;
  let cachedTemp: string | null = null;

  const result: PaletteResult = {
    raw(opts?: RawOptions): SortablePaletteEntries {
      const key = JSON.stringify(opts || {});
      if (cachedRaw.has(key)) return cachedRaw.get(key)!;
      const raw = buildRawPalette(freqMap, opts?.tolerance, opts?.maxColors);
      const entries = makeSortableEntries(engineArrayToEntries(raw));
      cachedRaw.set(key, entries);
      return entries;
    },

    dominant(opts?: DominantOptions): SortablePaletteEntries {
      const key = JSON.stringify(opts || {});
      if (cachedDominant.has(key)) return cachedDominant.get(key)!;
      const raw = buildRawPalette(freqMap, 2, 1000);
      const clusters = kMeansClustering(raw, opts?.count, opts?.tolerance);
      const entries = makeSortableEntries(engineArrayToEntries(clusters));
      cachedDominant.set(key, entries);
      return entries;
    },

    at(index: number): PaletteEntry {
      const dom = result.dominant();
      if (index < 0 || index >= dom.length) {
        throw new RangeError(`Index ${index} out of range (0-${dom.length - 1})`);
      }
      return dom[index];
    },

    ansi(opts?: AnsiOptions): SortablePaletteGroups {
      const key = JSON.stringify(opts || {});
      if (cachedAnsi.has(key)) return cachedAnsi.get(key)!;
      const raw = buildRawPalette(freqMap, 2, 1000);
      const ansiMap = buildAnsiPalette(raw, opts?.count, opts?.tolerance);
      const entries: Record<string, PaletteEntry[]> = {};
      for (const [name, arr] of Object.entries(ansiMap)) {
        entries[name] = engineArrayToEntries(arr);
      }
      const sortable = makeSortableGroups(entries);
      cachedAnsi.set(key, sortable);
      return sortable;
    },

    group(opts: GroupOptions): SortablePaletteGroups {
      const key = JSON.stringify(opts);
      if (cachedGroup.has(key)) return cachedGroup.get(key)!;
      const raw = buildRawPalette(freqMap, 2, 1000);
      const buckets = opts.buckets || getDefaultBuckets(opts.by);
      const grouped = buildGroupPalette(raw, opts.by, buckets, opts.count, opts.tolerance);
      const entries: Record<string, PaletteEntry[]> = {};
      for (const [name, arr] of Object.entries(grouped)) {
        entries[name] = engineArrayToEntries(arr);
      }
      const sortable = makeSortableGroups(entries);
      cachedGroup.set(key, sortable);
      return sortable;
    },

    average(): Color {
      if (cachedAverage) return cachedAverage;
      const raw = buildRawPalette(freqMap, 2, 1000);
      const avg = computeAverage(raw);
      const hex = oklchToHex(avg.l, avg.c, avg.h);
      cachedAverage = createColor(hex);
      return cachedAverage;
    },

    temperature(): 'warm' | 'cool' | 'neutral' {
      if (cachedTemp) return cachedTemp as any;
      const raw = buildRawPalette(freqMap, 2, 1000);
      cachedTemp = classifyTemperature(raw);
      return cachedTemp as any;
    },

    output(format: RampaOutputFormat, prefix: string = 'palette'): string {
      const dom = result.dominant();
      const avg = result.average();
      const temp = result.temperature();
      const ansiData = result.ansi();

      if (format === 'json') {
        return JSON.stringify({
          dominant: dom.map(d => ({
            hex: d.color.hex,
            oklch: d.color.oklch,
            frequency: Math.round(d.frequency * 10000) / 10000,
          })),
          average: { hex: avg.hex, oklch: avg.oklch },
          temperature: temp,
          ansi: Object.fromEntries(
            Object.entries(ansiData).map(([name, entries]) => [
              name,
              entries.map(e => ({
                hex: e.color.hex,
                frequency: Math.round(e.frequency * 10000) / 10000,
              })),
            ])
          ),
        }, null, 2);
      }

      if (format === 'css') {
        const lines = [':root {'];
        dom.forEach((d, i) => {
          lines.push(`  --${prefix}-${i + 1}: ${d.color.hex};`);
        });
        lines.push(`  --${prefix}-avg: ${avg.hex};`);
        lines.push('}');
        return lines.join('\n');
      }

      // text format
      const lines: string[] = [];
      lines.push('Dominant colors:');
      dom.forEach((d, i) => {
        const pct = (d.frequency * 100).toFixed(1);
        lines.push(`  ${i + 1}. ${d.color.hex}  ${pct}%`);
      });
      lines.push(`\nAverage: ${avg.hex}`);
      lines.push(`Temperature: ${temp}`);
      return lines.join('\n');
    },
  };

  return result;
}
