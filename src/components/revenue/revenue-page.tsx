"use client";

/**
 * RevenuePage — orchestrates the full revenue section layout.
 *
 * Sections (top to bottom):
 * 1. Page header with total MRR + export action
 * 2. Charts panel (daily bar + source donut)
 * 3. Transactions table (left 2/3) + Add transaction form (right 1/3)
 *
 * All sections stagger in via AnimatedGroup.
 * Export uses the corrected `@/lib/exports` path and Lucide Download icon.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, DollarSign } from "lucide-react";
import { TransactionForm } from "./transaction-form";
import { RevenueTable } from "./revenue-table";
import { GlassButton } from "@/components/ui/glass-button";
import { AnimatedPage, AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { useRevenue } from "@/hooks/use-revenue";
import { downloadCSV } from "@/lib/export";
import dynamic from "next/dynamic";
import { SkeletonChart } from "@/components/ui/loading-skeleton";
import { useCallback } from "react";

const RevenueCharts = dynamic(
  () => import("./revenue-charts").then(mod => mod.RevenueCharts),
  { loading: () => <SkeletonChart heightClass="h-[280px]" />, ssr: false }
);

/* ─── Page header metrics ────────────────────────────────────────── */

function PageMetrics() {
  const { transactions } = useRevenue();
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const mrr = transactions.length > 0 ? (total / transactions.length) * 30 : 0;
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid).reduce((s, t) => s + t.amount, 0);
  const secondHalf = sorted.slice(mid).reduce((s, t) => s + t.amount, 0);
  const growth = firstHalf ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1) : "0";
  const isPositive = parseFloat(growth) >= 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <motion.div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.06)",
          border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
        }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.15 }}
      >
        <DollarSign size={14} aria-hidden style={{ color: "var(--accent-cyan)" }} />
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          MRR{" "}
          <span className="font-display font-bold" style={{ color: "var(--text-primary)" }}>
            ${mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </span>
      </motion.div>

      <motion.div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: isPositive
            ? "rgba(var(--status-success-rgb) / 0.08)"
            : "rgba(var(--status-error-rgb) / 0.08)",
          border: isPositive
            ? "1px solid rgba(var(--status-success-rgb) / 0.15)"
            : "1px solid rgba(var(--status-error-rgb) / 0.15)",
        }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.22 }}
      >
        <TrendingUp
          size={14}
          aria-hidden
          style={{ color: isPositive ? "var(--status-success)" : "var(--status-error)" }}
        />
        <span
          className="text-sm font-semibold"
          style={{ color: isPositive ? "var(--status-success)" : "var(--status-error)" }}
        >
          {isPositive ? "+" : ""}{growth}% this period
        </span>
      </motion.div>
    </div>
  );
}

/* ─── RevenuePage ────────────────────────────────────────────────── */

export function RevenuePage() {
  const { transactions, isLoading: txLoading } = useRevenue();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const filename = `revenue-${new Date().toISOString().slice(0, 10)}.csv`;
      // Cast transactions to satisfy the strict Record constraint
      downloadCSV(transactions as Record<string, any>[], filename);
    } finally {
      // Small delay so the loading state is perceptible
      setTimeout(() => setIsExporting(false), 600);
    }
  }, [transactions]);

  return (
    <AnimatedPage>
      <AnimatedGroup
        stagger={0.1}
        delayChildren={0.05}
        className="flex flex-col gap-6"
      >
        {/* ── Section 1: Header ───────────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="font-display font-bold"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--text-primary)",
                }}
              >
                Revenue
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Track your earnings, sources, and transaction history.
              </p>
              <div className="mt-3">
                <PageMetrics />
              </div>
            </div>

            {/* Export button */}
            <GlassButton
              variant="ghost"
              size="sm"
              leadingIcon={<Download size={14} />}
              loading={isExporting}
              onClick={() => void handleExport()}
              disabled={txLoading || transactions.length === 0}
              aria-label="Export transactions as CSV"
            >
              Export CSV
            </GlassButton>
          </div>
        </AnimatedItem>

        {/* ── Section 2: Charts ────────────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <RevenueCharts />
        </AnimatedItem>

        {/* ── Section 3: Table + Form ──────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Transactions table — spans 2/3 */}
            <div className="lg:col-span-2">
              <RevenueTable />
            </div>

            {/* Add transaction form — spans 1/3 */}
            <div className="h-fit">
              <TransactionForm />
            </div>
          </div>
        </AnimatedItem>
      </AnimatedGroup>
    </AnimatedPage>
  );
}
