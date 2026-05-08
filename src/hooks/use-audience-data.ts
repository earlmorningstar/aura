// "use client";

// import { useDateRangeStore } from "@/stores/date-range-store";
// import { differenceInDays } from "date-fns";

// export interface AudienceData {
//   totalFollowers: number;
//   newThisMonth: number;
//   avgEngagement: number;
//   avgViews: number;
//   platforms: {
//     name: string;
//     followers: number;
//     delta: string;
//     engagementRate: string;
//     avgViews: string;
//   }[];
//   topContent: {
//     title: string;
//     platform: string;
//     views: string;
//     newFollowers: string;
//   }[];
//   growthData: { date: string; followers: number; newFollowers: number }[];
// }

// function generateAudienceData(days: number): AudienceData {
//   const mult = days / 30;
//   const followersBase = 15660 * mult;
//   const newBase = 1284 * mult;

//   return {
//     totalFollowers: Math.round(followersBase),
//     newThisMonth: Math.round(newBase),
//     avgEngagement: Math.round(4.8 * mult * 10) / 10,
//     avgViews: Math.round(22400 * mult),
//     platforms: [
//       {
//         name: "YouTube",
//         followers: Math.round(8420 * mult),
//         delta: `+${Math.round(320 * mult)} this month`,
//         engagementRate: `${(5.2 * mult).toFixed(1)}%`,
//         avgViews: `${(28.4 * mult).toFixed(1)}K`,
//       },
//       {
//         name: "Twitter / X",
//         followers: Math.round(4280 * mult),
//         delta: `+${Math.round(88 * mult)} this month`,
//         engagementRate: `${(3.7 * mult).toFixed(1)}%`,
//         avgViews: `${(12.1 * mult).toFixed(1)}K`,
//       },
//       {
//         name: "Newsletter",
//         followers: Math.round(2960 * mult),
//         delta: `+${Math.round(142 * mult)} this month`,
//         engagementRate: `${(42.1 * mult).toFixed(1)}%`,
//         avgViews: `${(2.96 * mult).toFixed(1)}K`,
//       },
//     ],
//     topContent: [
//       {
//         title: "No-code tools for solopreneurs in 2026",
//         platform: "YouTube",
//         views: `${(48.2 * mult).toFixed(1)}K`,
//         newFollowers: `+${Math.round(384 * mult)}`,
//       },
//       {
//         title: "How I made $10K from a single email sequence",
//         platform: "Newsletter",
//         views: `${(12.4 * mult).toFixed(1)}K`,
//         newFollowers: `+${Math.round(142 * mult)}`,
//       },
//       {
//         title: "Thread: 10 lessons from my first year building",
//         platform: "Twitter/X",
//         views: `${(28.7 * mult).toFixed(1)}K`,
//         newFollowers: `+${Math.round(267 * mult)}`,
//       },
//       {
//         title: "Full stack in 2026 — what actually matters",
//         platform: "YouTube",
//         views: `${(33.1 * mult).toFixed(1)}K`,
//         newFollowers: `+${Math.round(198 * mult)}`,
//       },
//     ],
//     growthData: Array.from({ length: 8 }, (_, i) => {
//       const day = 1 + i * 4;
//       return {
//         date: `Apr ${day}`,
//         followers: Math.round(11200 * mult + i * 600 * mult),
//         newFollowers: Math.round(180 * mult + i * 40 * mult),
//       };
//     }),
//   };
// }

// export function useAudienceData() {
//   const { startDate, endDate } = useDateRangeStore();
//   const days = differenceInDays(endDate, startDate);
//   const data = generateAudienceData(days);
//   return { data, isLoading: false, isError: false };
// }


"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";

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
  return useQuery<AudienceRecord[]>({
    queryKey: ["audience-data"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("audience_data")
        .select("*")
        .order("recorded_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data as AudienceRecord[];
    },
    staleTime: 5 * 60 * 1000,
  });
}