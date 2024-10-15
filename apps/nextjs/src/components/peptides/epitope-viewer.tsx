"use client";

import { useState } from "react";

import type { ConformationalBResult } from "@epi/validators/epitopes";
import { Card, CardContent, CardHeader, CardTitle } from "@epi/ui/card";

import SequenceVisualization from "~/components/peptides/sequence-visualization";

interface EpitopeViewerProps {
  prediction: ConformationalBResult[];
  isStructureBased: boolean;
}

export default function EpitopeViewer(props: EpitopeViewerProps) {
  const { prediction, isStructureBased } = props;

  const [epitopeData] = useState(prediction);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        {isStructureBased ? (
          <CardTitle>
            Conformational B-cell structure-based prediction
          </CardTitle>
        ) : (
          <CardTitle>Conformational B-cell sequence-based prediction</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <SequenceVisualization
          epitopeData={epitopeData}
          isStructureBased={isStructureBased}
        />
      </CardContent>
    </Card>
  );
}
