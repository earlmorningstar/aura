// "use client";

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactNode } from "react";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       refetchOnWindowFocus: false,
//     },
//   },
// });

// export function QueryProvider({ children }: { children: ReactNode }) {
//   return (
//     <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//   );
// }


"use client";

/**
 * lib/query-client.tsx — React Query provider with per-tree QueryClient.
 *
 * Critical fix: the original created a module-level QueryClient singleton.
 * In Next.js App Router, modules may be shared across SSR renders for
 * DIFFERENT users, meaning cached query data could leak between requests.
 *
 * Solution: create the QueryClient inside useState so each component tree
 * (each user session) gets its own instance. React guarantees useState
 * initialisation only runs once per component mount.
 *
 * Reference: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
 */

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/* ─── QueryClient factory ────────────────────────────────────────── */

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 5 minutes across all queries by default.
        // Individual hooks override this with their own staleTime.
        staleTime: 5 * 60 * 1000,
        // Don't refetch on tab focus — dashboard data isn't real-time
        refetchOnWindowFocus: false,
        // Retry failed queries twice before showing error state
        retry: 2,
        // Keep stale data visible while refetching (no loading flash)
        placeholderData: (prev: unknown) => prev,
      },
      mutations: {
        // Retry mutations once on network failure
        retry: 1,
      },
    },
  });
}

/* ─── QueryProvider ──────────────────────────────────────────────── */

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Per-tree instance — safe for SSR and concurrent rendering
  const [queryClient] = React.useState<QueryClient>(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}