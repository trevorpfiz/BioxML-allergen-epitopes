import { promises as fs } from "fs";
import path from "path";

import type { SimilarityData } from "~/components/peptides/tables/similarity-columns";
import type { EpitopeData } from "~/types";
import CompareEpitopes from "~/components/peptides/compare-epitopes";
import { columns } from "~/components/peptides/tables/similarity-columns";
import { SimilarityDataTable } from "~/components/peptides/tables/similarity-data-table";

export default async function CompareResultPage() {
  // Define the paths to your CSV files
  const similarityCSVPath = path.join(
    process.cwd(),
    "src",
    "data",
    "7b3o_E_7lm9_A_SEMA2_similarity_score.csv",
  );

  const epitopeCSVPath1 = path.join(
    process.cwd(),
    "src",
    "data",
    "7b3o_E_SEMA2_epitopes_score.csv",
  );

  const epitopeCSVPath2 = path.join(
    process.cwd(),
    "src",
    "data",
    "7lm9_A_SEMA2_epitopes_score.csv",
  );

  // Read the CSV files
  const [similarityFile, epitopeFile1, epitopeFile2] = await Promise.all([
    fs.readFile(similarityCSVPath, "utf8"),
    fs.readFile(epitopeCSVPath1, "utf8"),
    fs.readFile(epitopeCSVPath2, "utf8"),
  ]);

  /**
   * Step 1: Parse the Similarity CSV
   */
  const similarityRows = similarityFile.split("\n").slice(1); // Skip header row
  const similarityData: SimilarityData[] = similarityRows
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

  /**
   * Step 2: Parse Epitope CSVs
   */
  const parseEpitopeCSV = (csv: string): EpitopeData[] => {
    const rows = csv.split("\n").slice(1); // Skip header
    return rows
      .map((row) => {
        const [PDB_ID, Chain, Residue_position, AA, Epitope_score] =
          row.split(",");

        if (
          !PDB_ID ||
          !Chain ||
          !Residue_position ||
          !AA ||
          Epitope_score === undefined
        ) {
          return null; // Skip incomplete rows
        }

        return {
          PDB_ID,
          Chain,
          Residue_position: parseInt(Residue_position, 10),
          AA,
          Epitope_score: parseFloat(Epitope_score),
        };
      })
      .filter((result): result is EpitopeData => result !== null);
  };

  const epitopeData1: EpitopeData[] = parseEpitopeCSV(epitopeFile1);
  const epitopeData2: EpitopeData[] = parseEpitopeCSV(epitopeFile2);

  return (
    <main className="container flex w-full flex-col gap-8 pb-48">
      <h1 className="text-3xl font-bold">Protein Structure Comparison</h1>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <CompareEpitopes
            pdbId1="7b3o"
            pdbId2="7lm9"
            similarityData={similarityData}
            epitopeData1={epitopeData1}
            epitopeData2={epitopeData2}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Similarity Table</h2>
        <SimilarityDataTable columns={columns} data={similarityData} />
      </div>
    </main>
  );
}
