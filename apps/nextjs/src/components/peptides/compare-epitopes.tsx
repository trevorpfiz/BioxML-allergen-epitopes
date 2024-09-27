import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MoleculeViewer = dynamic(
  () => import("~/components/peptides/3Dmol/conformational-viewer"),
  {
    ssr: false,
  },
);

interface EpitopeData {
  PDB_ID: string;
  Chain: string;
  Residue_position: number;
  AA: string;
  Epitope_score: number;
  N_glyco_label: number;
}

const CompareEpitopes: React.FC = () => {
  const [epitopeData1, setEpitopeData1] = useState<EpitopeData[]>([]);
  const [epitopeData2, setEpitopeData2] = useState<EpitopeData[]>([]);
  const [similarityMap, setSimilarityMap] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    // Replace with actual data fetching logic
    const fetchEpitopeData = async () => {
      // Example data for structure 1
      const data1: EpitopeData[] = [
        {
          PDB_ID: "3OB4",
          Chain: "A",
          Residue_position: 50,
          AA: "A",
          Epitope_score: 3.0,
          N_glyco_label: 1,
        },
        {
          PDB_ID: "3OB4",
          Chain: "A",
          Residue_position: 60,
          AA: "C",
          Epitope_score: 4.5,
          N_glyco_label: 0,
        },
        // Add more residues as needed
      ];
      setEpitopeData1(data1);

      // Example data for structure 2
      const data2: EpitopeData[] = [
        {
          PDB_ID: "3OB4",
          Chain: "A",
          Residue_position: 50,
          AA: "A",
          Epitope_score: 2.8,
          N_glyco_label: 1,
        },
        {
          PDB_ID: "3OB4",
          Chain: "A",
          Residue_position: 60,
          AA: "C",
          Epitope_score: 4.7,
          N_glyco_label: 0,
        },
        // Add more residues as needed
      ];
      setEpitopeData2(data2);

      // Compute similarity map based on your criteria
      const simMap: Record<string, number> = {};
      data1.forEach((residue1) => {
        const correspondingResidue2 = data2.find(
          (residue2) =>
            residue2.Chain === residue1.Chain &&
            residue2.Residue_position === residue1.Residue_position,
        );
        if (correspondingResidue2) {
          // Example similarity score: absolute difference in epitope scores
          const similarityScore = Math.abs(
            residue1.Epitope_score - correspondingResidue2.Epitope_score,
          );
          simMap[`${residue1.Chain}_${residue1.Residue_position}`] =
            similarityScore;
        }
      });
      setSimilarityMap(simMap);
    };

    fetchEpitopeData();
  }, []);

  return (
    <main className="">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4">
        <h1 className="text-2xl font-bold">Epitope Comparison</h1>

        <div className="flex flex-row gap-4">
          {/* Viewer 1 */}
          <div className="w-1/2">
            <h2 className="mb-2 text-xl font-semibold">
              Structure 1: 3OB4 - MBP-fusion protein
            </h2>
            <MoleculeViewer
              epitopeData={epitopeData1}
              similarityMap={similarityMap}
              height="400px"
            />
          </div>

          {/* Viewer 2 */}
          <div className="w-1/2">
            <h2 className="mb-2 text-xl font-semibold">
              Structure 2: 3OB4 - Variant Protein
            </h2>
            <MoleculeViewer
              epitopeData={epitopeData2}
              similarityMap={similarityMap}
              height="400px"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default CompareEpitopes;
