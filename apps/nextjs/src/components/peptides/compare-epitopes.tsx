"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

import type { ConformationalBResult } from "@epi/validators/epitopes";

import type { SimilarityData } from "~/components/peptides/tables/similarity-columns";

const ComparisonViewer = dynamic(
  () => import("~/components/peptides/3Dmol/comparison-viewer"),
  {
    ssr: false,
  },
);

interface CompareEpitopesProps {
  pdbId1: string;
  pdbId2: string;
  similarityData: SimilarityData[];
  epitopeData1: ConformationalBResult[];
  epitopeData2: ConformationalBResult[];
}

/**
 * CompareEpitopes Component
 * Processes similarity data and renders two ComparisonViewers with consistent coloring.
 */
const CompareEpitopes: React.FC<CompareEpitopesProps> = ({
  pdbId1,
  pdbId2,
  similarityData,
  epitopeData1,
  epitopeData2,
}) => {
  /**
   * Step 1: Assign Unique Colors to Each Similarity Group
   */
  const colorPalette = useMemo(
    () => [
      "#FF5733", // Red
      "#33FF57", // Green
      "#3357FF", // Blue
      "#FF33A8", // Pink
      "#A833FF", // Purple
      "#33FFF6", // Cyan
      "#FF8F33", // Orange
      "#8FFF33", // Lime
      "#FF3333", // Bright Red
      "#33FF8F", // Mint
      "#FFBD33", // Yellow-Orange
      "#33BDFF", // Light Blue
      "#BD33FF", // Light Purple
      "#33FFBD", // Aquamarine
      "#FF33BD", // Magenta
      // Add more colors if needed
    ],
    [],
  );

  /**
   * Step 2: Create Similarity Groups and Assign Colors
   */
  const similarityGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        PDB1: { chain: string; pos: number };
        PDB2: { chain: string; pos: number };
        color: string;
      }
    > = {};

    similarityData.forEach((pair, index) => {
      if (pair.score > 2) {
        const groupKey = `group_${index}`;
        groups[groupKey] = {
          PDB1: { chain: pair.chain_1, pos: pair.pos_1 },
          PDB2: { chain: pair.chain_2, pos: pair.pos_2 },
          color: colorPalette[index % colorPalette.length] ?? "gray",
        };
      }
    });

    return groups;
  }, [similarityData, colorPalette]);

  /**
   * Step 3: Create Residue Color Maps for Both PDBs
   */
  const residueColorMapPDB1 = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    Object.values(similarityGroups).forEach((group) => {
      const key = `${group.PDB1.chain}_${group.PDB1.pos}`;
      map[key] = group.color;
    });
    return map;
  }, [similarityGroups]);

  const residueColorMapPDB2 = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    Object.values(similarityGroups).forEach((group) => {
      const key = `${group.PDB2.chain}_${group.PDB2.pos}`;
      map[key] = group.color;
    });
    return map;
  }, [similarityGroups]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Viewer for PDB ID 1 */}
        <div className="flex-1">
          <h2 className="mb-2 text-xl font-semibold">Structure 1: {pdbId1}</h2>
          <div className="min-h-[402px] w-full border shadow">
            <ComparisonViewer
              pdbId={pdbId1}
              epitopeData={epitopeData1}
              residueColorMap={residueColorMapPDB1}
              height="400px"
            />
          </div>
        </div>

        {/* Viewer for PDB ID 2 */}
        <div className="flex-1">
          <h2 className="mb-2 text-xl font-semibold">Structure 2: {pdbId2}</h2>
          <div className="min-h-[402px] w-full border shadow">
            <ComparisonViewer
              pdbId={pdbId2}
              epitopeData={epitopeData2}
              residueColorMap={residueColorMapPDB2}
              height="400px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareEpitopes;
