// import { GlassCard } from "./glass-card";
// import { ReactNode } from "react";

// interface GlassKPIProps {
//   title: string;
//   value: string;
//   change: string;
//   isPositive: boolean; 
//   children?: ReactNode;
// }

// export function GlassKPI({
//   title,
//   value,
//   change,
//   isPositive,
//   children,
// }: GlassKPIProps) {
//   return (
//     <GlassCard className="flex flex-col h-full min-h-[168px] justify-between">
//       <p className="text-sm text-zinc-400">{title}</p>

//       <div className="flex-1 flex flex-col justify-center">
//         <p className="text-3xl lg:text-4xl font-semibold tracking-tighter leading-none">
//           {value}
//         </p>
//       </div>

//       <div className="flex items-center justify-between mt-auto">
//         <span
//           className={`text-sm font-medium flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}
//         >
//           {change}
//         </span>
//         {children}
//       </div>
//     </GlassCard>
//   );
// }


"use client";

/**
 * GlassKPI — metric display card for the Aura dashboard.
 *
 * Features:
 * - Animated number counter on mount (Framer Motion useSpring)
 * - Trend badge with directional arrow icon and colour token
 * - Optional sparkline / chart slot (children)
 * - Skeleton loading state
 * - Stagger-ready entrance animation
 * - All colours from design tokens — zero hardcoded values
 */

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

type TrendDirection = "up" | "down" | "neutral";

export interface GlassKPIProps {
  /** Metric label — shown above the value */
  title: string;
  /**
   * Display value string.
   * If `animateValue` is true and `rawValue` is provided, this becomes
   * the formatted suffix/prefix template (e.g. "$" prefix or "%" suffix).
   * Otherwise rendered as-is.
   */
  value: string;
  /**
   * Raw numeric value for the animated counter.
   * When provided, the counter animates from 0 → rawValue on mount.
   */
  rawValue?: number;
  /** Prefix prepended to the animated number (e.g. "$", "€") */
  prefix?: string;
  /** Suffix appended to the animated number (e.g. "%", "K") */
  suffix?: string;
  /** Formatted delta string (e.g. "+12.4%", "−3.1%") */
  change?: string;
  /**
   * Direction of trend — controls badge colour + icon.
   *   up      → emerald / success
   *   down    → red / error
   *   neutral → muted / secondary
   */
  trend?: TrendDirection;
  /**
   * Context label next to the delta (e.g. "vs last month").
   * Rendered in tertiary text.
   */
  period?: string;
  /**
   * Visual accent for the card.
   *   default → standard glass
   *   cyan    → cyan-tinted (highlight important KPI)
   *   purple  → purple-tinted
   */
  accent?: "default" | "cyan" | "purple";
  /** Whether to play the animated number counter. Default: true */
  animateValue?: boolean;
  /** Entrance animation delay in seconds (for staggered grids). Default: 0 */
  delay?: number;
  /** Loading skeleton state */
  loading?: boolean;
  /** Icon rendered top-right corner */
  icon?: React.ReactNode;
  /** Sparkline or mini-chart rendered below the delta */
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/* ─── Trend config map ───────────────────────────────────────────── */

const trendConfig: Record<
  TrendDirection,
  { Icon: React.ElementType; colorClass: string; bgClass: string; borderClass: string }
> = {
  up: {
    Icon: TrendingUp,
    colorClass:  "text-[rgb(var(--status-success-rgb))]",
    bgClass:     "bg-[rgba(var(--status-success-rgb),0.1)]",
    borderClass: "border-[rgba(var(--status-success-rgb),0.2)]",
  },
  down: {
    Icon: TrendingDown,
    colorClass:  "text-[rgb(var(--status-error-rgb))]",
    bgClass:     "bg-[rgba(var(--status-error-rgb),0.1)]",
    borderClass: "border-[rgba(var(--status-error-rgb),0.2)]",
  },
  neutral: {
    Icon: Minus,
    colorClass:  "text-[rgba(var(--glass-bg-rgb),0.5)]",
    bgClass:     "bg-[rgba(var(--glass-bg-rgb),0.06)]",
    borderClass: "border-[rgba(var(--glass-bg-rgb),0.1)]",
  },
};

/* ─── Animated number counter ────────────────────────────────────── */

interface AnimatedValueProps {
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  /** Decimal places to show. Default: 0 */
  decimals?: number;
}

function AnimatedValue({
  value,
  prefix = "",
  suffix = "",
  delay = 0,
  decimals = 0,
}: AnimatedValueProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString(),
  );
  const [display, setDisplay] = React.useState("0");

