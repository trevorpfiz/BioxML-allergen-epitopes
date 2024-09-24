"use client";

import React, { useEffect, useRef } from "react";
// @ts-expect-error 3dmol types?
import * as $3Dmol from "3dmol/build/3Dmol.js";

const MoleculeViewer = () => {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current) {
      const viewer = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: "white",
      });

      $3Dmol.download("pdb:3OB4", viewer, {}, () => {
        viewer.setStyle({}, { cartoon: { color: "spectrum" } });
        viewer.zoomTo();
        viewer.render();
      });

      return () => {
        viewer.clear();
      };
    }
  }, []);

  return (
    <div
      ref={viewerRef}
      style={{ width: "100%", height: "400px", position: "relative" }}
    />
  );
};

export default MoleculeViewer;
