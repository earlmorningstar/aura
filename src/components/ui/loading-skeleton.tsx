// export function Skeleton({ className }: { className?: string }) {
//   return <div className={`animate-pulse bg-white/10 rounded-3xl ${className}`} />;
// }


"use client";

/**
 * Loading Skeleton — composable skeleton system for Aura.
 *
 * Uses a shimmer wave (not pulse) for a more premium feel.
 * All shapes are composable and accept className for custom sizing.
 *
 * Exported shapes:
 *   Skeleton       — base primitive (any shape)
 *   SkeletonText   — single or multi-line text block
 *   SkeletonKPI    — matches GlassKPI card dimensions
 *   SkeletonChart  — chart placeholder with axis lines
 *   SkeletonTable  — table rows placeholder
 *   SkeletonAvatar — circular avatar
 *   SkeletonCard   — generic card with title + body lines
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Base primitive ─────────────────────────────────────────────── */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Override border radius. Defaults to rounded-lg */
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const roundedMap = {
  none:  "rounded-none",
  sm:    "rounded-sm",
  md:    "rounded-md",
  lg:    "rounded-lg",
  xl:    "rounded-xl",
  "2xl": "rounded-2xl",
  full:  "rounded-full",
} as const;

/**
 * Base skeleton — apply width + height via className.
 *
 * Uses the shimmer wave from globals.css `.skeleton` utility class which
 * animates background-position, not opacity (avoids layout reflow).
 */
export function Skeleton({
  className,
  rounded = "lg",
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading…"
      className={cn(
        "skeleton",           // shimmer wave from globals.css
        roundedMap[rounded],
        "min-h-[8px]",        // prevent zero-height collapse
        className,
      )}
      {...props}
    />
  );
}

/* ─── Text skeleton ──────────────────────────────────────────────── */

export interface SkeletonTextProps {
  /** Number of lines. Default: 3 */
  lines?: number;
  /** Shorten last line to simulate natural prose. Default: true */
  shortLastLine?: boolean;
  /** className applied to the container */
  className?: string;
  /** Gap between lines. Default: gap-2 */
  gapClass?: string;
}

/**
 * SkeletonText — simulates a paragraph or label block.
 *
 * @example
 * <SkeletonText lines={2} shortLastLine />
 */
