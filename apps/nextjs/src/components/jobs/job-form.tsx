"use client";

import { ConformationalBStructureForm } from "~/components/peptides/forms/conformational-b-structure-form";
import { usePredictionTypeStore } from "~/providers/prediction-type-store-provider";

export default function JobForm() {
  const selectedType = usePredictionTypeStore((state) => state.selectedType);

  const renderForm = () => {
    switch (selectedType) {
      case "conformational-b":
        return <ConformationalBStructureForm />;
      case "linear-b":
        return <p>linear b form</p>;
      case "mhc-i":
        return <p>mhc i form</p>;
      case "mhc-ii":
        return <p>mhc ii form</p>;
      default:
        return null;
    }
  };

  return <>{renderForm()}</>;
}
