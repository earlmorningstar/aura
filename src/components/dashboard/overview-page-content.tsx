"use client";

/**
 * OverviewPageContent — orchestrates the dashboard layout.
 *
 * Responsibilities:
 * - Coordinate loading state across all dashboard sections
 * - Render the responsive section grid
 * - Provide staggered entrance animation for the entire dashboard
 * - Handle top-level error state
 *
 * Data flows down from useOverviewData → child sections.
 * Each child section also manages its own granular loading/error state.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { KPIGrid } from "./kpi-grid";
import dynamic from "next/dynamic";
import { AISummaryCard } from "./ai-summary-card";
import { AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { SkeletonDashboard, SkeletonChart } from "@/components/ui/loading-skeleton";
import { GlassButton } from "@/components/ui/glass-button";
import { useOverviewData } from "@/hooks/use-overview-data";
import { useDateRangeStore } from "@/stores/date-range-store";
import { differenceInDays } from "date-fns";

const RevenueTrendChart = dynamic(
  () => import("@/components/charts/revenue-trend-chart").then(mod => mod.RevenueTrendChart),
  { loading: () => <SkeletonChart heightClass="h-[260px]" />, ssr: false }
);

/* ─── Section label ──────────────────────────────────────────────── */

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}


function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2
          className="font-display font-semibold"
          style={{
            fontSize: "var(--text-lg)",
            letterSpacing: "var(--tracking-snug)",
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="mt-0.5 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ─── Error state ────────────────────────────────────────────────── */

interface DashboardErrorProps {
  message?: string;
  onRetry?: () => void;
}

function DashboardError({
  message = "Failed to load dashboard data.",
  onRetry,
}: DashboardErrorProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 py-24 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(var(--status-error-rgb) / 0.1)",
          border: "1px solid rgba(var(--status-error-rgb) / 0.2)",
        }}
      >
        <AlertCircle
          size={24}
          style={{ color: "rgb(var(--status-error-rgb))" }}
        />
      </div>
      <div>
        <p
          className="font-display font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Something went wrong
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <GlassButton
          variant="ghost"
          size="sm"
          leadingIcon={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          Retry
        </GlassButton>
      )}
    </motion.div>
  );
}

/* ─── Quick stats row (bottom) ───────────────────────────────────── */

function QuickStatsRow() {
  const stats = [
    { label: "Active subscribers", value: "4,820", unit: "" },
    { label: "Content pieces live", value: "38", unit: "" },
    { label: "Avg. revenue per post", value: "$74.5", unit: "" },
    { label: "Est. next payout", value: "$3,400", unit: "" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="glass rounded-xl px-4 py-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 28,
            delay: 0.6 + i * 0.06,
          }}
        >
          <p className="tracking-caps" style={{ color: "var(--text-muted)" }}>
            {stat.label}
          </p>
          <p
            className="mt-1 font-display text-lg font-bold"
            style={{
              letterSpacing: "var(--tracking-tight)",
              color: "var(--text-primary)",
            }}
          >
            {stat.value}
            {stat.unit && (
              <span
                className="ml-1 text-xs font-normal"
                style={{ color: "var(--text-tertiary)" }}
              >
                {stat.unit}
              </span>
            )}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── OverviewPageContent ────────────────────────────────────────── */

export function OverviewPageContent() {
  const { startDate, endDate } = useDateRangeStore();
  const days = differenceInDays(endDate, startDate);
  const { isLoading, isError, refetch } = useOverviewData();

  // Full-page skeleton while initial data loads
  if (isLoading) {
    return <SkeletonDashboard kpiCount={6} />;
  }

  // Top-level error state
  if (isError) {
    return (
      <DashboardError
        message="We couldn't load your analytics. Check your connection and try again."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <AnimatedGroup stagger={0.08} delayChildren={0.1}>
      {/* ── Section 1: KPI cards ─────────────────────────────── */}
      <AnimatedItem variant="fadeUp">
        <SectionHeader
          title="Key Metrics"
          subtitle={`Last ${days} days`}
        />
        <KPIGrid />
      </AnimatedItem>

      {/* ── Section 2: Revenue trend + AI summary ────────────── */}
      <AnimatedItem variant="fadeUp">
        <div className="mt-8">
          <SectionHeader
            title="Performance Overview"
            subtitle="Revenue trends and AI insights"
          />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Revenue chart — spans 8/12 on desktop */}
            <div className="lg:col-span-8">
              <RevenueTrendChart />
            </div>

            {/* AI summary — spans 4/12 on desktop */}
            <div className="lg:col-span-4">
              <AISummaryCard />
            </div>
          </div>
        </div>
      </AnimatedItem>

      {/* ── Section 3: Quick stats strip ─────────────────────── */}
      <AnimatedItem variant="fadeUp">
        <div className="mt-8">
          <SectionHeader
            title="At a Glance"
            subtitle="Current period snapshots"
          />
          <QuickStatsRow />
        </div>
      </AnimatedItem>
    </AnimatedGroup>
  );
}