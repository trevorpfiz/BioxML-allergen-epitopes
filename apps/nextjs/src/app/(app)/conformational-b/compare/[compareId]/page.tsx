// app/compare-result/page.tsx

import { promises as fs } from "fs";
import path from "path";
import dynamic from "next/dynamic";

import type { SimilarityData } from "~/components/peptides/tables/similarity-columns";
import { columns } from "~/components/peptides/tables/similarity-columns";
import { SimilarityDataTable } from "~/components/peptides/tables/similarity-data-table";

// Dynamically import the molecule viewer to ensure it's a client component
const BasicMoleculeViewer = dynamic(
  () => import("~/components/peptides/3Dmol/basic-viewer"),
  { ssr: false },
);

export default async function CompareResultPage() {
  // Define the path to your CSV file
  const csvPath = path.join(
    process.cwd(),
    "src",
    "data",
    "7b3o_E_7lm9_A_SEMA2_similarity_score.csv",
  );

  // Read the CSV file
  const fileContents = await fs.readFile(csvPath, "utf8");

  // Parse the CSV
  const rows = fileContents.split("\n").slice(1); // Skip header row
  const data: SimilarityData[] = rows
    .map((row) => {
      const [
        PDB_ID_1,
        aa_1,
        chain_1,
        pos_1,
        PDB_ID_2,
        aa_2,
        chain_2,
        pos_2,
        score,
      ] = row.split(",");

      if (
        !PDB_ID_1 ||
        !aa_1 ||
        !chain_1 ||
        !pos_1 ||
        !PDB_ID_2 ||
        !aa_2 ||
        !chain_2 ||
        !pos_2 ||
        !score
      ) {
        return null; // Skip incomplete rows
      }

      return {
        PDB_ID_1,
        aa_1,
        chain_1,
        pos_1: parseInt(pos_1, 10),
        PDB_ID_2,
        aa_2,
        chain_2,
        pos_2: parseInt(pos_2, 10),
        score: parseFloat(score),
      };
    })
    .filter((result): result is SimilarityData => result !== null); // Type guard

  return (
    <main className="container flex w-full flex-col gap-8 pb-48">
      <h1 className="text-3xl font-bold">Protein Structure Comparison</h1>

      <div className="flex w-full flex-col gap-8 md:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-xl font-semibold">7B3O</h2>
          <div className="min-h-[402px] w-full border shadow">
            <BasicMoleculeViewer pdbId="7B3O" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-xl font-semibold">7LM9</h2>
          <div className="min-h-[402px] w-full border shadow">
            <BasicMoleculeViewer pdbId="7LM9" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Similarity Table</h2>
        <SimilarityDataTable columns={columns} data={data} />
      </div>
    </main>
  );
}
