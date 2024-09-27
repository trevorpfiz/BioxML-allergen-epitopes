"use client";

import { useEffect, useRef } from "react";
// @ts-expect-error 3dmol types?
import * as $3Dmol from "3dmol/build/3Dmol.js";
import { useTheme } from "next-themes";

interface BasicViewerProps {
  pdbId?: string;
  height?: string; // To allow different heights
}

const BasicMoleculeViewer: React.FC<BasicViewerProps> = ({
  pdbId,
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

      $3Dmol.download(`pdb:${pdbId}`, viewer, {}, () => {
        // Apply the custom color function to the cartoon style
        viewer.setStyle({}, { cartoon: { color: "spectrum" } });

        // Zoom to fit the structure in the viewer
        viewer.zoomTo();
        viewer.render();
      });

      // Cleanup on unmount
      return () => {
        viewer.clear();
      };
    }
  }, [pdbId, resolvedTheme]);

  return <div ref={viewerRef} className="relative w-full" style={{ height }} />;
};

export default BasicMoleculeViewer;
