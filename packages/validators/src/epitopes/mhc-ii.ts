import { z } from "zod";

export const MhcIIFormSchema = z.object({
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
    message: "PMHC Stability method is required.",
  }),
});
export type MhcIIForm = z.infer<typeof MhcIIFormSchema>;
