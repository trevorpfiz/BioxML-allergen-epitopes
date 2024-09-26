"use client";

import { useState } from "react";

import type {
  ConformationalBSequencePrediction,
  ConformationalBStructurePrediction,
} from "@epi/validators/epitopes";
import { Button } from "@epi/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@epi/ui/card";

import SequenceVisualization from "~/components/peptides/sequence-visualization";

interface EpitopeViewerProps {
  prediction:
    | ConformationalBSequencePrediction
    | ConformationalBStructurePrediction;
}

export default function EpitopeViewer({ prediction }: EpitopeViewerProps) {
  const [epitopeData] = useState(prediction.results);
  const inputSequence = prediction.sequence;

  const handleDownloadCSV = () => {
    const headers = Object.keys(epitopeData[0]).join(",");
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers +
      "\n" +
      epitopeData.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "epitope_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isStructureBased = "PDB_ID" in epitopeData[0];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>
          Conformational B-cell {isStructureBased ? "structure" : "sequence"}
          -based prediction
        </CardTitle>
        <Button onClick={handleDownloadCSV}>Download CSV</Button>
      </CardHeader>
      <CardContent>
        <SequenceVisualization
          epitopeData={epitopeData}
          inputSequence={inputSequence}
        />
      </CardContent>
    </Card>
  );
}
