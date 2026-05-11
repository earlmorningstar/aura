"use client";

/**
 * useOverviewData — derives real dashboard overview data
 * from actual revenue transactions + selected date range.
 */

import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format } from "date-fns";
import { useDateRangeStore } from "@/stores/date-range-store";
import { useRevenue } from "@/hooks/use-revenue";
import { useAudienceData, type AudienceRecord } from "@/hooks/use-audience-data";

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

interface Transaction {
  id?: string;
  amount: number;
  date: string;
  source?: string;
}

function deriveOverviewData(
  transactions: Transaction[],
  days: number,
  startDate: Date,
  endDate: Date,
  audienceRecords: AudienceRecord[],
): OverviewData {
  const safeTransactions = transactions ?? [];

  // Total revenue
  const totalRevenue = safeTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  // MRR
  const mrr = safeTransactions.length > 0 ? (totalRevenue / safeTransactions.length) * 30 : 0;

  // Top content revenue
  const topContentRevenue = safeTransactions.length > 0
    ? Math.max(...safeTransactions.map((tx) => Number(tx.amount || 0)))
    : 0;

  // Trend building (fill all days)
  const filledTrend = new Map<string, number>();
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    filledTrend.set(format(d, "MMM dd"), 0);
  }
  safeTransactions.forEach((tx) => {
    if (!tx.date) return;
    const key = format(new Date(tx.date), "MMM dd");
    if (filledTrend.has(key)) {
      filledTrend.set(key, (filledTrend.get(key) ?? 0) + Number(tx.amount || 0));
    }
  });
  const revenueTrend = Array.from(filledTrend.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, value]) => ({ date, value }));

  // Trend delta
  const midpoint = Math.floor(revenueTrend.length / 2);
  const firstHalf = revenueTrend.slice(0, midpoint).reduce((sum, item) => sum + item.value, 0);
  const secondHalf = revenueTrend.slice(midpoint).reduce((sum, item) => sum + item.value, 0);
  let trendDelta = "+0%";
  let trendDirection: "up" | "down" | "neutral" = "neutral";
  if (firstHalf > 0) {
    const delta = ((secondHalf - firstHalf) / firstHalf) * 100;
    trendDelta = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
    if (delta > 0) trendDirection = "up";
    else if (delta < 0) trendDirection = "down";
  }

  // Build KPIs
  const kpis: KPI[] = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
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
      value: `$${mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
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
      value: `$${topContentRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      rawValue: topContentRevenue,
      prefix: "$",
      change: "+—",
      trend: "up",
      period: "highest single revenue",
      accent: "purple",
      icon: null,
    },
  ];

  // Audience KPIs from real records
  const totalFollowers = audienceRecords.reduce((sum, r) => sum + r.followers, 0);
  const newFolls = audienceRecords.reduce((sum, r) => sum + r.new_followers, 0);
  const avgEng = audienceRecords.length
    ? Math.round((audienceRecords.reduce((sum, r) => sum + (r.engagement_rate ?? 0), 0) / audienceRecords.length) * 10) / 10
    : 0;

  kpis.push({
    title: "Audience Growth",
    value: `+${newFolls.toLocaleString()}`,
    rawValue: newFolls,
    prefix: "+",
    change: "+—",
    trend: "up",
    period: "new followers",
    accent: "default",
    icon: null,
  }, {
    title: "Avg. Engagement",
    value: `${avgEng}%`,
    rawValue: avgEng,
    suffix: "%",
    change: "—",
    trend: "neutral",
    period: "rate",
    accent: "default",
    icon: null,
  });

  // AI Summary / actions
  let aiSummary = "Revenue activity is stable across the selected period.";
  if (trendDirection === "up") aiSummary = "Revenue is trending upward. Recent transactions are outperforming earlier activity.";
  if (trendDirection === "down") aiSummary = "Revenue slowed during the latter half of the selected period.";

  const actions: string[] = [];
  if (trendDirection === "up") {
    actions.push("Double down on your highest-performing content", "Increase distribution on top channels");
  } else if (trendDirection === "down") {
    actions.push("Review recent audience engagement drops", "Experiment with new content formats");
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
  const { data: audienceRecords = [] } = useAudienceData();
  const days = Math.max(differenceInDays(endDate, startDate), 1);

  return useQuery<OverviewData>({
    queryKey: ["overview", startDate.toISOString(), endDate.toISOString(), transactions.length, audienceRecords.length],
    queryFn: async () => {
      const filteredTransactions = transactions.filter((tx: Transaction) => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });
      return deriveOverviewData(filteredTransactions, days, startDate, endDate, audienceRecords);
    },
    initialData: () => {
      const filteredTransactions = transactions.filter((tx: Transaction) => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });
      return deriveOverviewData(filteredTransactions, days, startDate, endDate, audienceRecords);
    },
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
}