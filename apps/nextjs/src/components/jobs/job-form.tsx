"use client";

import { ConformationalBStructureForm } from "~/components/peptides/forms/conformational-b-structure-form";
import { LinearBForm } from "~/components/peptides/forms/linear-b-form";
import { MhcIForm } from "~/components/peptides/forms/mhc-i-form";
import { MhcIIForm } from "~/components/peptides/forms/mhc-ii-form";
import { usePredictionTypeStore } from "~/providers/prediction-type-store-provider";

export default function JobForm() {
  const selectedType = usePredictionTypeStore((state) => state.selectedType);

  const renderForm = () => {
    switch (selectedType) {
      case "conformational-b":
        return <ConformationalBStructureForm />;
      case "linear-b":
        return <LinearBForm />;
      case "mhc-i":
        return <MhcIForm />;
      case "mhc-ii":
        return <MhcIIForm />;
      default:
        return null;
    }
  };

  return <>{renderForm()}</>;
}
