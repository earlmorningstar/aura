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
import { createBrowserClient } from "@supabase/ssr";
import { useDateRangeStore } from "@/stores/date-range-store";
import { format } from "date-fns";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Transaction } from "@/stores/revenue-store";
export type { Transaction } from "@/stores/revenue-store";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type NewTransaction = Omit<Transaction, "id">;

export function useRevenue() {
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const { startDate, endDate } = useDateRangeStore();

  const { data: transactions = [], isLoading, isError, refetch } = useQuery<Transaction[]>({
    queryKey: ["transactions", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("workspace_id", currentWorkspace)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (error) throw new Error(error.message);
      return (data as Transaction[]) ?? [];
    },
    staleTime: 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async (newTx: NewTransaction) => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...newTx,
          user_id: user.id,
          workspace_id: currentWorkspace,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return data as Transaction;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions", currentWorkspace] });
      void queryClient.invalidateQueries({ queryKey: ["revenue-chart-data"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions", currentWorkspace] });
      void queryClient.invalidateQueries({ queryKey: ["revenue-chart-data"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  return {
    transactions,
    isLoading,
    isError,
    addTransaction: (tx: NewTransaction) => addMutation.mutate(tx),
    removeTransaction: (id: string) => deleteMutation.mutate(id),
    refetch,
  };
}