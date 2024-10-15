import { z } from "zod";

// Sequence-based and Structure-based prediction

export const ConformationalBFormSchema = z
  .object({
    sequence: z.string().optional(),
    pdbId: z.string().optional(),
    chain: z.string().optional(),
    bcrRecognitionProbabilityMethod: z
      .string()
      .min(1, { message: "BCR Recognition Probability method is required." }),
    surfaceAccessibilityMethod: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasSequence = Boolean(data.sequence);
      const hasPDB = Boolean(data.pdbId);
      return (hasSequence && !hasPDB) || (!hasSequence && hasPDB);
    },
    {
      message: "Provide either a sequence OR a PDB ID",
      path: ["sequence"], // Display error on the sequence field
    },
  );

export type ConformationalBForm = z.infer<typeof ConformationalBFormSchema>;

export const ConformationalBResultSchema = z.object({
  PDB_ID: z.string().optional(),
  Chain: z.string().optional(),
  Residue_position: z.number().int().positive(),
  AA: z.string().length(1),
  Epitope_score: z.number(),
  N_glyco_label: z.number().int().min(0).max(1),
  Hydrophilicity: z.number().optional(), // fix
  Charge: z.number().optional(), // fix
  // 3D-specific fields
  ASA: z.number().optional(),
  RSA: z.number().optional(),
  B_Factor: z.number().optional(),
});
export type ConformationalBResult = z.infer<typeof ConformationalBResultSchema>;
