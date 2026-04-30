"use client";

/**
 * useAISummary — fetches the AI-generated weekly summary.
 *
 * Returns the shape that ai-summary-card.tsx expects:
 *   data.aiSummary  → string (the summary text)
 *   data.actions    → string[] (suggested action chips)
 *   data.updatedAt  → string (ISO timestamp)
 *
 * Critical fixes:
 * 1. Returns a structured object, not a raw string
 * 2. Exposes `refetch` so the card's "Refresh" button works
 * 3. POST body includes workspace context so the API knows what to summarise
 * 4. Falls back to data-store seed data on error / before first fetch
 */

import { useQuery } from "@tanstack/react-query";
import { useDataStore } from "@/stores/data-store";
import { useDateRangeStore } from "@/stores/date-range-store";


/* ─── Types ──────────────────────────────────────────────────────── */

export interface AISummaryResult {
  aiSummary: string;
  actions:   string[];
  updatedAt: string;
}

/* ─── Hook ───────────────────────────────────────────────────────── */

export function useAISummary() {
    const { startDate, endDate } = useDateRangeStore();
  // Seed / fallback summary from the data store
  const storeSummary = useDataStore((s) => s.data.aiSummary);

  return useQuery<AISummaryResult>({
  queryKey: ["ai-summary", startDate.toISOString(), endDate.toISOString()],
  queryFn: async () => {
    const url = new URL("/api/ai-summary", window.location.origin);
    url.searchParams.set("startDate", startDate.toISOString());
    url.searchParams.set("endDate", endDate.toISOString());
    const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) {
        throw new Error(`AI summary failed: HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        summary?: string;
        actions?: string[];
        aiSummary?: string;
        updatedAt?: string;
      };

      return {
        aiSummary: json.aiSummary ?? json.summary ?? storeSummary.aiSummary,
        actions:   json.actions   ?? storeSummary.actions,
        updatedAt: json.updatedAt ?? new Date().toISOString(),
      };
    },
    initialData: storeSummary,
    staleTime: 10 * 60 * 1000,
    // Retry once after a short delay before showing an error
    retry: 1,
    retryDelay: 1000,
    placeholderData: (prev) => prev,
  });
}