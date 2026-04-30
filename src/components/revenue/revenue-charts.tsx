"use client";

/**
 * RevenueCharts — dual-panel chart section for the Revenue page.
 *
 * Panel A — Daily Revenue (BarChart):
 *   gradient bars, CartesianGrid, custom tooltip, animation
 *
 * Panel B — Revenue by Source (Donut PieChart):
 *   innerRadius donut, center total label, custom tooltip, legend
 *
 * Both panels: design-token colors, glassmorphic tooltips, SkeletonChart
 * loading states, empty states, AnimatedWrapper entrance.
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  type TooltipProps,
} from "recharts";
import {
  type ValueType,
  type NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonChart } from "@/components/ui/loading-skeleton";
import { AnimatedWrapper, AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { useRevenueData } from "@/hooks/use-revenue-data";

/* ─── Types ──────────────────────────────────────────────────────── */

interface DailyPoint {
  name: string;
  revenue: number;
}

interface SourcePoint {
  name: string;
  value: number;
  color: string;
}

/* ─── Design token colours for series ───────────────────────────── */
// These CSS variables are defined in design-tokens.css and always present.

const SOURCE_PALETTE = [
  "var(--accent-cyan)",
  "var(--accent-purple)",
  "var(--status-success)",
  "var(--accent-amber)",
  "var(--accent-pink)",
] as const;

/* ─── Fallback data ──────────────────────────────────────────────── */

const FALLBACK_DAILY: DailyPoint[] = [
  { name: "Apr 12", revenue: 820 },
  { name: "Apr 13", revenue: 940 },
  { name: "Apr 14", revenue: 1100 },
  { name: "Apr 15", revenue: 980 },
  { name: "Apr 16", revenue: 1350 },
  { name: "Apr 17", revenue: 1420 },
  { name: "Apr 18", revenue: 1180 },
  { name: "Apr 19", revenue: 1560 },
];

const FALLBACK_SOURCES: SourcePoint[] = [
  { name: "Stripe",    value: 45, color: SOURCE_PALETTE[0] },
  { name: "Gumroad",   value: 32, color: SOURCE_PALETTE[1] },
  { name: "Affiliate", value: 23, color: SOURCE_PALETTE[2] },
];

/* ─── Shared: glassmorphic tooltip ───────────────────────────────── */

interface TooltipData {
  label?: string;
  items: Array<{ name: string; value: string; color?: string }>;
}

function GlassTooltipContent({ label, items }: TooltipData) {
  return (
    <div
      style={{
        background: "rgba(10, 10, 18, 0.88)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        boxShadow:
          "0 8px 32px -4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "10px 14px",
        minWidth: "130px",
      }}
    >
      {label && (
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-tertiary)",
            marginBottom: "6px",
            fontFamily: "var(--font-body)",
          }}
        >
          {label}
        </p>
      )}
      {items.map((item) => (
        <div
          key={item.name}
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}
        >
          {item.color && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.color,
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              letterSpacing: "var(--tracking-snug)",
              color: "var(--text-primary)",
            }}
          >
            {item.value}
          </span>
          {item.color && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginLeft: "auto" }}>
              {item.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Bar chart tooltip ──────────────────────────────────────────── */

function BarTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const raw = payload[0]?.value;
  const val = typeof raw === "number" ? `$${raw.toLocaleString()}` : "—";
  return (
    <GlassTooltipContent
      label={String(label)}
      items={[{ name: "Revenue", value: val }]}
    />
  );
}

/* ─── Pie chart tooltip ──────────────────────────────────────────── */

function PieTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  if (!entry) return null;
  return (
    <GlassTooltipContent
      items={[{
        name: String(entry.name),
        value: `${entry.value}%`,
        color: String(entry.payload?.color ?? SOURCE_PALETTE[0]),
      }]}
    />
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */

function ChartEmpty({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-3">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.06)",
          border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
          color: "var(--text-muted)",
        }}
      >
        <Icon size={20} />
      </div>
      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        No data available
      </p>
    </div>
  );
}

/* ─── Donut center label ─────────────────────────────────────────── */

interface DonutCenterProps {
  cx?: number;
  cy?: number;
  total: number;
}

function DonutCenterLabel({ cx = 0, cy = 0, total }: DonutCenterProps) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize={11}
        fontFamily="var(--font-body)"
      >
        Total
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.92)"
        fontSize={22}
        fontWeight={700}
        fontFamily="var(--font-display)"
        letterSpacing="-0.03em"
      >
        100%
      </text>
    </g>
  );
}

/* ─── Source legend ──────────────────────────────────────────────── */

