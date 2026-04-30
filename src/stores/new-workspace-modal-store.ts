import { create } from "zustand";

interface NewWorkspaceModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useNewWorkspaceModalStore = create<NewWorkspaceModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));