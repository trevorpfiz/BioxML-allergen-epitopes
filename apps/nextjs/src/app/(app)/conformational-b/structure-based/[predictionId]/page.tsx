import { promises as fs } from "fs";
import path from "path";
import dynamic from "next/dynamic";

import type {
  ConformationalBStructurePrediction,
  ConformationalBStructureResult,
} from "@epi/validators/epitopes";

import EpitopeViewer from "~/components/peptides/epitope-viewer";
import { createClient } from "~/utils/supabase/server";

const MoleculeViewer = dynamic(
  () => import("../../../../../components/peptides/molecule-viewer"),
  {
    ssr: false,
  },
);

export default async function ConformationalBStructureBasedPredictionPage() {
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
    "3ob4_A_epitopes_score.csv",
  );
  const fileContents = await fs.readFile(csvPath, "utf8");

  // Parse CSV
  const rows = fileContents.split("\n").slice(1);
  const results: ConformationalBStructureResult[] = rows
    .map((row) => {
      const [
        PDB_ID,
        Chain,
        Residue_position,
        AA,
        Epitope_score,
        N_glyco_label,
      ] = row.split(",");
      if (
        !PDB_ID ||
        !Chain ||
        !Residue_position ||
        !AA ||
        !Epitope_score ||
        !N_glyco_label
      ) {
        return null; // Skip incomplete rows
      }
      return {
        PDB_ID,
        Chain,
        Residue_position: parseInt(Residue_position),
        AA,
        Epitope_score: parseFloat(Epitope_score),
        N_glyco_label: parseInt(N_glyco_label),
      };
    })
    .filter(
      (result): result is ConformationalBStructureResult => result !== null,
    );

  // Construct the prediction object
  const prediction: ConformationalBStructurePrediction = {
    sequence: results.map((r) => r.AA).join(""),
    results: results,
  };

  return (
    <main>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-16">
        <EpitopeViewer prediction={prediction} />

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold">3D Visualization</h3>
          <div className="w-full border shadow">
            <MoleculeViewer epitopeData={prediction.results} />
          </div>
        </div>
      </div>
    </main>
  );
}
