"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

import type {
  ShareDialogState,
  ShareDialogStore,
} from "~/stores/share-dialog-store";
import { createShareDialogStore } from "~/stores/share-dialog-store";

export type ShareDialogStoreApi = ReturnType<typeof createShareDialogStore>;

export const ShareDialogStoreContext = createContext<
  ShareDialogStoreApi | undefined
>(undefined);

export interface ShareDialogStoreProviderProps {
  children: ReactNode;
  initialState?: ShareDialogState;
}

export const ShareDialogStoreProvider = ({
  children,
  initialState,
}: ShareDialogStoreProviderProps) => {
  const storeRef = useRef<ShareDialogStoreApi>();

  if (!storeRef.current) {
    storeRef.current = createShareDialogStore(initialState);
  }

  return (
    <ShareDialogStoreContext.Provider value={storeRef.current}>
      {children}
    </ShareDialogStoreContext.Provider>
  );
};

export const useShareDialogStore = <T,>(
  selector: (state: ShareDialogStore) => T,
): T => {
  const store = useContext(ShareDialogStoreContext);

  if (!store) {
    throw new Error(
      "useShareDialogStore must be used within a ShareDialogStoreProvider",
    );
  }

  return useStore(store, selector);
};
