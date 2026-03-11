/**
 * Vanilla JS entry point for rampa-sdk.
 * Builds as an IIFE that exposes `globalThis.Rampa` (e.g. `window.Rampa` in browsers).
 *
 * Usage:
 *   <script src="rampa-sdk.min.js"></script>
 *   <script>
 *     const palette = Rampa.rampa('#3b82f6').size(5);
 *     console.log('' + palette(1));
 *   </script>
 */
import { rampa, color, RampaBuilder, createRampaFn, ReadOnlyBuilder, LinearColorSpace, CubeColorSpace, PlaneColorSpace, ContrastBuilder } from './index';

const Rampa = {
  rampa,
  color,
  RampaBuilder,
  createRampaFn,
  ReadOnlyBuilder,
  LinearColorSpace,
  CubeColorSpace,
  PlaneColorSpace,
  ContrastBuilder,
};

(globalThis as any).Rampa = Rampa;
