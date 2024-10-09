import { createStore } from "zustand/vanilla";

import type { PredictionType } from "@epi/db/schema";

export interface PredictionTypeState {
  selectedType: PredictionType;
}

export interface PredictionTypeActions {
  setSelectedType: (type: PredictionType) => void;
}

export type PredictionTypeStore = PredictionTypeState & PredictionTypeActions;

export const defaultPredictionTypeState: PredictionTypeState = {
  selectedType: "conformational-b",
};

export const createPredictionTypeStore = (
  initState: PredictionTypeState = defaultPredictionTypeState,
) => {
  return createStore<PredictionTypeStore>((set) => ({
    ...initState,
    setSelectedType: (type: PredictionType) =>
      set(() => ({ selectedType: type })),
  }));
};
