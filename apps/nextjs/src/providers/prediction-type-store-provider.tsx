"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

import type {
  PredictionTypeState,
  PredictionTypeStore,
} from "~/stores/prediction-type-store";
import { createPredictionTypeStore } from "~/stores/prediction-type-store";

export type PredictionTypeStoreApi = ReturnType<
  typeof createPredictionTypeStore
>;

export const PredictionTypeStoreContext = createContext<
  PredictionTypeStoreApi | undefined
>(undefined);

export interface PredictionTypeStoreProviderProps {
  children: ReactNode;
  initialState?: PredictionTypeState;
}

export const PredictionTypeStoreProvider = ({
  children,
  initialState,
}: PredictionTypeStoreProviderProps) => {
  const storeRef = useRef<PredictionTypeStoreApi>();

  if (!storeRef.current) {
    storeRef.current = createPredictionTypeStore(initialState);
  }

  return (
    <PredictionTypeStoreContext.Provider value={storeRef.current}>
      {children}
    </PredictionTypeStoreContext.Provider>
  );
};

export const usePredictionTypeStore = <T,>(
  selector: (state: PredictionTypeStore) => T,
): T => {
  const store = useContext(PredictionTypeStoreContext);

  if (!store) {
    throw new Error(
      "usePredictionTypeStore must be used within a PredictionTypeStoreProvider",
    );
  }

  return useStore(store, selector);
};
