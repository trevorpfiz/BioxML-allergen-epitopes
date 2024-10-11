"use client";

import { useState } from "react";

import type { EpitopeDataArray } from "@epi/db/schema";
import { Button } from "@epi/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@epi/ui/card";

import SequenceVisualization from "~/components/peptides/sequence-visualization";

interface EpitopeViewerProps {
  prediction: EpitopeDataArray;
}

export default function EpitopeViewer(props: EpitopeViewerProps) {
  const { prediction } = props;

  const [epitopeData] = useState(prediction);

  const handleDownloadCSV = () => {
    if (epitopeData[0] === undefined) {
      // Handle the case when there is no data
      console.warn("No data available for CSV download.");
      return;
    }

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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Conformational B-cell structure-based prediction</CardTitle>
        <Button onClick={handleDownloadCSV}>Download CSV</Button>
      </CardHeader>
      <CardContent>
        <SequenceVisualization epitopeData={epitopeData} />
      </CardContent>
    </Card>
  );
}
