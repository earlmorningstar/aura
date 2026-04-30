/**
 * ui-store.ts — transient UI state that doesn't belong in URL or server state.
 *
 * Scope: sidebar collapse, notification panel, command palette.
 *
 * Workspace selection is intentionally NOT here — it lives in workspace-store.ts.
 * Having it in two stores causes split-brain where sidebar and topbar
 * can disagree on the current workspace.
 */

// import { create } from "zustand";

// /* ─── Types ──────────────────────────────────────────────────────── */

// interface UIStore {
//   /** Whether the sidebar is in collapsed (icon-only) mode */
//   sidebarCollapsed: boolean;
//   toggleSidebar:    () => void;
//   setSidebarCollapsed: (collapsed: boolean) => void;

//   /** Whether the notifications panel is open */
//   notificationsOpen: boolean;
//   toggleNotifications: () => void;
//   setNotificationsOpen: (open: boolean) => void;

//   /** Unread notification count (set by server) */
//   unreadNotifications: number;
//   setUnreadNotifications: (count: number) => void;

//   /** Whether the command palette (⌘K) is open */
//   commandPaletteOpen: boolean;
//   toggleCommandPalette: () => void;
//   setCommandPaletteOpen: (open: boolean) => void;
// }

// /* ─── Store ──────────────────────────────────────────────────────── */

// export const useUIStore = create<UIStore>()((set) => ({
//   sidebarCollapsed: false,
//   toggleSidebar:    () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
//   setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

//   notificationsOpen: false,
//   toggleNotifications: () => set((s) => ({ notificationsOpen: !s.notificationsOpen })),
//   setNotificationsOpen: (open) => set({ notificationsOpen: open }),

//   unreadNotifications: 3,
//   setUnreadNotifications: (count) => set({ unreadNotifications: count }),

//   commandPaletteOpen: false,
//   toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
//   setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
// }));


/**
 * ui-store.ts — lightweight Zustand store for global UI state.
 *
 * Currently manages the AI chat panel's open state.
 */

import { create } from "zustand";

interface UIStore {
  isAIOpen: boolean;
  toggleAIOpen: () => void;
  setAIOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isAIOpen: false,
  toggleAIOpen: () => set((s) => ({ isAIOpen: !s.isAIOpen })),
  setAIOpen: (open) => set({ isAIOpen: open }),
}));