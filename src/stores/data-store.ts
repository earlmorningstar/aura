// import { create } from "zustand";

// export interface OverviewData {
//   totalRevenue: number;
//   mrr: number;
//   audienceGrowth: number;
//   avgEngagement: number;
//   topContentRevenue: number;
//   productivityScore: number;
//   revenueTrend: { date: string; value: number }[];
//   aiSummary: string;
// }

// export const useDataStore = create<{ data: OverviewData }>(() => ({
//   data: {
//     totalRevenue: 14892,
//     mrr: 3240,
//     audienceGrowth: 1284,
//     avgEngagement: 4.8,
//     topContentRevenue: 2840,
//     productivityScore: 92,
//     revenueTrend: [
//       { date: "Apr 12", value: 820 },
//       { date: "Apr 13", value: 940 },
//       { date: "Apr 14", value: 1100 },
//       { date: "Apr 15", value: 980 },
//       { date: "Apr 16", value: 1350 },
//       { date: "Apr 17", value: 1420 },
//       { date: "Apr 18", value: 1580 },
//     ],
//     aiSummary: "Your revenue is up 18% this month. The last YouTube video on “no-code tools” is driving 42% of new subs. Double down on short-form video content this week.",
//   },
// }));



/**
 * data-store.ts — Zustand store for overview / dashboard data.
 *
 * This store holds the canonical in-memory state for the overview page.
 * In production, this data is hydrated by useOverviewData() via React Query
 * fetching from Supabase. The values here serve as the offline fallback.
 *
 * Shape is designed to match what the dashboard components expect:
 * - kpi-grid.tsx          → data.kpis[]
 * - revenue-trend-chart   → data.revenueTrend, data.totalRevenue, data.trendDelta
 * - ai-summary-card       → data.aiSummary (object, not string)
 */

import { create } from "zustand";

/* ─── KPI config ─────────────────────────────────────────────────── */

export interface KPIData {
  title:    string;
  value:    string;
  rawValue: number;
  prefix?:  string;
  suffix?:  string;
  change:   string;
  trend:    "up" | "down" | "neutral";
  period:   string;
  accent?:  "default" | "cyan" | "purple";
}

/* ─── AI summary ─────────────────────────────────────────────────── */

export interface AISummaryData {
  aiSummary: string;
  actions:   string[];
  updatedAt: string; // ISO date string
}

/* ─── Revenue trend point ────────────────────────────────────────── */

export interface TrendPoint {
  date:  string;
  value: number;
}

/* ─── Overview data ──────────────────────────────────────────────── */

export interface OverviewData {
  /** KPI cards for the dashboard grid */
  kpis: KPIData[];
  /** Scalar totals for summary display */
  totalRevenue: number;
  mrr:          number;
  /** Delta string shown on the revenue trend chart */
  trendDelta:   string;
  /** Area chart data */
  revenueTrend: TrendPoint[];
  /** AI summary panel */
  aiSummary: AISummaryData;
}

/* ─── Store interface ────────────────────────────────────────────── */

interface DataStore {
  data: OverviewData;
  setData: (data: Partial<OverviewData>) => void;
}

/* ─── Default / seed data ────────────────────────────────────────── */

const DEFAULT_DATA: OverviewData = {
  totalRevenue: 14892,
  mrr:          3240,
  trendDelta:   "+18.4%",

  kpis: [
    {
      title:    "Total Revenue",
      value:    "$14,892",
      rawValue: 14892,
      prefix:   "$",
      change:   "+18.4%",
      trend:    "up",
      period:   "vs last month",
      accent:   "cyan",
    },
    {
      title:    "MRR",
      value:    "$3,240",
      rawValue: 3240,
      prefix:   "$",
      change:   "+4.2%",
      trend:    "up",
      period:   "vs last month",
      accent:   "default",
    },
    {
      title:    "Audience Growth",
      value:    "+1,284",
      rawValue: 1284,
      prefix:   "+",
      change:   "+12%",
      trend:    "up",
      period:   "new followers",
      accent:   "default",
    },
    {
      title:    "Avg. Engagement",
      value:    "4.8%",
      rawValue: 4.8,
      suffix:   "%",
      change:   "\u22122.1%",
      trend:    "down",
      period:   "vs last month",
      accent:   "default",
    },
    {
      title:    "Top Content Rev.",
      value:    "$2,840",
      rawValue: 2840,
      prefix:   "$",
      change:   "+31%",
      trend:    "up",
      period:   "best piece",
      accent:   "purple",
    },
    {
      title:    "Productivity",
      value:    "92",
      rawValue: 92,
      suffix:   "/100",
      change:   "+7",
      trend:    "up",
      period:   "score",
      accent:   "default",
    },
  ],

  revenueTrend: [
    { date: "Apr 1",  value: 820 },
    { date: "Apr 5",  value: 1050 },
    { date: "Apr 9",  value: 940 },
    { date: "Apr 13", value: 1380 },
    { date: "Apr 17", value: 1220 },
    { date: "Apr 21", value: 1640 },
    { date: "Apr 25", value: 1490 },
    { date: "Apr 29", value: 1870 },
    { date: "May 3",  value: 2050 },
    { date: "May 7",  value: 1930 },
    { date: "May 11", value: 2380 },
    { date: "May 15", value: 2240 },
  ],

  aiSummary: {
    aiSummary:
      "Your top-performing content this week was the tutorial video on monetisation strategies — it generated 38% of total revenue. Subscription growth is ahead of pace. Consider doubling down on long-form educational content and scheduling a follow-up post in the next 48 hours to capitalise on the momentum.",
    actions:   ["Double down on video", "Create follow-up post", "Review top earners"],
    updatedAt: new Date().toISOString(),
  },
};

/* ─── Store ──────────────────────────────────────────────────────── */

export const useDataStore = create<DataStore>()((set) => ({
  data: DEFAULT_DATA,
  setData: (partial) =>
    set((state) => ({
      data: { ...state.data, ...partial },
    })),
}));
