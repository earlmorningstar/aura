"use client";

/**
 * useOverviewData — derives real dashboard overview data
 * from actual revenue transactions + selected date range.
 */

import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format } from "date-fns";

import { useDateRangeStore } from "@/stores/date-range-store";
import { useRevenue } from "@/hooks/use-revenue";

interface KPI {
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
  kpis: KPI[];
  revenueTrend: { date: string; value: number }[];
  totalRevenue: number;
  trendDelta: string;
  aiSummary: string;
  actions: string[];
  updatedAt?: string;
}

/**
 * Adjust this type to match your real transaction model
 * if your structure differs.
 */
interface Transaction {
  id?: string;
  amount: number;
  date: string;
  source?: string;
}

function deriveOverviewData(
  transactions: Transaction[],
  days: number
): OverviewData {
  const safeTransactions = transactions ?? [];

  // =========================
  // TOTAL REVENUE
  // =========================
  const totalRevenue = safeTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );

  // =========================
  // MRR (rough estimate)
  // =========================
  const mrr =
    safeTransactions.length > 0
      ? (totalRevenue / safeTransactions.length) * 30
      : 0;

  // =========================
  // TOP CONTENT REVENUE
  // =========================
  const topContentRevenue =
    safeTransactions.length > 0
      ? Math.max(...safeTransactions.map((tx) => Number(tx.amount || 0)))
      : 0;

  // =========================
  // REVENUE TREND
  // =========================
  const trendMap = new Map<string, number>();

  safeTransactions.forEach((tx) => {
    if (!tx.date) return;

    const key = format(new Date(tx.date), "MMM dd");

    trendMap.set(
      key,
      (trendMap.get(key) ?? 0) + Number(tx.amount || 0)
    );
  });

  const revenueTrend = Array.from(trendMap.entries())
    .sort(([a], [b]) => {
      const aDate = new Date(a).getTime();
      const bDate = new Date(b).getTime();
      return aDate - bDate;
    })
    .map(([date, value]) => ({
      date,
      value,
    }));

  // =========================
  // BASIC TREND ESTIMATION
  // =========================
  const midpoint = Math.floor(revenueTrend.length / 2);

  const firstHalf = revenueTrend
    .slice(0, midpoint)
    .reduce((sum, item) => sum + item.value, 0);

  const secondHalf = revenueTrend
    .slice(midpoint)
    .reduce((sum, item) => sum + item.value, 0);

  let trendDelta = "+0%";
  let trendDirection: "up" | "down" | "neutral" = "neutral";

  if (firstHalf > 0) {
    const delta = ((secondHalf - firstHalf) / firstHalf) * 100;
    trendDelta = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;

    if (delta > 0) {
      trendDirection = "up";
    } else if (delta < 0) {
      trendDirection = "down";
    }
  }

  // =========================
  // KPI CONFIG
  // =========================
  const kpis: KPI[] = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`,
      rawValue: totalRevenue,
      prefix: "$",
      change: trendDelta,
      trend: trendDirection,
      period: `${days} day${days !== 1 ? "s" : ""}`,
      accent: "cyan",
      icon: null,
    },

    {
      title: "MRR",
      value: `$${mrr.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`,
      rawValue: mrr,
      prefix: "$",
      change: "+—",
      trend: "up",
      period: "estimated",
      accent: "default",
      icon: null,
    },

    {
      title: "Transactions",
      value: safeTransactions.length.toLocaleString(),
      rawValue: safeTransactions.length,
      change: "+—",
      trend: "neutral",
      period: "processed",
      accent: "default",
      icon: null,
    },

    {
      title: "Top Content Rev.",
      value: `$${topContentRevenue.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`,
      rawValue: topContentRevenue,
      prefix: "$",
      change: "+—",
      trend: "up",
      period: "highest single revenue",
      accent: "purple",
      icon: null,
    },
  ];

  // =========================
  // SIMPLE AI SUMMARY
  // =========================
  let aiSummary =
    "Revenue activity is stable across the selected period.";

  if (trendDirection === "up") {
    aiSummary =
      "Revenue is trending upward. Recent transactions are outperforming earlier activity.";
  }

  if (trendDirection === "down") {
    aiSummary =
      "Revenue slowed during the latter half of the selected period.";
  }

  // =========================
  // ACTIONS
  // =========================
  const actions: string[] = [];

  if (trendDirection === "up") {
    actions.push("Double down on your highest-performing content");
    actions.push("Increase distribution on top channels");
  } else if (trendDirection === "down") {
    actions.push("Review recent audience engagement drops");
    actions.push("Experiment with new content formats");
  } else {
    actions.push("Maintain current publishing consistency");
  }

  return {
    kpis,
    revenueTrend,
    totalRevenue,
    trendDelta,
    aiSummary,
    actions,
    updatedAt: new Date().toISOString(),
  };
}

export function useOverviewData() {
  const { startDate, endDate } = useDateRangeStore();
  const { transactions = [] } = useRevenue();
  const days = Math.max(
    differenceInDays(endDate, startDate),
    1
  );

  return useQuery<OverviewData>({
    queryKey: [
      "overview",
      startDate.toISOString(),
      endDate.toISOString(),
      transactions.length,
    ],

    queryFn: async () => {
      /**
       * Filter transactions inside selected date range
       */
      const filteredTransactions = transactions.filter((tx: Transaction) => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });
      return deriveOverviewData(filteredTransactions, days);
    },

    initialData: () => {
      const filteredTransactions = transactions.filter((tx: Transaction) => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });
      return deriveOverviewData(filteredTransactions, days);
    },
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
}