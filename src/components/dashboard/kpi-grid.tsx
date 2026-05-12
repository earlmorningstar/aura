"use client";

/**
 * KPIGrid — 6-card metric overview for the dashboard.
 *
 * Data:
 * - Wired to useOverviewData() hook (React Query)
 * - Falls back to skeleton if data is still loading
 * - Each card has a rawValue for the animated counter
 *
 * Layout:
 * - Mobile:  1 column (stacked, full width)
 * - md:      2 columns (tablet)
 * - lg:      3 columns (desktop — the target “3-per-row” layout)
 *
 * Animation:
 * - AnimatedGroup with stagger so cards cascade in from left→right
 * - Each GlassKPI has a matching `delay` so the counter fires in sequence
 */

import * as React from "react";
import { DollarSign, TrendingUp, Users, Zap, Star, Target } from "lucide-react";
import { GlassKPI } from "@/components/ui/glass-kpi";
import { AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { SkeletonKPI } from "@/components/ui/loading-skeleton";
import { Sparkline } from "@/components/common/sparkline";
import { useOverviewData } from "@/hooks/use-overview-data";

/* ─── KPI config type ────────────────────────────────────────────── */

interface KPIConfig {
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

/* ─── Static fallback (used only if overview is still undefined) ──── */

const FALLBACK_KPIS: KPIConfig[] = [
  {
    title: "Total Revenue",
    value: "$14,892",
    rawValue: 14892,
    prefix: "$",
    change: "+18.4%",
    trend: "up",
    period: "vs last month",
    accent: "cyan",
    icon: <DollarSign size={15} />,
  },
  {
    title: "MRR",
    value: "$3,240",
    rawValue: 3240,
    prefix: "$",
    change: "+4.2%",
    trend: "up",
    period: "vs last month",
    accent: "default",
    icon: <TrendingUp size={15} />,
  },
  {
    title: "Audience Growth",
    value: "+1,284",
    rawValue: 1284,
    prefix: "+",
    change: "+12%",
    trend: "up",
    period: "new followers",
    accent: "default",
    icon: <Users size={15} />,
  },
  {
    title: "Avg. Engagement",
    value: "4.8%",
    rawValue: 4.8,
    suffix: "%",
    change: "−2.1%",
    trend: "down",
    period: "vs last month",
    accent: "default",
    icon: <Zap size={15} />,
  },
  {
    title: "Top Content Rev.",
    value: "$2,840",
    rawValue: 2840,
    prefix: "$",
    change: "+31%",
    trend: "up",
    period: "best piece",
    accent: "purple",
    icon: <Star size={15} />,
  },
  {
    title: "Productivity",
    value: "92",
    rawValue: 92,
    suffix: "/100",
    change: "+7",
    trend: "up",
    period: "score",
    accent: "default",
    icon: <Target size={15} />,
  },
];

/* ─── KPIGrid ────────────────────────────────────────────────────── */

export function KPIGrid() {
  const overview = useOverviewData();

  if (!overview) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonKPI key={i} />
        ))}
      </div>
    );
  }

  const kpis: KPIConfig[] = overview.kpis ?? FALLBACK_KPIS;

  return (
    <AnimatedGroup
      stagger={0.06}
      delayChildren={0.05}
      className="grid grid-cols-2 gap-4 lg:grid-cols-3"
    >
      {kpis.map((kpi, i) => (
        <AnimatedItem key={kpi.title} variant="fadeUp" distance={12}>
          <div className="h-full">
            <GlassKPI
              title={kpi.title}
              value={kpi.value}
              rawValue={kpi.rawValue}
              prefix={kpi.prefix}
              suffix={kpi.suffix}
              change={kpi.change}
              trend={kpi.trend}
              period={kpi.period}
              accent={kpi.accent ?? "default"}
              animateValue
              delay={i * 0.06}
              icon={kpi.icon}
            >
              <Sparkline trend={kpi.trend} height={32} />
            </GlassKPI>
          </div>
        </AnimatedItem>
      ))}
    </AnimatedGroup>
  );
}