  React.useEffect(() => {
    const unsubscribe = rounded.on("change", setDisplay);
    return unsubscribe;
  }, [rounded]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      animate(motionValue, value, {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1], // out-expo — fast start, gentle finish
      });
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay, motionValue]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28, delay }}
    >
      {prefix}
      {display}
      {suffix}
    </motion.span>
  );
}

/* ─── Card entrance variants ─────────────────────────────────────── */

const kpiVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 26,
      mass: 0.8,
      delay,
    },
  }),
};

/* ─── Skeleton subcomponent ──────────────────────────────────────── */

function KPISkeleton({ className }: { className?: string }) {
  return (
    <GlassCard
      visual="default"
      padding="md"
      className={cn("flex min-h-[168px] flex-col justify-between", className)}
    >
      {/* Label */}
      <div className="skeleton h-3 w-24 rounded" />
      {/* Value */}
      <div className="my-4 skeleton h-10 w-32 rounded" />
      {/* Delta */}
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </GlassCard>
  );
}

/* ─── Accent → visual map ────────────────────────────────────────── */

const accentToVisual = {
  default: "default",
  cyan:    "cyan",
  purple:  "purple",
} as const;

/* ─── Main component ─────────────────────────────────────────────── */

/**
 * GlassKPI
 *
 * @example Basic revenue KPI
 * <GlassKPI
 *   title="Monthly Revenue"
 *   value="$0"
 *   rawValue={24850}
 *   prefix="$"
 *   change="+12.4%"
 *   trend="up"
 *   period="vs last month"
 *   delay={0.1}
 * />
 *
 * @example With sparkline
 * <GlassKPI title="Subscribers" value="0" rawValue={4820} suffix="K" trend="up" change="+8.2%">
 *   <Sparkline data={audienceData} />
 * </GlassKPI>
 *
 * @example Loading
 * <GlassKPI loading title="Revenue" value="—" />
 */
export function GlassKPI({
  title,
  value,
  rawValue,
  prefix = "",
  suffix = "",
  change,
  trend = "neutral",
  period,
  accent = "default",
  animateValue = true,
  delay = 0,
  loading = false,
  icon,
  children,
  className,
  onClick,
}: GlassKPIProps) {
  if (loading) {
    return <KPISkeleton className={className} />;
  }

  const { Icon, colorClass, bgClass, borderClass } = trendConfig[trend];
  const showCounter = animateValue && rawValue !== undefined;
  const visual = accentToVisual[accent];

  return (
    <motion.div
      variants={kpiVariants}
      custom={delay}
      initial="hidden"
      animate="visible"
      className={cn("h-full", className)}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <GlassCard
        visual={visual}
        padding="md"
        className="flex h-full min-h-[168px] flex-col justify-between"
        // Pass interactive via spread only when onClick provided — avoids motion conflicts
        {...(onClick ? { interactive: true } : {})}
      >
        {/* ── Row 1: Label + Icon ─────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <p className="tracking-caps" style={{ color: "var(--text-tertiary)" }}>
            {title}
          </p>
          {icon && (
            <motion.div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: "rgba(var(--glass-bg-rgb) / 0.08)",
                border: "1px solid rgba(var(--glass-border-rgb) / 0.1)",
                color: "var(--text-secondary)",
              }}
              whileHover={{ scale: 1.1, transition: { type: "spring", stiffness: 500, damping: 20 } }}
            >
              <span className="[&>svg]:size-4">{icon}</span>
            </motion.div>
          )}
        </div>

        {/* ── Row 2: Metric value ─────────────────────────── */}
        <div
          className="my-2 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none"
          style={{
            letterSpacing: "var(--tracking-tight)",
            color: "var(--text-primary)",
          }}
        >
          {showCounter ? (
            <AnimatedValue
              value={rawValue!}
              prefix={prefix}
              suffix={suffix}
              delay={delay + 0.1}
              decimals={rawValue! % 1 !== 0 ? 1 : 0}
            />
          ) : (
            <span>{value}</span>
          )}
        </div>

        {/* ── Row 3: Delta + Period + Optional chart ──────── */}
        <div className="mt-auto flex flex-col gap-2">
          {change && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Delta badge */}
              <motion.span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                  "text-xs font-semibold",
                  colorClass,
                  bgClass,
                  borderClass,
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 22,
                  delay: delay + 0.25,
                }}
              >
                <Icon size={11} strokeWidth={2.5} aria-hidden />
                {change}
              </motion.span>

              {/* Period context */}
              {period && (
                <motion.span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.35, duration: 0.3 }}
                >
                  {period}
                </motion.span>
              )}
            </div>
          )}

          {/* Sparkline / mini-chart slot */}
          {children && (
            <motion.div
              className="mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4, duration: 0.4 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}