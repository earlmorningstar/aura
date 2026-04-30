"use client";

/**
 * useRevenueData — derives chart‑ready revenue data from transactions,
 * now filtered by the global date‑range store.
 */

import { useQuery } from "@tanstack/react-query";
import { useRevenueStore, type Transaction } from "@/stores/revenue-store";
import { useDateRangeStore } from "@/stores/date-range-store";
import {
  format,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface DailyRevenuePoint {
  name: string; // e.g. "Apr 12"
  revenue: number;
}

export interface SourceBreakdownPoint {
  name: string;
  value: number; // percentage 0–100
}

export interface RevenueChartData {
  dailyRevenue: DailyRevenuePoint[];
  sourceBreakdown: SourceBreakdownPoint[];
  totalRevenue: number;
  transactionCount: number;
}

/* ─── Derivation helper (filtered by date range) ────────────────── */

function deriveChartData(
  transactions: Transaction[],
  rangeStart: Date,
  rangeEnd: Date
): RevenueChartData {
  // Normalise to start of day for consistent day‑by‑day buckets
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);

  // ── Daily revenue: one bucket per calendar day in the range ──
  const days = eachDayOfInterval({ start, end });
  const dailyMap = new Map<string, number>();
  for (const d of days) {
    dailyMap.set(format(d, "MMM d"), 0);
  }

  // Filter transactions to those that fall inside the selected range
  for (const tx of transactions) {
    try {
      const txDate = parseISO(tx.date);
      if (isWithinInterval(txDate, { start, end })) {
        const key = format(txDate, "MMM d");
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + tx.amount);
      }
    } catch {
      // Skip malformed date strings
    }
  }

  const dailyRevenue: DailyRevenuePoint[] = Array.from(dailyMap.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort(
      (a, b) =>
        new Date(a.name + " 2024").getTime() -
        new Date(b.name + " 2024").getTime()
    );

  // ── Source breakdown (filtered) ─────────────────────────────
  const sourceTotals = new Map<string, number>();
  let grandTotal = 0;

  for (const tx of transactions) {
    try {
      const txDate = parseISO(tx.date);
      if (!isWithinInterval(txDate, { start, end })) continue;
    } catch { continue; }
    sourceTotals.set(tx.source, (sourceTotals.get(tx.source) ?? 0) + tx.amount);
    grandTotal += tx.amount;
  }

  const sourceBreakdown: SourceBreakdownPoint[] =
    grandTotal === 0
      ? []
      : Array.from(sourceTotals.entries())
          .map(([name, total]) => ({
            name,
            value: Math.round((total / grandTotal) * 100),
          }))
          .sort((a, b) => b.value - a.value);

  const filteredCount = transactions.filter((tx) => {
    try {
      const txDate = parseISO(tx.date);
      return isWithinInterval(txDate, { start, end });
    } catch { return false; }
  }).length;

  return {
    dailyRevenue,
    sourceBreakdown,
    totalRevenue: grandTotal,
    transactionCount: filteredCount,
  };
}

/* ─── Hook ───────────────────────────────────────────────────────── */

export function useRevenueData() {
  const transactions = useRevenueStore((s) => s.transactions);
  const { startDate, endDate } = useDateRangeStore();

  return useQuery<RevenueChartData>({
    queryKey: [
      "revenue-chart-data",
      transactions.length,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => deriveChartData(transactions, startDate, endDate),
    initialData: () => deriveChartData(transactions, startDate, endDate),
    staleTime: 30 * 1000,
  });
}
