"use client";

import { useEffect, useRef } from "react";
// @ts-expect-error 3dmol types?
import * as $3Dmol from "3dmol/build/3Dmol.js";
import { useTheme } from "next-themes";

import type { EpitopeColors } from "~/lib/constants";
import { EPITOPE_COLORS_DARK, EPITOPE_COLORS_LIGHT } from "~/lib/constants";
import { getColorFromScore } from "~/lib/utils";

interface EpitopeData {
  PDB_ID: string;
  Chain: string;
  Residue_position: number;
  AA: string;
  Epitope_score: number;
  N_glyco_label: number;
}

interface MoleculeViewerProps {
  epitopeData: EpitopeData[];
}

/**
 * Creates a color function for 3Dmol.js based on epitope scores.
 * @param {Record<string, number>} epitopeMap - Mapping of residues to their epitope scores.
 * @param {EpitopeColors} colors - The current color scheme.
 * @param {number} minScore - Minimum epitope score.
 * @param {number} maxScore - Maximum epitope score.
 * @returns {function} - Color function for 3Dmol.js.
 */
const createColorFunc = (
  epitopeMap: Record<string, number>,
  colors: EpitopeColors,
  minScore: number,
  maxScore: number,
) => {
  return (atom: any) => {
    const key = `${atom.chain}_${atom.resi}`;
    const score = epitopeMap[key];
    if (score !== undefined && !isNaN(score)) {
      const colorHex = getColorFromScore(colors, score, minScore, maxScore);
      console.log(
        `Residue: ${key}, Score: ${score}, Color: #${colorHex.toString(16).padStart(6, "0")}`,
      );
      return colorHex;
    }

    // Default color if no score is available
    console.log(`Residue: ${key}, Score: N/A, Color: #888888`);
    return 0x888888; // Gray
  };
};

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ epitopeData }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (viewerRef.current) {
      // Initialize the viewer
      const viewer = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: resolvedTheme === "dark" ? "#222222" : "white", // Optional: Change background based on theme
      });

      // Map epitope scores by chain and residue position
      const epitopeMap: Record<string, number> = {};
      epitopeData.forEach((residue) => {
        const key = `${residue.Chain}_${residue.Residue_position}`;
        epitopeMap[key] = residue.Epitope_score;
      });

      // Determine min and max scores
      const scores = epitopeData.map((d) => d.Epitope_score);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);

      console.log(`Min Score: ${minScore}, Max Score: ${maxScore}`);

      // Select the appropriate color scheme based on the theme
      const colors =
        resolvedTheme === "dark" ? EPITOPE_COLORS_DARK : EPITOPE_COLORS_LIGHT;

      // Create the color function
      const colorAsEpitopeGradient = createColorFunc(
        epitopeMap,
        colors,
        minScore,
        maxScore,
      );

      // Download and load the PDB structure
      const pdbID = epitopeData.length > 0 ? epitopeData[0].PDB_ID : "3OB4"; // Default to "3OB4" if not provided
      console.log(`Downloading PDB: ${pdbID}`);

      $3Dmol.download(`pdb:${pdbID}`, viewer, {}, () => {
        console.log(`Downloaded PDB: ${pdbID}`);

        // Apply the custom color function to the cartoon style
        viewer.setStyle({}, { cartoon: { colorfunc: colorAsEpitopeGradient } });

        // Optionally, add surfaces or other styles as needed
        // viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.85 }, {});

        // Zoom to fit the structure in the viewer
        viewer.zoomTo();
        viewer.render();
        console.log(`Rendered PDB: ${pdbID}`);
      });

      // Cleanup on unmount
      return () => {
        viewer.clear();
      };
    }
  }, [epitopeData, resolvedTheme]); // Re-run effect when epitopeData or theme changes

  return (
    <div
      ref={viewerRef}
      style={{ width: "100%", height: "400px", position: "relative" }}
    />
  );
};

export default MoleculeViewer;
