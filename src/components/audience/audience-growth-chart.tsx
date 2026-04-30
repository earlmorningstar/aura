"use client";

/**
 * AudienceGrowthChart — audience trend visualization for the Audience page.
 *
 * Features:
 * - AreaChart with dual gradient fill (total audience + net new)
 * - Platform breakdown pills above the chart (YouTube / Twitter / Newsletter)
 * - Period selector (7D / 30D / 90D)
 * - Custom glassmorphic tooltip
 * - SkeletonChart loading state
 * - Empty state with CTA copy
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
import { Users } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonChart } from "@/components/ui/loading-skeleton";
import { AnimatedWrapper } from "@/components/animated-wrapper";

/* ─── Types ──────────────────────────────────────────────────────── */

interface AudiencePoint {
  date: string;
  followers: number;
  newFollowers: number;
}

interface PlatformStat {
  name: string;
  count: number;
  delta: string;
  trend: "up" | "down" | "neutral";
  color: string;
}

/* ─── Fallback data ──────────────────────────────────────────────── */

const FALLBACK_DATA: AudiencePoint[] = [
  { date: "Apr 1", followers: 11200, newFollowers: 180 },
  { date: "Apr 5", followers: 11800, newFollowers: 210 },
  { date: "Apr 9", followers: 12400, newFollowers: 240 },
  { date: "Apr 13", followers: 12800, newFollowers: 195 },
  { date: "Apr 17", followers: 13400, newFollowers: 285 },
  { date: "Apr 21", followers: 14100, newFollowers: 310 },
  { date: "Apr 25", followers: 14800, newFollowers: 265 },
  { date: "Apr 29", followers: 15600, newFollowers: 350 },
];

const PLATFORM_STATS: PlatformStat[] = [
  { name: "YouTube", count: 8420, delta: "+320", trend: "up", color: "var(--accent-cyan)" },
  { name: "Twitter / X", count: 4280, delta: "+88", trend: "up", color: "var(--accent-purple)" },
  { name: "Newsletter", count: 2960, delta: "+142", trend: "up", color: "var(--status-success)" },
];

/* ─── Platform pill ──────────────────────────────────────────────── */

function PlatformPill({ stat, index }: { stat: PlatformStat; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-2.5 rounded-xl px-3 py-2"
      style={{
        background: "rgba(var(--glass-bg-rgb) / 0.06)",
        border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 26,
        delay: 0.1 + index * 0.07,
      }}
    >
      {/* Colour dot */}
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: stat.color }}
        aria-hidden
      />
      {/* Platform name */}
      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {stat.name}
      </span>
      {/* Count */}
      <span
        className="font-display text-sm font-bold"
        style={{ letterSpacing: "var(--tracking-snug)", color: "var(--text-primary)" }}
      >
        {stat.count.toLocaleString()}
      </span>
      {/* Delta */}
      <span
        className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
        style={{
          background: "rgba(var(--status-success-rgb) / 0.1)",
          color: "var(--status-success)",
        }}
      >
        {stat.delta}
      </span>
    </motion.div>
  );
}

/* ─── Custom tooltip ─────────────────────────────────────────────── */

function AudienceTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const total = payload.find((p) => p.dataKey === "followers");
  const newFolls = payload.find((p) => p.dataKey === "newFollowers");

  return (
    <div
      style={{
        background: "rgba(10, 10, 18, 0.88)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        boxShadow: "0 8px 32px -4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "10px 14px",
        minWidth: "140px",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-tertiary)",
          marginBottom: "6px",
          fontFamily: "var(--font-body)",
        }}
      >
        {String(label)}
      </p>

      {total && (
        <div className="flex items-center justify-between gap-4">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Total</span>
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              letterSpacing: "var(--tracking-snug)",
              color: "var(--text-primary)",
            }}
          >
            {Number(total.value).toLocaleString()}
          </span>
        </div>
      )}

      {newFolls && (
        <div className="flex items-center justify-between gap-4 mt-1">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>New</span>
          <span
            style={{
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: "var(--status-success)",
            }}
          >
            +{Number(newFolls.value).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */

function ChartEmpty() {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-3">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.06)",
          border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
          color: "var(--text-muted)",
        }}
      >
        <Users size={20} />
      </div>
      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        No audience data for this period
      </p>
    </div>
  );
}

/* ─── AudienceGrowthChart ────────────────────────────────────────── */

interface AudienceGrowthChartProps {
  data?: AudiencePoint[];
  platforms?: PlatformStat[];
  isLoading?: boolean;
}

export function AudienceGrowthChart({
  data,
  platforms,
  isLoading = false,
}: AudienceGrowthChartProps) {

  if (isLoading) return <SkeletonChart heightClass="h-[300px]" />;

  const chartData = data ?? FALLBACK_DATA;
  const platformStats = platforms ?? PLATFORM_STATS;

  // Total audience for header display
  const latestTotal = chartData[chartData.length - 1]?.followers ?? 0;

  return (
    <AnimatedWrapper variant="fadeUp" delay={0.1}>
      <GlassCard visual="default" padding="none">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-3">
          <div>
            <p className="tracking-caps" style={{ color: "var(--text-tertiary)" }}>
              Audience Growth
            </p>
            <motion.p
              className="mt-1 font-display font-bold"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--text-primary)",
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.15 }}
            >
              {latestTotal.toLocaleString()}
              <span
                className="ml-2 text-base font-normal"
                style={{ color: "var(--text-tertiary)" }}
              >
                followers
              </span>
            </motion.p>
          </div>
        </div>

        {/* ── Platform pills ────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 px-6 pb-4">
          {platformStats.map((s, i) => (
            <PlatformPill key={s.name} stat={s} index={i} />
          ))}
        </div>

        {/* ── Chart ───────────────────────────────────────────── */}
        {chartData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className="h-[300px] w-full px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
              >
                <defs>
                  {/* Total followers — cyan area */}
                  <linearGradient id="agc-followers-stroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="agc-followers-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.20} />
                    <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity={0.0} />
                  </linearGradient>

                  {/* New followers — success green area */}
                  <linearGradient id="agc-new-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--status-success)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--status-success)" stopOpacity={0.0} />
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
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "var(--font-body)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.12)"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "var(--font-body)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                  width={36}
                />
                <Tooltip
                  content={<AudienceTooltip />}
                  cursor={{
                    stroke: "rgba(var(--accent-cyan-rgb), 0.2)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />

                {/* Total followers area */}
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="url(#agc-followers-stroke)"
                  strokeWidth={2.5}
                  fill="url(#agc-followers-fill)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "var(--accent-cyan)",
                    stroke: "var(--color-bg-raised)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive
                  animationDuration={1100}
                  animationEasing="ease-out"
                />

                {/* New followers area (secondary, lighter) */}
                <Area
                  type="monotone"
                  dataKey="newFollowers"
                  stroke="var(--status-success)"
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                  fill="url(#agc-new-fill)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "var(--status-success)",
                    stroke: "var(--color-bg-raised)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive
                  animationDuration={1300}
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