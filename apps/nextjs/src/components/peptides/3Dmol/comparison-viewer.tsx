"use client";

import React, { useEffect, useRef } from "react";
import * as $3Dmol from "3dmol";
import { useTheme } from "next-themes";

import type { ConformationalBStructureResult } from "@epi/validators/epitopes";

interface ComparisonViewerProps {
  pdbId: string;
  epitopeData: ConformationalBStructureResult[];
  residueColorMap: Record<string, string>; // Mapping of "Chain_Pos" to color
  height?: string;
}

/**
 * ComparisonViewer Component
 * Renders a single PDB structure with residue coloring based on similarity and epitopes as sticks.
 */
const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  pdbId,
  epitopeData,
  residueColorMap,
  height = "400px",
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (viewerRef.current) {
      // Initialize the viewer
      const viewer = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: resolvedTheme === "dark" ? "#222222" : "white",
      });

      // Download and load the PDB structure
      $3Dmol.download(`pdb:${pdbId}`, viewer, {}, () => {
        // Define the color function based on residueColorMap
        // const colorFunc = (atom: $3Dmol.AtomSpec) => {
        //   const key = `${atom.chain}_${atom.resi}`;
        //   return residueColorMap[key] ?? "gray";
        // };

        // Apply the cartoon style with the custom color function
        viewer.setStyle({}, { cartoon: { color: "spectrum" } });

        // Render the epitopes as sticks
        // epitopeData.forEach((epitope) => {
        //   const selectionSpec = {
        //     chain: epitope.Chain,
        //     resi: epitope.Residue_position,
        //   };

        //   viewer.setStyle(selectionSpec, {
        //     stick: {
        //       radius: Math.max(0.2, epitope.Epitope_score), // Ensure a minimum radius
        //       color: "yellow", // You can customize this color
        //     },
        //   });
        // });

        // Zoom to fit the structure in the viewer
        viewer.zoomTo();
        viewer.render();
      });

      // Cleanup on unmount
      return () => {
        viewer.clear();
      };
    }
  }, [pdbId, residueColorMap, epitopeData, resolvedTheme]);

  return <div ref={viewerRef} className="relative w-full" style={{ height }} />;
};

export default ComparisonViewer;
