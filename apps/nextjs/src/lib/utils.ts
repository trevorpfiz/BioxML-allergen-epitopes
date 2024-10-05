import type { User } from "@supabase/supabase-js";

import type { EpitopeColors } from "~/lib/constants";
import { EPITOPE_THRESHOLD } from "~/lib/constants";

export function getNameFromUser(user: User) {
  const meta = user.user_metadata;
  if (typeof meta.name === "string") return meta.name;
  if (typeof meta.full_name === "string") return meta.full_name;
  if (typeof meta.user_name === "string") return meta.user_name;
  return "Guest User";
}

/**
 * Linearly interpolates between two colors.
 * @param {number[]} color1 - First color as [r, g, b].
 * @param {number[]} color2 - Second color as [r, g, b].
 * @param {number} factor - Interpolation factor (0 to 1).
 * @returns {number[]} - Interpolated color as [r, g, b].
 */
export const interpolateColors = (
  color1: number[],
  color2: number[],
  factor: number,
) => {
  const r = Math.round(
    (color1[0] ?? 0) + factor * ((color2[0] ?? 0) - (color1[0] ?? 0)),
  );
  const g = Math.round(
    (color1[1] ?? 0) + factor * ((color2[1] ?? 0) - (color1[1] ?? 0)),
  );
  const b = Math.round(
    (color1[2] ?? 0) + factor * ((color2[2] ?? 0) - (color1[2] ?? 0)),
  );
  return [r, g, b];
};

/**
 * Converts an RGB array to a hexadecimal number.
 * @param {number[]} rgb - Color as [r, g, b].
 * @returns {number} - Hexadecimal color.
 */
export const rgbToHex = (rgb: number[]) => {
  const r = rgb[0] ?? 0;
  const g = rgb[1] ?? 0;
  const b = rgb[2] ?? 0;
  return (r << 16) | (g << 8) | b;
};

/**
 * Assigns an interpolated color based on the epitope score.
 * @param {EpitopeColors} colors - The color scheme (light or dark).
 * @param {number} score - The epitope score.
 * @param {number} minScore - Minimum epitope score.
 * @param {number} maxScore - Maximum epitope score.
 * @returns {number} - Hexadecimal color.
 */
export const getColorFromScore = (
  colors: EpitopeColors,
  score: number,
  minScore: number,
  maxScore: number,
): number => {
  // Normalize the score between 0 and 1
  const normalizedScore = (score - minScore) / (maxScore - minScore);

  // Determine the interpolation phase
  if (normalizedScore < EPITOPE_THRESHOLD) {
    // Interpolate between low and mid
    const factor = normalizedScore / EPITOPE_THRESHOLD;
    const interpolatedColor = interpolateColors(colors.low, colors.mid, factor);
    return rgbToHex(interpolatedColor);
  } else {
    // Interpolate between mid and high
    const factor =
      (normalizedScore - EPITOPE_THRESHOLD) / (1 - EPITOPE_THRESHOLD);
    const interpolatedColor = interpolateColors(
      colors.mid,
      colors.high,
      factor,
    );
    return rgbToHex(interpolatedColor);
  }
};
