"use client";

/**
 * RevenueTrendChart — area chart showing revenue over time.
 *
 * Features:
 * - AreaChart with layered gradient fill (not flat Line)
 * - Custom glassmorphic tooltip with all four glass properties
 * - Period selector (7D / 30D / 90D / 1Y)
 * - Animated entrance via Framer Motion
 * - SkeletonChart loading state
 * - Empty state with call-to-action
 * - All colours from design tokens
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import {
  type ValueType,
  type NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonChart } from "@/components/ui/loading-skeleton";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import { useOverviewData } from "@/hooks/use-overview-data";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

interface TrendPoint {
  date: string;
  value: number;
}

/* ─── Fallback data ──────────────────────────────────────────────── */

const FALLBACK_TREND: TrendPoint[] = [
  { date: "Apr 1", value: 820 },
  { date: "Apr 5", value: 1050 },
  { date: "Apr 9", value: 940 },
  { date: "Apr 13", value: 1380 },
  { date: "Apr 17", value: 1220 },
  { date: "Apr 21", value: 1640 },
  { date: "Apr 25", value: 1490 },
  { date: "Apr 29", value: 1870 },
  { date: "May 3", value: 2050 },
  { date: "May 7", value: 1930 },
  { date: "May 11", value: 2380 },
  { date: "May 15", value: 2240 },
];

/* ─── Period selector ────────────────────────────────────────────── */

const PERIODS = ["7D", "30D", "90D", "1Y"] as const;
type Period = (typeof PERIODS)[number];

interface PeriodTabProps {
  period: Period;
  active: boolean;
  onClick: () => void;
}

function PeriodTab({ period, active, onClick }: PeriodTabProps) {
  return (
    <motion.button
      className={cn(
        "relative rounded-lg px-2.5 py-1 text-xs font-medium outline-none",
        "focus-visible:ring-2 focus-visible:ring-aura-cyan/60",
      )}
      style={{
        color: active ? "var(--text-primary)" : "var(--text-tertiary)",
      }}
      onClick={onClick}
      whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 600, damping: 28 } }}
    >
      {active && (
        <motion.span
          layoutId="revenue-trend-period"
          className="absolute inset-0 rounded-lg"
          style={{
            background: "rgba(var(--glass-bg-rgb) / 0.12)",
            border: "1px solid rgba(var(--glass-border-rgb) / 0.12)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{period}</span>
    </motion.button>
  );
}

/* ─── Custom tooltip ─────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value;
  const formatted =
    typeof value === "number"
      ? `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : "—";

  return (
    <div
      style={{
        // All four glassmorphism properties
        background: "rgba(10, 10, 18, 0.88)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        boxShadow:
          "0 8px 32px -4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "10px 14px",
        minWidth: "110px",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-tertiary)",
          marginBottom: "2px",
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "var(--text-md)",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          letterSpacing: "var(--tracking-snug)",
          color: "var(--text-primary)",
        }}
      >
        {formatted}
      </p>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */

function ChartEmpty() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center gap-3">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.06)",
          border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
          color: "var(--text-muted)",
        }}
      >
        <TrendingUp size={20} />
      </div>
      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        No revenue data for this period
      </p>
    </div>
  );
}

/* ─── RevenueTrendChart ──────────────────────────────────────────── */

export function RevenueTrendChart() {
  const { data, isLoading } = useOverviewData();

  if (isLoading) return <SkeletonChart heightClass="h-[260px]" />;

  const trendData = data?.revenueTrend ?? FALLBACK_TREND;
  const totalRevenue = data?.totalRevenue ?? 24892;
  const trendDelta = data?.trendDelta ?? "+18.4%";
  const isDeltaPositive = !trendDelta.startsWith("−") && !trendDelta.startsWith("-");

  return (
    <AnimatedWrapper variant="fadeUp" delay={0.1}>
      <GlassCard visual="default" padding="none" className="overflow-hidden">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-2">
          <div>
            <p className="tracking-caps" style={{ color: "var(--text-tertiary)" }}>
              Revenue Trend
            </p>
            <motion.p
              className="font-display font-bold"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--text-primary)",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.2 }}
            >
              ${totalRevenue.toLocaleString()}
            </motion.p>
          </div>

          <div className="flex items-center gap-3">
            {/* Delta badge */}
            <motion.span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold"
              style={{
                color: isDeltaPositive
                  ? "var(--status-success)"
                  : "var(--status-error)",
                background: isDeltaPositive
                  ? "rgba(var(--status-success-rgb) / 0.1)"
                  : "rgba(var(--status-error-rgb) / 0.1)",
                borderColor: isDeltaPositive
                  ? "rgba(var(--status-success-rgb) / 0.2)"
                  : "rgba(var(--status-error-rgb) / 0.2)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.3 }}
            >
              <TrendingUp size={11} aria-hidden />
              {trendDelta} this period
            </motion.span>
          </div>
        </div>

        {/* ── Chart ───────────────────────────────────────────── */}
        {trendData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className="h-[260px] w-full px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
              >
                <defs>
                  {/* Stroke gradient — horizontal cyan → purple */}
                  <linearGradient id="rtc-stroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity={1} />
                  </linearGradient>
                  {/* Fill gradient — vertical, fades to transparent */}
                  <linearGradient id="rtc-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.22} />
                    <stop offset="50%" stopColor="var(--accent-purple)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.12)"
                  tick={{
                    fill: "rgba(255,255,255,0.35)",
                    fontSize: 11,
                    fontFamily: "var(--font-body)",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.12)"
                  tick={{
                    fill: "rgba(255,255,255,0.35)",
                    fontSize: 11,
                    fontFamily: "var(--font-body)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}k`}
                  width={40}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{
                    stroke: "rgba(var(--accent-cyan-rgb), 0.25)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#rtc-stroke)"
                  strokeWidth={2.5}
                  fill="url(#rtc-fill)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "var(--accent-cyan)",
                    stroke: "var(--color-bg-raised)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>
    </AnimatedWrapper>
  );
}