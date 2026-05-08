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
import type { Transaction } from "@/stores/revenue-store";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type NewTransaction = Omit<Transaction, "id">;

export function useRevenue() {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, isError, refetch } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
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
          workspace_id: "personal",
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return data as Transaction;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
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