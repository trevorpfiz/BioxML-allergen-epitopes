"use client";

import { useState } from "react";

import type { ConformationalBStructureResult } from "@epi/validators/epitopes";
import { Card, CardContent, CardHeader, CardTitle } from "@epi/ui/card";

import SequenceVisualization from "~/components/peptides/sequence-visualization";

interface EpitopeViewerProps {
  prediction: ConformationalBStructureResult[];
}

export default function EpitopeViewer(props: EpitopeViewerProps) {
  const { prediction } = props;

  const [epitopeData] = useState(prediction);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Conformational B-cell structure-based prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <SequenceVisualization epitopeData={epitopeData} />
      </CardContent>
    </Card>
  );
}