function SourceLegend({ sources }: { sources: SourcePoint[] }) {
  return (
    <div className="flex flex-col gap-2.5 pt-2">
      {sources.map((s, i) => (
        <motion.div
          key={s.name}
          className="flex items-center justify-between gap-3"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.4 + i * 0.07 }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {s.name}
            </span>
          </div>
          <span
            className="font-display text-sm font-bold"
            style={{ color: "var(--text-primary)", letterSpacing: "var(--tracking-snug)" }}
          >
            {s.value}%
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Panel A: Daily revenue bar chart ───────────────────────────── */

interface DailyRevChartProps {
  data: DailyPoint[];
}

function DailyRevenueChart({ data }: DailyRevChartProps) {
  return (
    <GlassCard visual="default" padding="none">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div>
          <p className="tracking-caps" style={{ color: "var(--text-tertiary)" }}>
            Daily Revenue
          </p>
          <p
            className="mt-1 font-display text-xl font-bold"
            style={{ letterSpacing: "var(--tracking-tight)", color: "var(--text-primary)" }}
          >
            Last 8 days
          </p>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: "rgba(var(--accent-cyan-rgb) / 0.1)",
            border: "1px solid rgba(var(--accent-cyan-rgb) / 0.15)",
            color: "var(--accent-cyan)",
          }}
          aria-hidden
        >
          <BarChart2 size={16} />
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <ChartEmpty icon={BarChart2} />
      ) : (
        <div className="h-[280px] w-full px-3 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 4, bottom: 0, left: -12 }}
              barCategoryGap="30%"
            >
              <defs>
                <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--accent-cyan)"   stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
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
                tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                width={44}
              />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }}
              />
              <Bar
                dataKey="revenue"
                fill="url(#bar-gradient)"
                radius={[6, 6, 0, 0]}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}

/* ─── Panel B: Revenue by source donut ──────────────────────────── */

interface SourceChartProps {
  data: SourcePoint[];
}

function RevenueSourceChart({ data }: SourceChartProps) {
  return (
    <GlassCard visual="default" padding="none">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div>
          <p className="tracking-caps" style={{ color: "var(--text-tertiary)" }}>
            Revenue by Source
          </p>
          <p
            className="mt-1 font-display text-xl font-bold"
            style={{ letterSpacing: "var(--tracking-tight)", color: "var(--text-primary)" }}
          >
            Breakdown
          </p>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: "rgba(var(--accent-purple-rgb) / 0.1)",
            border: "1px solid rgba(var(--accent-purple-rgb) / 0.15)",
            color: "var(--accent-purple)",
          }}
          aria-hidden
        >
          <PieChartIcon size={16} />
        </div>
      </div>

      {/* Donut + legend */}
      {data.length === 0 ? (
        <ChartEmpty icon={PieChartIcon} />
      ) : (
        <div className="flex flex-col gap-4 px-6 pb-6">
          {/* Donut */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {data.map((s, i) => (
                    <filter key={`glow-${i}`} id={`pie-glow-${i}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  ))}
                </defs>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={3}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                  labelLine={false}
                >
                  {data.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={entry.color}
                      stroke="transparent"
                      style={{ filter: `drop-shadow(0 0 6px ${entry.color}66)` }}
                    />
                  ))}
                  <DonutCenterLabel total={100} />
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <SourceLegend sources={data} />
        </div>
      )}
    </GlassCard>
  );
}

/* ─── RevenueCharts ──────────────────────────────────────────────── */

export function RevenueCharts() {
  const { data, isLoading } = useRevenueData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SkeletonChart heightClass="h-[280px]" />
        </div>
        <div className="lg:col-span-4">
          <SkeletonChart heightClass="h-[280px]" showAxis={false} />
        </div>
      </div>
    );
  }

  // Merge real data over fallbacks
  const dailyData: DailyPoint[] = data?.dailyRevenue ?? FALLBACK_DAILY;
  const sourceData: SourcePoint[] = (data?.sourceBreakdown ?? FALLBACK_SOURCES).map(
    (s, i) => ({
      ...s,
      color: SOURCE_PALETTE[i % SOURCE_PALETTE.length] ?? SOURCE_PALETTE[0],
    }),
  ) as SourcePoint[];

  return (
    <AnimatedGroup stagger={0.1} delayChildren={0.05}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <AnimatedItem variant="fadeUp" className="lg:col-span-8">
          <DailyRevenueChart data={dailyData} />
        </AnimatedItem>
        <AnimatedItem variant="fadeUp" className="lg:col-span-4">
          <RevenueSourceChart data={sourceData} />
        </AnimatedItem>
      </div>
    </AnimatedGroup>
  );
}