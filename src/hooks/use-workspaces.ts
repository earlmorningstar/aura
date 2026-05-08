"use client";

/**
 * useWorkspaces — fetches the list of workspaces for the current user.
 *
 * Returns workspaces in the shape the WorkspaceSwitcher expects:
 *   data → Array<{ slug: string; name: string }>
 *
 * Falls back to DEFAULT_WORKSPACES so the sidebar renders immediately
 * without a loading state on first paint.
 */


import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Workspace } from "@/stores/workspace-store";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("workspaces")
        .select("slug, name")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return (data as Workspace[]) ?? [];
    },
    staleTime: 0, // always refetch when requested
  });
}