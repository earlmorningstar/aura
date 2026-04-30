// export function Sparkline({ trend }: { trend: 'up' | 'down' }) {
//   const color = trend === 'up' ? '#10b981' : '#ef4444';
//   const path = trend === 'up'
//     ? 'M2 18 L8 12 L14 15 L22 4'
//     : 'M2 4 L8 10 L14 7 L22 18';

//   return (
//     <svg width="72" height="24" viewBox="0 0 24 22" fill="none" className="opacity-70">
//       <path d={path} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }


"use client";

/**
 * Sparkline — mini trend indicator for KPI cards and tables.
 *
 * Two modes:
 *   1. `trend` prop  — renders a pre-baked up/down/neutral bezier path
 *   2. `data` prop   — renders a data-driven polyline from an array of numbers
 *
 * Both modes support:
 * - Gradient stroke (cyan → purple for up, muted for neutral, red for down)
 * - Semi-transparent gradient fill under the line
 * - Entrance animation via Framer Motion path-length draw
 * - Design-token colours only — zero magic hex values
 */

import * as React from "react";
import { motion } from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────────── */

export type SparklineTrend = "up" | "down" | "neutral";

interface SparklineBaseProps {
  /** Width of the SVG canvas. Default: 72 */
  width?: number;
  /** Height of the SVG canvas. Default: 28 */
  height?: number;
  /** Animate the path drawing on mount. Default: true */
  animate?: boolean;
  /** Additional className */
  className?: string;
}

interface SparklineTrendProps extends SparklineBaseProps {
  /** Pre-baked trend direction — used in KPI cards */
  trend: SparklineTrend;
  data?: never;
}

interface SparklineDataProps extends SparklineBaseProps {
  /** Array of numeric data points — rendered as a polyline */
  data: number[];
  trend?: never;
}

export type SparklineProps = SparklineTrendProps | SparklineDataProps;

/* ─── Colour tokens per trend ────────────────────────────────────── */

interface TrendColour {
  stroke1: string;   // gradient start (left)
  stroke2: string;   // gradient end (right)
  fill1: string;     // fill top opacity
  fill2: string;     // fill bottom opacity
}

const TREND_COLOURS: Record<SparklineTrend, TrendColour> = {
  up: {
    stroke1: "var(--accent-cyan)",
    stroke2: "var(--accent-purple)",
    fill1:   "rgba(0, 245, 255, 0.18)",
    fill2:   "rgba(168, 85, 247, 0.0)",
  },
  down: {
    stroke1: "rgba(239, 68, 68, 0.9)",
    stroke2: "rgba(239, 68, 68, 0.5)",
    fill1:   "rgba(239, 68, 68, 0.12)",
    fill2:   "rgba(239, 68, 68, 0.0)",
  },
  neutral: {
    stroke1: "rgba(255, 255, 255, 0.25)",
    stroke2: "rgba(255, 255, 255, 0.15)",
    fill1:   "rgba(255, 255, 255, 0.06)",
    fill2:   "rgba(255, 255, 255, 0.0)",
  },
};

/* ─── Pre-baked trend paths ──────────────────────────────────────── */
// Each path is drawn in a 72×28 viewBox.
// "up"      → dip early, then accelerating rise toward top-right
// "down"    → rise early, then declining fall toward bottom-right
// "neutral" → gentle wave staying mid-line

const TREND_PATHS: Record<SparklineTrend, { line: string; area: string }> = {
  up: {
    line: "M1 22 C8 20 14 18 20 16 C26 14 34 12 42 9 C50 6 60 4 71 2",
    area: "M1 22 C8 20 14 18 20 16 C26 14 34 12 42 9 C50 6 60 4 71 2 L71 28 L1 28 Z",
  },
  down: {
    line: "M1 4 C8 5 14 7 20 9 C26 11 34 15 42 18 C50 21 60 23 71 25",
    area: "M1 4 C8 5 14 7 20 9 C26 11 34 15 42 18 C50 21 60 23 71 25 L71 28 L1 28 Z",
  },
  neutral: {
    line: "M1 14 C10 12 18 16 28 14 C38 12 46 16 56 14 C62 13 67 14 71 14",
    area: "M1 14 C10 12 18 16 28 14 C38 12 46 16 56 14 C62 13 67 14 71 14 L71 28 L1 28 Z",
  },
};

