import { promises as fs } from "fs";
import path from "path";

import type {
  ConformationalBSequencePrediction,
  ConformationalBSequenceResult,
} from "@epi/validators/epitopes";

import EpitopeViewer from "~/components/peptides/epitope-viewer";
import { createClient } from "~/utils/supabase/server";

export default async function ConformationalBSequenceBasedPredictionPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error ?? !data.user.id) {
    throw new Error("User not found");
  }

  // Load and parse CSV file
  const csvPath = path.join(
    process.cwd(),
    "src",
    "data",
    "AAK96887-sema-1d.csv",
  );
  const fileContents = await fs.readFile(csvPath, "utf8");

  // Parse CSV
  const rows = fileContents.split("\n").slice(1);
  const results: ConformationalBSequenceResult[] = rows
    .map((row) => {
      const [Seq_pos, AA, Epitope_score, N_glyco_label] = row.split(",");
      if (!Seq_pos || !AA || !Epitope_score || !N_glyco_label) {
        return null; // Skip incomplete rows
      }
      return {
        Seq_pos: parseInt(Seq_pos),
        AA,
        Epitope_score: parseFloat(Epitope_score),
        N_glyco_label: parseInt(N_glyco_label),
      };
    })
    .filter(
      (result): result is ConformationalBSequenceResult => result !== null,
    );

  // Construct the prediction object
  const prediction: ConformationalBSequencePrediction = {
    sequence: results.map((r) => r.AA).join(""),
    results: results,
  };

  return (
    <main>
      <div className="mx-auto flex w-full max-w-3xl">
        <EpitopeViewer prediction={prediction} />
      </div>
    </main>
  );
}
