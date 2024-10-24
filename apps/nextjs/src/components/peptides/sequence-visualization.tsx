"use client";

import { useMemo } from "react";

import type { ConformationalBResult } from "@epi/validators/epitopes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@epi/ui/tooltip";

import {
  SEQUENCE_EPITOPE_THRESHOLD,
  STRUCTURE_EPITOPE_THRESHOLD,
} from "~/lib/constants";

interface SequenceVisualizationProps {
  epitopeData: ConformationalBResult[];
  isStructureBased: boolean;
}

const Legend = ({ threshold }: { threshold: number }) => (
  <div className="flex flex-col gap-2">
    <h4 className="text-sm font-semibold">Epitope Score</h4>
    <div className="flex items-center">
      <div className="from-epitope-low via-epitope-mid to-epitope-high w-full rounded bg-gradient-to-r px-2 py-2">
        <div className="flex w-full justify-between text-xs">
          <span>Low</span>
          <span className="text-center">({threshold})</span>
          <span>High</span>
        </div>
      </div>
    </div>
  </div>
);

const SequenceVisualization: React.FC<SequenceVisualizationProps> = ({
  epitopeData,
  isStructureBased,
}) => {
  const EPITOPE_THRESHOLD = isStructureBased
    ? STRUCTURE_EPITOPE_THRESHOLD
    : SEQUENCE_EPITOPE_THRESHOLD;

  const { minScore, maxScore } = useMemo(() => {
    const scores = epitopeData.map((d) => d.Epitope_score);
    return {
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
    };
  }, [epitopeData]);

  const getBackgroundColor = (score: number) => {
    const normalizedScore = (score - minScore) / (maxScore - minScore);
    const normalizedThreshold =
      (EPITOPE_THRESHOLD - minScore) / (maxScore - minScore);

    let r, g, b;
    if (normalizedScore < normalizedThreshold) {
      // Interpolate between low and mid
      const factor = normalizedScore / normalizedThreshold;
      r = `calc(var(--epitope-low-r) * (1 - ${factor}) + var(--epitope-mid-r) * ${factor})`;
      g = `calc(var(--epitope-low-g) * (1 - ${factor}) + var(--epitope-mid-g) * ${factor})`;
      b = `calc(var(--epitope-low-b) * (1 - ${factor}) + var(--epitope-mid-b) * ${factor})`;
    } else {
      // Interpolate between mid and high
      const factor =
        (normalizedScore - normalizedThreshold) / (1 - normalizedThreshold);
      r = `calc(var(--epitope-mid-r) * (1 - ${factor}) + var(--epitope-high-r) * ${factor})`;
      g = `calc(var(--epitope-mid-g) * (1 - ${factor}) + var(--epitope-high-g) * ${factor})`;
      b = `calc(var(--epitope-mid-b) * (1 - ${factor}) + var(--epitope-high-b) * ${factor})`;
    }

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="flex flex-col gap-8">
      <Legend threshold={EPITOPE_THRESHOLD} />

      <div>
        <p className="text-sm">
          Hover over the amino acid letters to see the predicted value and
          residue position in the sequence. The predicted epitope score
          indicates the logarithm of the contact number. Amino acids predicted
          to undergo N-glycosylation are marked with an asterisk in the
          sequence.
        </p>
      </div>

      <div className="flex flex-wrap font-mono">
        <TooltipProvider
          delayDuration={0}
          skipDelayDuration={300}
          disableHoverableContent
        >
          {epitopeData.map((data, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <span
                  style={{
                    backgroundColor: getBackgroundColor(data.Epitope_score),
                  }}
                  className={`inline-block ${
                    data.Epitope_score > EPITOPE_THRESHOLD
                      ? "font-bold"
                      : "lowercase"
                  }`}
                >
                  {data.AA}
                  {data.N_glyco_label === 1 ? "*" : ""}
                </span>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                <p>Value: {data.Epitope_score.toFixed(2)}</p>
                {data.Chain ? (
                  <p>
                    PDB Position: {data.Chain}_{data.Residue_position}
                  </p>
                ) : (
                  <p>Position: {data.Residue_position}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default SequenceVisualization;
