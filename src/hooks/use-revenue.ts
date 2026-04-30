"use client";

/**
 * useRevenue — primary hook for transaction CRUD.
 *
 * Returns:
 *   transactions    → Transaction[] (server + local always merged)
 *   isLoading       → boolean
 *   isError         → boolean
 *   isAdding        → boolean (mutation pending)
 *   addTransaction  → (tx: Omit<Transaction, "id">) => void
 *   removeTransaction → (id: string) => void
 *   refetch         → () => void (force refresh of the transaction list)
 *
 * Critical fix: when the server returns an empty list, we still show
 * local transactions (optimistic / offline).  The merge logic always
 * combines server entries with any local transaction whose ID is not
 * yet present in the server result.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRevenueStore, type Transaction } from "@/stores/revenue-store";
import { createBrowserClient } from "@supabase/ssr";
import React from "react";

/* ─── Supabase client (browser) ──────────────────────────────────── */

function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/* ─── Types ──────────────────────────────────────────────────────── */

type NewTransaction = Omit<Transaction, "id">;

/* ─── Hook ───────────────────────────────────────────────────────── */

export function useRevenue() {
  const queryClient = useQueryClient();
  const localStore = useRevenueStore();

  // ── Server fetch ───────────────────────────────────────────────
  const {
    data: serverTransactions,
    isLoading,
    isError,
    refetch,
  } = useQuery<Transaction[]>({
    queryKey: ["revenue-transactions"],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("revenue_transactions")
        .select("id, date, amount, source, description")
        .order("date", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Transaction[];
    },
    initialData: localStore.transactions,
    staleTime: 60 * 1000,
    retry: 2,
    // Keep previous data visible while re‑fetching (no skeleton flash)
    placeholderData: (prev) => prev,
  });

  // ── Merge: server list + local transactions not yet confirmed ──
  // If the server returns an empty list, we still show local entries.
  // Once a new transaction is confirmed on the server, its ID will
  // be present in the server list and the optimistic entry removed.
  const transactions = React.useMemo<Transaction[]>(() => {
    const server = serverTransactions ?? [];
    const local = localStore.transactions;

    if (server.length === 0) return local;

    const serverIds = new Set(server.map((t) => t.id));
    const localOnly = local.filter((t) => !serverIds.has(t.id));
    return [...server, ...localOnly];
  }, [serverTransactions, localStore.transactions]);

  // ── Add transaction mutation ────────────────────────────────────
  const addMutation = useMutation<
    Transaction,
    Error,
    NewTransaction,
    { optimisticId: string }
  >({
    mutationFn: async (newTx) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("revenue_transactions")
        .insert([{ ...newTx, workspace_id: "personal" }])
        .select("id, date, amount, source, description")
        .single();

      if (error) throw new Error(error.message);
      return data as Transaction;
    },

    // Optimistic update: add to local store immediately
    onMutate: async (newTx) => {
      await queryClient.cancelQueries({ queryKey: ["revenue-transactions"] });
      const optimistic = localStore.addTransaction(newTx);
      return { optimisticId: optimistic.id };
    },

    // On success: replace optimistic entry with server-returned ID
    onSuccess: (serverTx, _vars, context) => {
      if (context?.optimisticId && context.optimisticId !== serverTx.id) {
        localStore.removeTransaction(context.optimisticId);
      }
      void queryClient.invalidateQueries({ queryKey: ["revenue-transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["revenue-chart-data"] });
    },

    // On failure: roll back optimistic entry
    onError: (_err, _vars, context) => {
      if (context?.optimisticId) {
        localStore.removeTransaction(context.optimisticId);
      }
    },
  });

  function addTransaction(tx: NewTransaction): void {
    addMutation.mutate(tx);
  }

  return {
    transactions,
    isLoading,
    isError,
    isAdding: addMutation.isPending,
    addTransaction,
    removeTransaction: localStore.removeTransaction,
    refetch,
  };
}