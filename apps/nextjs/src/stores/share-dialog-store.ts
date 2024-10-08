import { createStore } from "zustand/vanilla";

export interface ShareDialogState {
  isOpen: boolean;
  jobId: string | null;
}

export interface ShareDialogActions {
  openShareDialog: (jobId: string) => void;
  closeShareDialog: () => void;
}

export type ShareDialogStore = ShareDialogState & ShareDialogActions;

export const defaultShareDialogState: ShareDialogState = {
  isOpen: false,
  jobId: null,
};

export const createShareDialogStore = (
  initState: ShareDialogState = defaultShareDialogState,
) => {
  return createStore<ShareDialogStore>((set) => ({
    ...initState,
    openShareDialog: (jobId: string) => set(() => ({ isOpen: true, jobId })),
    closeShareDialog: () => set(() => ({ isOpen: false, jobId: null })),
  }));
};
