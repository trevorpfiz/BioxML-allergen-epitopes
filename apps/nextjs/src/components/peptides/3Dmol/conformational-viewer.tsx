"use client";

import { useEffect, useRef } from "react";
import * as $3Dmol from "3dmol";
import { useTheme } from "next-themes";

import type { ConformationalBResult } from "@epi/validators/epitopes";

import type { EpitopeColors } from "~/lib/constants";
import { EPITOPE_COLORS_DARK, EPITOPE_COLORS_LIGHT } from "~/lib/constants";
import { getColorFromScore } from "~/lib/utils";

interface ConformationalViewerProps {
  epitopeData: ConformationalBResult[];
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
  return (atom: $3Dmol.AtomSpec) => {
    const key = `${atom.chain}_${atom.resi}`;
    const score = epitopeMap[key];
    if (score !== undefined && !isNaN(score)) {
      const colorHex = getColorFromScore(colors, score, minScore, maxScore);

      return colorHex;
    }

    // Default color if no score is available
    return 0x888888; // Gray
  };
};

const ConformationalViewer: React.FC<ConformationalViewerProps> = ({
  epitopeData,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (viewerRef.current) {
      // Initialize the viewer
      const viewer = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: resolvedTheme === "dark" ? "#222222" : "white",
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
      const pdbID = epitopeData.length > 0 ? epitopeData[0]?.PDB_ID : "3OB4"; // Default to "3OB4" if not provided

      $3Dmol.download(`pdb:${pdbID}`, viewer, {}, () => {
        // Apply the custom color function to the cartoon style
        viewer.setStyle({}, { cartoon: { colorfunc: colorAsEpitopeGradient } });

        // Add spheres for all atoms in residues with N-glycosylation sites
        epitopeData.forEach((residue) => {
          if (residue.N_glyco_label) {
            const selectionSpec = {
              chain: residue.Chain,
              resi: residue.Residue_position,
            };

            const atoms = viewer.selectedAtoms(selectionSpec);
            if (atoms.length > 0) {
              atoms.forEach((atom) => {
                const color = colorAsEpitopeGradient(atom); // Get the color based on the epitope score

                viewer.addSphere({
                  center: { x: atom.x ?? 0, y: atom.y ?? 0, z: atom.z ?? 0 },
                  radius: 1.5,
                  color: color, // Set color based on epitope gradient
                });
              });
            }
          }
        });

        // Zoom to fit the structure in the viewer
        viewer.zoomTo();
        viewer.render();
      });

      // Cleanup on unmount
      return () => {
        viewer.clear();
      };
    }
  }, [epitopeData, resolvedTheme]); // Re-run effect when epitopeData or theme changes

  return <div ref={viewerRef} className="relative h-[400px] w-full" />;
};

export default ConformationalViewer;
