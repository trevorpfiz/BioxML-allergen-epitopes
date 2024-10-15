import { z } from "zod";

export const MhcIFormSchema = z.object({
  sequence: z.string().min(1, {
    message: "PDB ID is required.",
  }),
  alleles: z.array(z.string()).min(1, {
    message: "Alleles are required.",
  }),
  tcrRecognitionProbabilityMethod: z.string().min(1, {
    message: "TCR Recognition Probability method is required.",
  }),
  mhcBindingAffinityMethod: z.string().min(1, {
    message: "MHC Binding Affinity method is required.",
  }),
  pmhcStabilityMethod: z.string().min(1, {
    message: "pMHC Stability method is required.",
  }),
});
export type MhcIForm = z.infer<typeof MhcIFormSchema>;

export const MhcIResultSchema = z.object({
  Peptide_Sequence: z.string(),
  ClassI_TCR_Recognition: z.number(),
  ClassI_MHC_Binding_Affinity: z.string(), // HLA types with corresponding binding affinity values
  ClassI_pMHC_Stability: z.string(), // HLA types with corresponding stability values
  Best_Binding_Affinity: z.string(), // Best binding affinity with HLA type
  Best_pMHC_Stability: z.string(), // Best pMHC stability with HLA type
});
export type MhcIResult = z.infer<typeof MhcIResultSchema>;
