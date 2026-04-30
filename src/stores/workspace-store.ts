/**
 * workspace-store.ts — active workspace selection.
 *
 * Persisted to localStorage so the user's last-selected workspace
 * survives page refresh.
 *
 * In production, the workspace list is fetched from Supabase via
 * useWorkspaces(). The store only tracks the currently selected slug.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface Workspace {
  slug: string;
  name: string;
}

interface WorkspaceStore {
  currentWorkspace: string;
  setWorkspace: (slug: string) => void;
}

/* ─── Default workspaces (shown while Supabase loads) ───────────── */
// These match the seed data returned by useWorkspaces() fallback.

export const DEFAULT_WORKSPACES: Workspace[] = [
  { slug: "personal",   name: "Personal" },
  { slug: "agency",     name: "Agency" },
  { slug: "side-proj",  name: "Side Projects" },
];

/* ─── Store ──────────────────────────────────────────────────────── */

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      currentWorkspace: "personal",
      setWorkspace: (slug) => set({ currentWorkspace: slug }),
    }),
    {
      name:    "aura-workspace",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);