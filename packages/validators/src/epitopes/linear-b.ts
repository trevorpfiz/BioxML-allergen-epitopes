import { z } from "zod";

export const LinearBFormSchema = z.object({
  sequence: z.string().min(1, {
    message: "Amino acid sequence is required.",
  }),
  bCellImmunogenicityMethod: z.string().optional(),
  bcrRecognitionProbabilityMethod: z.string().min(1, {
    message: "BCR Recognition Probability method is required.",
  }),
});
export type LinearBForm = z.infer<typeof LinearBFormSchema>;

export const LinearBResultSchema = z.object({
  Peptide_Sequence: z.string(),
  Linear_B_Cell_Immunogenicity: z.number().optional(),
  Linear_BCR_Recognition: z.number(),
});
export type LinearBResult = z.infer<typeof LinearBResultSchema>;
