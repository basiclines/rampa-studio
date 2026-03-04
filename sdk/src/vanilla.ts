/**
 * Vanilla JS entry point for rampa-sdk.
 * Builds as an IIFE that exposes `window.Rampa`.
 *
 * Usage:
 *   <script src="rampa-sdk.min.js"></script>
 *   <script>
 *     const result = Rampa.rampa('#3b82f6').size(5).generate();
 *   </script>
 */
import { rampa, color, RampaBuilder, ReadOnlyBuilder, LinearColorSpace, CubeColorSpace, PlaneColorSpace, ContrastBuilder } from './index';

const Rampa = {
  rampa,
  color,
  RampaBuilder,
  ReadOnlyBuilder,
  LinearColorSpace,
  CubeColorSpace,
  PlaneColorSpace,
  ContrastBuilder,
};

(globalThis as any).Rampa = Rampa;