/* ─── Data-driven path computation ──────────────────────────────── */

/**
 * Converts an array of numbers into SVG path commands inside a given canvas.
 * Returns both the stroke `line` path and the closed `area` path for fill.
 */
function computeDataPath(
  data: number[],
  w: number,
  h: number,
  padding = 2,
): { line: string; area: string; trend: SparklineTrend } {
  if (data.length < 2) {
    return { ...TREND_PATHS.neutral, trend: "neutral" };
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (w - padding * 2),
    y: h - padding - ((v - min) / range) * (h - padding * 2),
  }));

  // Build smooth bezier via control points
  const lineParts: string[] = [`M${points[0]!.x.toFixed(1)} ${points[0]!.y.toFixed(1)}`];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const cpX = (prev.x + curr.x) / 2;
    lineParts.push(`C${cpX.toFixed(1)} ${prev.y.toFixed(1)} ${cpX.toFixed(1)} ${curr.y.toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`);
  }

  const linePath = lineParts.join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]!.x.toFixed(1)} ${h} L${points[0]!.x.toFixed(1)} ${h} Z`;

  // Infer trend from first → last value
  const first = data[0] ?? 0;
  const last  = data[data.length - 1] ?? 0;
  const inferredTrend: SparklineTrend =
    last > first * 1.01 ? "up" : last < first * 0.99 ? "down" : "neutral";

  return { line: linePath, area: areaPath, trend: inferredTrend };
}

/* ─── Sparkline component ────────────────────────────────────────── */

/**
 * Sparkline
 *
 * @example Trend mode (KPI card)
 * <Sparkline trend="up" height={32} />
 *
 * @example Data mode
 * <Sparkline data={[120, 145, 132, 168, 155, 190]} height={40} />
 */
export function Sparkline({
  width = 72,
  height = 28,
  animate = true,
  className,
  ...props
}: SparklineProps) {
  // Unique ID per instance to namespace SVG gradients
  const uid = React.useId().replace(/:/g, "");

  let linePath: string;
  let areaPath: string;
  let trend: SparklineTrend;

  if ("data" in props && props.data) {
    const computed = computeDataPath(props.data, width, height);
    linePath  = computed.line;
    areaPath  = computed.area;
    trend     = computed.trend;
  } else {
    trend     = (props as SparklineTrendProps).trend ?? "neutral";
    // Scale the pre-baked 72×28 paths to the requested dimensions
    linePath  = TREND_PATHS[trend].line;
    areaPath  = TREND_PATHS[trend].area;
  }

  const colours = TREND_COLOURS[trend];
  const strokeGradId = `spark-stroke-${uid}`;
  const fillGradId   = `spark-fill-${uid}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      aria-hidden="true"
      role="presentation"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Horizontal stroke gradient */}
        <linearGradient id={strokeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={colours.stroke1} />
          <stop offset="100%" stopColor={colours.stroke2} />
        </linearGradient>

        {/* Vertical fill gradient */}
        <linearGradient id={fillGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={colours.fill1} />
          <stop offset="100%" stopColor={colours.fill2} />
        </linearGradient>
      </defs>

      {/* ── Area fill (behind line) ──────────────────────────── */}
      <motion.path
        d={areaPath}
        fill={`url(#${fillGradId})`}
        initial={animate ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />

      {/* ── Stroke line (on top) ─────────────────────────────── */}
      <motion.path
        d={linePath}
        stroke={`url(#${strokeGradId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: {
            type: "spring",
            stiffness: 60,
            damping: 20,
            duration: 1.2,
          },
          opacity: { duration: 0.2 },
        }}
      />
    </svg>
  );
}