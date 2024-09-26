export const EPITOPE_THRESHOLD = 0.361;

// Define RGB colors for different epitope score ranges
export const EPITOPE_COLORS_LIGHT = {
  low: [218, 165, 96], // Yellow-orange
  mid: [230, 230, 230], // Off-white
  high: [64, 230, 180], // Blue-green
};
export type EpitopeColors = typeof EPITOPE_COLORS_LIGHT;

export const EPITOPE_COLORS_DARK = {
  low: [100, 149, 237], // Steel Blue
  mid: [40, 40, 40], // Off-dark
  high: [255, 140, 64], // Bright Orange
};
