"use client";

import { ConformationalBForm } from "~/components/peptides/forms/conformational-b-structure-form";
import { LinearBForm } from "~/components/peptides/forms/linear-b-form";
import { MhcIForm } from "~/components/peptides/forms/mhc-i-form";
import { MhcIIForm } from "~/components/peptides/forms/mhc-ii-form";
import { usePredictionTypeStore } from "~/providers/prediction-type-store-provider";

export default function JobForm() {
  const selectedType = usePredictionTypeStore((state) => state.selectedType);

  const renderForm = () => {
    switch (selectedType) {
      case "conformational-b":
        return (
          <>
            <div>
              <h1 className="text-2xl font-bold">
                Conformational B-cell Prediction
              </h1>
              <h3 className="text-sm text-muted-foreground">
                Provide a sequence for sequence-based prediction, or a PDB ID +
                Chain for structure-based prediction
              </h3>
            </div>
            <ConformationalBForm />
          </>
        );
      case "linear-b":
        return (
          <>
            <h1 className="text-2xl font-bold">Linear B-cell Prediction</h1>
            <LinearBForm />
          </>
        );
      case "mhc-i":
        return (
          <>
            <h1 className="text-2xl font-bold">MHC-I Prediction</h1>
            <MhcIForm />
          </>
        );
      case "mhc-ii":
        return (
          <>
            <h1 className="text-2xl font-bold">MHC-II Prediction</h1>
            <MhcIIForm />
          </>
        );
      default:
        return null;
    }
  };

  return <>{renderForm()}</>;
}
