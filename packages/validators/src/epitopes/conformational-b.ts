import { z } from "zod";

// Sequence-based prediction

export const ConformationalBSequenceFormSchema = z.object({
  sequence: z.string().min(1, {
    message: "Amino acid sequence is required.",
  }),
});
export type ConformationalBSequenceForm = z.infer<
  typeof ConformationalBSequenceFormSchema
>;

export const ConformationalBSequenceResultSchema = z.object({
  Seq_pos: z.number().int().positive(),
  AA: z.string().length(1),
  Epitope_score: z.number(),
  N_glyco_label: z.number().int().min(0).max(1),
});
export type ConformationalBSequenceResult = z.infer<
  typeof ConformationalBSequenceResultSchema
>;

export const ConformationalBSequencePredictionSchema = z.object({
  sequence: z.string(),
  results: z.array(ConformationalBSequenceResultSchema),
});
export type ConformationalBSequencePrediction = z.infer<
  typeof ConformationalBSequencePredictionSchema
>;

// Structure-based prediction

export const ConformationalBStructureFormSchema = z.object({
  pdbId: z.string().min(1, {
    message: "PDB ID is required.",
  }),
  chain: z.string().min(1, {
    message: "Chain is required.",
  }),
  pdbFile: z.instanceof(File).optional(),
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
  sequence: z.string(),
  results: z.array(ConformationalBStructureResultSchema),
});
export type ConformationalBStructurePrediction = z.infer<
  typeof ConformationalBStructurePredictionSchema
>;

// Compare epitopes

export const ConformationalBCompareFormSchema = z.object({
  firstPdbId: z
    .string()
    .min(4, { message: "PDB ID must be at least 4 characters long" }),
  firstChain: z.string().optional(),
  firstPdbFile: z.instanceof(File).optional(),
  secondPdbId: z
    .string()
    .min(4, { message: "PDB ID must be at least 4 characters long" }),
  secondChain: z.string().optional(),
  secondPdbFile: z.instanceof(File).optional(),
});
export type ConformationalBCompareForm = z.infer<
  typeof ConformationalBCompareFormSchema
>;
