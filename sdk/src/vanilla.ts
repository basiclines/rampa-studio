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
import { rampa, color, lint, RampaBuilder, createRampaFn, LintBuilder, LinearColorSpace, CubeColorSpace, PlaneColorSpace } from './index';

const Rampa = {
  rampa,
  color,
  lint,
  RampaBuilder,
  createRampaFn,
  LintBuilder,
  LinearColorSpace,
  CubeColorSpace,
  PlaneColorSpace,
};

(globalThis as any).Rampa = Rampa;
