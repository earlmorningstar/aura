/**
 * revenue-store.ts — Zustand store for local transaction state.
 *
 * This store serves two purposes:
 * 1. Optimistic / offline-first buffer for newly added transactions
 *    (before they're synced to Supabase)
 * 2. Fallback dataset when Supabase is unavailable or unauthenticated
 *
 * In production, useRevenue() merges server data with local additions.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface Transaction {
  id:          string;
  date:        string; // ISO date string "YYYY-MM-DD"
  amount:      number;
  source:      string;
  description: string;
}

interface RevenueStore {
  transactions:   Transaction[];
  addTransaction: (tx: Omit<Transaction, "id">) => Transaction;
  removeTransaction: (id: string) => void;
  clearLocal: () => void;
}

/* ─── ID generator ───────────────────────────────────────────────── */
// crypto.randomUUID() is available in all modern browsers and Node 15+.
// Falls back to a timestamp + random suffix in case it isn't (SSR edge).

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ─── Seed data (current year) ───────────────────────────────────── */

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id:          "seed-1",
    date:        "2026-04-18",
    amount:      1490,
    source:      "Stripe",
    description: "Digital product sale — Advanced TypeScript course",
  },
  {
    id:          "seed-2",
    date:        "2026-04-17",
    amount:      890,
    source:      "Gumroad",
    description: "Newsletter sponsorship — April edition",
  },
  {
    id:          "seed-3",
    date:        "2026-04-15",
    amount:      420,
    source:      "Affiliate",
    description: "ConvertKit affiliate commission",
  },
  {
    id:          "seed-4",
    date:        "2026-04-12",
    amount:      2200,
    source:      "Stripe",
    description: "No-code tools workshop — cohort 3",
  },
  {
    id:          "seed-5",
    date:        "2026-04-08",
    amount:      650,
    source:      "Gumroad",
    description: "UI design templates pack",
  },
];

/* ─── Store ──────────────────────────────────────────────────────── */

export const useRevenueStore = create<RevenueStore>()(
  persist(
    (set) => ({
      transactions: SEED_TRANSACTIONS,

      addTransaction: (tx) => {
        const newTransaction: Transaction = { ...tx, id: generateId() };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        return newTransaction;
      },

      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      clearLocal: () => set({ transactions: SEED_TRANSACTIONS }),
    }),
    {
      name:    "aura-revenue-transactions",
      storage: createJSONStorage(() => localStorage),
      // Only persist user-added transactions (not seed data after first load)
      partialize: (state) => ({
        transactions: state.transactions.filter(
          (t) => !t.id.startsWith("seed-"),
        ),
      }),
      // Merge persisted user transactions on top of seed data
      merge: (persisted, current) => ({
        ...current,
        transactions: [
          ...((persisted as Partial<RevenueStore>).transactions ?? []),
          ...SEED_TRANSACTIONS.filter(
            (seed) =>
              !((persisted as Partial<RevenueStore>).transactions ?? []).some(
                (p) => p.id === seed.id,
              ),
          ),
        ],
      }),
    },
  ),
);