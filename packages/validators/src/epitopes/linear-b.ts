import { z } from "zod";

export const LinearBFormSchema = z.object({
  sequence: z.string().min(1, {
    message: "Amino acid sequence is required.",
  }),
});
export type LinearBForm = z.infer<typeof LinearBFormSchema>;

export const LinearBResultSchema = z.object({
  Seq_pos: z.number().int().positive(),
  AA: z.string().length(1),
  Epitope_score: z.number(),
  N_glyco_label: z.number().int().min(0).max(1),
});
export type LinearBResult = z.infer<typeof LinearBResultSchema>;

export const LinearBPredictionSchema = z.object({
  sequence: z.string(),
  results: z.array(LinearBResultSchema),
});
export type LinearBPrediction = z.infer<typeof LinearBPredictionSchema>;
