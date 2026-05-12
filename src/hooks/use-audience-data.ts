"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { useWorkspaceStore } from "@/stores/workspace-store";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface AudienceRecord {
  id: string;
  platform: string;
  followers: number;
  new_followers: number;
  engagement_rate: number | null;
  avg_views: number | null;
  recorded_date: string;
}

export function useAudienceData() {
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  return useQuery<AudienceRecord[]>({
    queryKey: ["audience-data", currentWorkspace],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("audience_data")
        .select("*")
        .eq("workspace_id", currentWorkspace)
        .order("recorded_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data as AudienceRecord[];
    },
    staleTime: 0,
  });
}