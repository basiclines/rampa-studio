export const HARMONY_TYPES = [
  'complementary',
  'triadic',
  'analogous',
  'split-complementary',
  'square',
  'compound',
] as const;

export type HarmonyType = (typeof HARMONY_TYPES)[number];

export function isValidHarmonyType(value: string): value is HarmonyType {
  return HARMONY_TYPES.includes(value as HarmonyType);
}

export function getHarmonyTypesHelp(): string {
  return HARMONY_TYPES.join(', ');
}

// Maps harmony type to number of extra ramps generated
export const HARMONY_RAMP_COUNT: Record<HarmonyType, number> = {
  'complementary': 1,       // +180°
  'triadic': 2,             // +120°, +240°
  'analogous': 2,           // +30°, +60°
  'split-complementary': 2, // +150°, +210°
  'square': 3,              // +90°, +180°, +270°
  'compound': 3,            // +180°, +150°, +210°
};
