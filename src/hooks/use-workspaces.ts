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
import { DEFAULT_WORKSPACES, type Workspace } from "@/stores/workspace-store";

/* ─── Supabase client ────────────────────────────────────────────── */

function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/* ─── Hook ───────────────────────────────────────────────────────── */

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("workspaces")
        .select("slug, name")
        .order("name", { ascending: true });

      if (error) {
        // If the user is unauthenticated or the table doesn't exist yet,
        // fall back gracefully to the default workspaces
        console.warn("[useWorkspaces] Supabase error:", error.message);
        return DEFAULT_WORKSPACES;
      }

      return (data as Workspace[]) ?? DEFAULT_WORKSPACES;
    },
    // Show default workspaces while fetching — no loading skeleton in sidebar
    initialData: DEFAULT_WORKSPACES,
    // Workspace list rarely changes — 10 min stale window
    staleTime: 10 * 60 * 1000,
    // Keep previous data on refetch (sidebar shouldn't flicker)
    placeholderData: (prev) => prev,
  });
}