export const EPITOPE_THRESHOLD = 0.51;

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

export const MHC_I_ALLELES = [
  "HLA-A*01:01",
  "HLA-A*02:01",
  "HLA-A*02:03",
  "HLA-A*02:06",
  "HLA-A*03:01",
  "HLA-A*11:01",
  "HLA-A*23:01",
  "HLA-A*24:02",
  "HLA-A*26:01",
  "HLA-A*30:01",
  "HLA-A*30:02",
  "HLA-A*31:01",
  "HLA-A*32:01",
  "HLA-A*33:01",
  "HLA-A*68:01",
  "HLA-A*68:02",

  "HLA-B*07:02",
  "HLA-B*08:01",
  "HLA-B*15:01",
  "HLA-B*35:01",
  "HLA-B*40:01",
  "HLA-B*44:02",
  "HLA-B*44:03",
  "HLA-B*51:01",
  "HLA-B*53:01",
  "HLA-B*57:01",
  "HLA-B*58:01",

  "HLA-C*04:01",
  "HLA-C*06:02",
  "HLA-C*07:01",
  "HLA-C*07:02",
  "HLA-C*15:02",
] as const;
export type MHCIAllele = (typeof MHC_I_ALLELES)[number];

export const MHC_II_ALLELES = [
  "HLA-DRB1*01:01",
  "HLA-DRB1*03:01",
  "HLA-DRB1*04:01",
  "HLA-DRB1*04:05",
  "HLA-DRB1*07:01",
  "HLA-DRB1*08:02",
  "HLA-DRB1*09:01",
  "HLA-DRB1*11:01",
  "HLA-DRB1*12:01",
  "HLA-DRB1*13:02",
  "HLA-DRB1*15:01",
  "HLA-DRB3*01:01",
  "HLA-DRB3*02:02",
  "HLA-DRB4*01:01",
  "HLA-DRB5*01:01",

  "HLA-DQA1*05:01/DQB1*02:01",
  "HLA-DQA1*05:01/DQB1*03:01",
  "HLA-DQA1*03:01/DQB1*03:02",
  "HLA-DQA1*04:01/DQB1*04:02",
  "HLA-DQA1*01:01/DQB1*05:01",
  "HLA-DQA1*01:02/DQB1*06:02",

  "HLA-DPA1*02:01/DPB1*01:01",
  "HLA-DPA1*01:03/DPB1*02:01",
  "HLA-DPA1*01:03/DPB1*04:01",
  "HLA-DPA1*03:01/DPB1*04:02",
  "HLA-DPA1*02:01/DPB1*05:01",
  "HLA-DPA1*02:01/DPB1*14:01",
] as const;
export type MHCIIAllele = (typeof MHC_II_ALLELES)[number];
