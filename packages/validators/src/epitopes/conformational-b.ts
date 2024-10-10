import { z } from "zod";

// Structure-based prediction

export const ConformationalBStructureFormSchema = z.object({
  pdbId: z.string().min(1, {
    message: "PDB ID is required.",
  }),
  chain: z.string().min(1, {
    message: "Chain is required.",
  }),
  bcrRecognitionProbabilityMethod: z.string().min(1, {
    message: "BCR Recognition Probability method is required.",
  }),
  surfaceAccessibilityMethod: z.string().min(1, {
    message: "Surface Accessibility method is required.",
  }),
});
export type ConformationalBStructureForm = z.infer<
  typeof ConformationalBStructureFormSchema
>;

export const ConformationalBStructureResultSchema = z.object({
  PDB_ID: z.string(),
  Chain: z.string().length(1),
  Residue_position: z.number().int().positive(),
  AA: z.string().length(1),
  Epitope_score: z.number(),
  N_glyco_label: z.number().int().min(0).max(1),
});
export type ConformationalBStructureResult = z.infer<
  typeof ConformationalBStructureResultSchema
>;

export const ConformationalBStructurePredictionSchema = z.object({
  pdbId: z.string(),
  chain: z.string(),
  results: z.array(ConformationalBStructureResultSchema),
  bcrRecognitionProbabilityMethod: z.string(),
  surfaceAccessibilityMethod: z.string(),
});
export type ConformationalBStructurePrediction = z.infer<
  typeof ConformationalBStructurePredictionSchema
>;
