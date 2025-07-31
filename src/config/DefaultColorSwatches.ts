// Default color swatches for color pickers
// These match the colors used in popular color pickers like Sketch

export const DEFAULT_HEX_SWATCHES = [
  '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321',
  '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2',
  '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF'
];

export const DEFAULT_OKLCH_SWATCHES = [
  'oklch(0.55 0.22 27)',    // Red #D0021B
  'oklch(0.75 0.15 70)',    // Orange #F5A623  
  'oklch(0.87 0.16 100)',   // Yellow #F8E71C
  'oklch(0.45 0.08 60)',    // Brown #8B572A
  'oklch(0.79 0.20 130)',   // Green #7ED321
  'oklch(0.42 0.12 135)',   // Dark Green #417505
  'oklch(0.60 0.25 320)',   // Magenta #BD10E0
  'oklch(0.55 0.25 290)',   // Purple #9013FE
  'oklch(0.62 0.15 250)',   // Blue #4A90E2
  'oklch(0.82 0.15 180)',   // Cyan #50E3C2
  'oklch(0.86 0.10 130)',   // Light Green #B8E986
  'oklch(0.00 0.00 0)',     // Black #000000
  'oklch(0.35 0.00 0)',     // Dark Gray #4A4A4A
  'oklch(0.66 0.00 0)',     // Light Gray #9B9B9B
  'oklch(1.00 0.00 0)'      // White #FFFFFF
];

export const DefaultColorSwatches = {
  hex: DEFAULT_HEX_SWATCHES,
  oklch: DEFAULT_OKLCH_SWATCHES
};