export function SkeletonText({
  lines = 3,
  shortLastLine = true,
  className,
  gapClass = "gap-2",
}: SkeletonTextProps) {
  return (
    <div
      role="status"
      aria-label="Loading text…"
      className={cn("flex flex-col", gapClass, className)}
    >
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        const widthClass =
          isLast && shortLastLine
            ? "w-3/5"
            : i % 2 === 0
              ? "w-full"
              : "w-11/12";

        return (
          <Skeleton
            key={i}
            rounded="md"
            className={cn("h-3", widthClass)}
            style={{
              // Stagger the shimmer phase per line for a cascade effect
              animationDelay: `${i * 80}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── KPI card skeleton ──────────────────────────────────────────── */

export interface SkeletonKPIProps {
  className?: string;
}

/**
 * SkeletonKPI — placeholder matching GlassKPI card layout.
 * Uses GlassCard's glass class directly to preserve the glass aesthetic
 * even during loading (no jarring white flash).
 */
export function SkeletonKPI({ className }: SkeletonKPIProps) {
  return (
    <div
      role="status"
      aria-label="Loading metric…"
      className={cn(
        "glass flex min-h-[168px] flex-col justify-between rounded-2xl p-6",
        className,
      )}
    >
      {/* Label */}
      <Skeleton rounded="md" className="h-3 w-24" />

      {/* Value */}
      <Skeleton rounded="lg" className="my-3 h-10 w-36" />

      {/* Delta badge + period */}
      <div className="flex items-center gap-2">
        <Skeleton rounded="full" className="h-5 w-16" />
        <Skeleton rounded="md" className="h-3 w-24" />
      </div>
    </div>
  );
}

/* ─── Chart skeleton ─────────────────────────────────────────────── */

export interface SkeletonChartProps {
  /** Height of the chart area. Default: h-64 */
  heightClass?: string;
  /** Show bottom axis tick lines. Default: true */
  showAxis?: boolean;
  className?: string;
}

/**
 * SkeletonChart — placeholder for Recharts containers.
 * Renders abstract "bar" shapes to telegraph chart content.
 */
export function SkeletonChart({
  heightClass = "h-64",
  showAxis = true,
  className,
}: SkeletonChartProps) {
  // Pseudo-random-but-deterministic bar heights for visual variety
  const barHeights = [55, 80, 45, 90, 65, 75, 50, 85, 60, 70, 40, 95];

  return (
    <div
      role="status"
      aria-label="Loading chart…"
      className={cn("glass flex flex-col rounded-2xl p-6", className)}
    >
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton rounded="md" className="h-4 w-32" />
        <Skeleton rounded="lg" className="h-7 w-24" />
      </div>

      {/* Chart bars */}
      <div className={cn("flex items-end gap-[3%]", heightClass)}>
        {barHeights.map((h, i) => (
          <Skeleton
            key={i}
            rounded="sm"
            className="flex-1"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>

      {/* Axis ticks */}
      {showAxis && (
        <div className="mt-3 flex justify-between">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              rounded="md"
              className="h-2.5 w-8"
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Table skeleton ─────────────────────────────────────────────── */

export interface SkeletonTableProps {
  /** Number of data rows. Default: 5 */
  rows?: number;
  /** Number of columns. Default: 4 */
  columns?: number;
  /** Show header row. Default: true */
  showHeader?: boolean;
  className?: string;
}

/**
 * SkeletonTable — placeholder for data tables.
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  // Column widths cycle to simulate varied content
  const colWidths = ["w-1/3", "w-1/4", "w-1/5", "w-1/6", "w-2/5", "w-1/2"];

  return (
    <div
      role="status"
      aria-label="Loading table…"
      className={cn("glass rounded-2xl overflow-hidden", className)}
    >
      {/* Header */}
      {showHeader && (
        <div
          className="flex items-center gap-4 border-b px-6 py-3"
          style={{ borderColor: "rgba(var(--glass-border-rgb) / 0.08)" }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              rounded="md"
              className={cn("h-2.5", colWidths[i % colWidths.length]!)}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b px-6 py-4 last:border-b-0"
          style={{ borderColor: "rgba(var(--glass-border-rgb) / 0.05)" }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={c}
              rounded="md"
              className={cn("h-3", colWidths[(r + c) % colWidths.length]!)}
              style={{ animationDelay: `${(r * columns + c) * 30}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Avatar skeleton ────────────────────────────────────────────── */

export interface SkeletonAvatarProps {
  /** Diameter of the avatar circle. Default: h-10 w-10 */
  sizeClass?: string;
  /** Include a text line next to the avatar. Default: false */
  withLabel?: boolean;
  className?: string;
}

/**
 * SkeletonAvatar — circular avatar placeholder.
 */
export function SkeletonAvatar({
  sizeClass = "h-10 w-10",
  withLabel = false,
  className,
}: SkeletonAvatarProps) {
  if (!withLabel) {
    return (
      <Skeleton
        rounded="full"
        className={cn(sizeClass, "shrink-0", className)}
        role="status"
        aria-label="Loading avatar…"
      />
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading user…"
      className={cn("flex items-center gap-3", className)}
    >
      <Skeleton rounded="full" className={cn(sizeClass, "shrink-0")} />
      <div className="flex flex-col gap-1.5">
        <Skeleton rounded="md" className="h-3 w-28" />
        <Skeleton rounded="md" className="h-2.5 w-20" style={{ animationDelay: "60ms" }} />
      </div>
    </div>
  );
}

/* ─── Generic card skeleton ──────────────────────────────────────── */

export interface SkeletonCardProps {
  /** Whether to show an icon placeholder in the header. Default: false */
  showIcon?: boolean;
  /** Number of body text lines. Default: 3 */
  bodyLines?: number;
  /** Whether to show a footer bar (e.g. action button). Default: false */
  showFooter?: boolean;
  className?: string;
}

/**
 * SkeletonCard — general-purpose card placeholder.
 * Matches the GlassCard layout.
 */
export function SkeletonCard({
  showIcon = false,
  bodyLines = 3,
  showFooter = false,
  className,
}: SkeletonCardProps) {
  return (
    <div
      role="status"
      aria-label="Loading card…"
      className={cn("glass flex flex-col gap-4 rounded-2xl p-6", className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton rounded="md" className="h-4 w-40" />
          <Skeleton rounded="md" className="h-3 w-56" style={{ animationDelay: "40ms" }} />
        </div>
        {showIcon && (
          <Skeleton rounded="xl" className="h-9 w-9 shrink-0" style={{ animationDelay: "80ms" }} />
        )}
      </div>

      {/* Body */}
      <SkeletonText lines={bodyLines} shortLastLine />

      {/* Footer */}
      {showFooter && (
        <div className="flex items-center gap-3 pt-2">
          <Skeleton rounded="xl" className="h-9 w-28" />
          <Skeleton rounded="xl" className="h-9 w-20" style={{ animationDelay: "50ms" }} />
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard grid skeleton ────────────────────────────────────── */

export interface SkeletonDashboardProps {
  /** Number of KPI cards in the grid. Default: 4 */
  kpiCount?: number;
}

/**
 * SkeletonDashboard — full overview page placeholder.
 * Staggered entrance via Framer Motion for perceived performance.
 */
export function SkeletonDashboard({ kpiCount = 4 }: SkeletonDashboardProps) {
  return (
    <motion.div
      className="flex flex-col gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {/* KPI grid */}
      <motion.div
        className="dashboard-grid-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      >
        {Array.from({ length: kpiCount }).map((_, i) => (
          <SkeletonKPI key={i} />
        ))}
      </motion.div>

      {/* Main chart */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      >
        <SkeletonChart heightClass="h-72" />
      </motion.div>

      {/* Bottom row */}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      >
        <SkeletonCard bodyLines={4} showIcon />
        <SkeletonTable rows={4} columns={3} />
      </motion.div>
    </motion.div>
  );
}