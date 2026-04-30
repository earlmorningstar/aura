"use client";

/**
 * useOverviewData — fetches and shapes dashboard overview data.
 *
 * Now reads the global date-range store so that any change to the
 * topbar date picker automatically:
 * - includes the date range in the TanStack Query key
 * - triggers a fresh fetch with the new start/end dates
 * - keeps previous data visible while re‑fetching (placeholderData)
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useDateRangeStore } from "@/stores/date-range-store";
import { differenceInDays } from "date-fns";

export interface KPIConfig {
  title: string;
  value: string;
  rawValue: number;
  prefix?: string;
  suffix?: string;
  change: string;
  trend: "up" | "down" | "neutral";
  period: string;
  accent?: "default" | "cyan" | "purple";
  icon: React.ReactNode;
}

export interface OverviewData {
  kpis: KPIConfig[];
  revenueTrend: { date: string; value: number }[];
  totalRevenue: number;
  trendDelta: string;
  aiSummary: string;
  actions: string[];
  updatedAt?: string;
}

function generateOverviewData(days: number): OverviewData {
  const mult = days / 30;
  const revenueBase = 14892 * mult;
  const mrrBase = 3240 * mult;
  const audienceBase = 1284 * mult;
  const engagementBase = 4.8;
  const topContentBase = 2840 * mult;
  const productivityBase = 92;

  const trendPoints = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i) * Math.ceil(days / 12));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(revenueBase * (0.5 + Math.random() * 0.5)),
    };
  });

  return {
    kpis: [
      {
        title: "Total Revenue",
        value: `$${revenueBase.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        rawValue: revenueBase,
        prefix: "$",
        change: `+${Math.round(18.4 * mult)}%`,
        trend: "up",
        period: `vs last period`,
        accent: "cyan",
        icon: null,
      },
      {
        title: "MRR",
        value: `$${mrrBase.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        rawValue: mrrBase,
        prefix: "$",
        change: `+${Math.round(4.2 * mult)}%`,
        trend: "up",
        period: "vs last month",
        accent: "default",
        icon: null,
      },
      {
        title: "Audience Growth",
        value: `+${Math.round(audienceBase).toLocaleString()}`,
        rawValue: Math.round(audienceBase),
        prefix: "+",
        change: `+${Math.round(12 * mult)}%`,
        trend: "up",
        period: "new followers",
        accent: "default",
        icon: null,
      },
      {
        title: "Avg. Engagement",
        value: `${(engagementBase * mult).toFixed(1)}%`,
        rawValue: parseFloat((engagementBase * mult).toFixed(1)),
        suffix: "%",
        change: `−${(2.1 * mult).toFixed(1)}%`,
        trend: "down",
        period: "vs last month",
        accent: "default",
        icon: null,
      },
      {
        title: "Top Content Rev.",
        value: `$${Math.round(topContentBase).toLocaleString()}`,
        rawValue: Math.round(topContentBase),
        prefix: "$",
        change: `+${Math.round(31 * mult)}%`,
        trend: "up",
        period: "best piece",
        accent: "purple",
        icon: null,
      },
      {
        title: "Productivity",
        value: `${Math.round(productivityBase * mult)}`,
        rawValue: Math.round(productivityBase * mult),
        suffix: "/100",
        change: `+${Math.round(7 * mult)}`,
        trend: "up",
        period: "score",
        accent: "default",
        icon: null,
      },
    ],
    revenueTrend: trendPoints,
    totalRevenue: Math.round(revenueBase),
    trendDelta: `+${Math.round(18.4 * mult)}%`,
    aiSummary: "Your top-performing content continues to drive growth. Double down on video.",
    actions: ["Double down on video", "Create follow-up post"],
  };
}

export function useOverviewData() {
  const { startDate, endDate } = useDateRangeStore();
  const days = differenceInDays(endDate, startDate);

  return useQuery<OverviewData>({
    queryKey: ["overview", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => {
      // In production you'd fetch from Supabase using start/end dates.
      // For now, generate dynamic data based on range.
      return generateOverviewData(days);
    },
    initialData: () => generateOverviewData(days),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}