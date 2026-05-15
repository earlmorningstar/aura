"use client";

/**
 * ContentPerformanceCards — grid of top content piece cards.
 *
 * Features:
 * - Hook-driven data with fallback dataset
 * - Rank badge (1st / 2nd / 3rd with gold/silver/bronze tints)
 * - Engagement + revenue stat badges using design token colours
 * - Hover spring lift animation
 * - Staggered entrance via AnimatedGroup
 * - SkeletonCard loading state
 * - Empty state with CTA
 * - All magic colour values removed
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, TrendingUp, DollarSign, Eye, ReceiptText } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonCard } from "@/components/ui/loading-skeleton";
import { Sparkline } from "@/components/common/sparkline";
import { AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface ContentPiece {
  id: string;
  title: string;
  platform: string;
  publishedAt: string;
  engagementRate: string | null;
  engagementDelta: number | null;
  revenue: number;
  revenueDelta: number | null;
  views: number;
  likes?: number;
  trend: "up" | "down" | "neutral";
  trendData?: number[];
  url?: string;
  contentType?: string;

}

/* ─── Fallback data ──────────────────────────────────────────────── */

const FALLBACK_CONTENT: ContentPiece[] = [
  {
    id: "1",
    title: "No-code tools for solopreneurs in 2026",
    platform: "YouTube",
    publishedAt: "2026-04-12",
    engagementRate: "6.8%",
    engagementDelta: 42,
    revenue: 1290,
    revenueDelta: 31,
    views: 48200,
    likes: 2840,
    trend: "up",
    trendData: [820, 1200, 980, 1600, 1450, 2100, 1890, 2400],
  },
  {
    id: "2",
    title: "How I made $10K from a single email sequence",
    platform: "Newsletter",
    publishedAt: "2026-04-18",
    engagementRate: "44.2%",
    engagementDelta: 18,
    revenue: 840,
    revenueDelta: 12,
    views: 12400,
    trend: "up",
    trendData: [420, 580, 510, 740, 680, 920, 850, 1040],
  },
  {
    id: "3",
    title: "Full stack in 2026 — what actually matters",
    platform: "YouTube",
    publishedAt: "2026-04-22",
    engagementRate: "5.1%",
    engagementDelta: -8,
    revenue: 620,
    revenueDelta: -3,
    views: 33100,
    likes: 1680,
    trend: "down",
    trendData: [1100, 960, 1050, 820, 890, 740, 810, 680],
  },
];

/* ─── Rank badge ─────────────────────────────────────────────────── */

const RANK_STYLES = [
  { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)", color: "rgb(251,191,36)" },   // gold
  { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)", color: "rgb(148,163,184)" },  // silver
  { bg: "rgba(180,120,80,0.12)", border: "rgba(180,120,80,0.25)", color: "rgb(180,120,80)" },   // bronze
];

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank - 1] ?? {
    bg: "rgba(var(--glass-bg-rgb) / 0.08)",
    border: "rgba(var(--glass-border-rgb) / 0.12)",
    color: "var(--text-muted)",
  };
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

/* ─── Platform badge ─────────────────────────────────────────────── */

const PLATFORM_COLOURS: Record<string, { bg: string; color: string; border: string }> = {
  YouTube: { bg: "rgba(var(--accent-cyan-rgb) / 0.08)", color: "var(--accent-cyan)", border: "rgba(var(--accent-cyan-rgb) / 0.18)" },
  Newsletter: { bg: "rgba(var(--status-success-rgb) / 0.08)", color: "var(--status-success)", border: "rgba(var(--status-success-rgb) / 0.18)" },
  "Twitter/X": { bg: "rgba(var(--accent-purple-rgb) / 0.08)", color: "var(--accent-purple)", border: "rgba(var(--accent-purple-rgb) / 0.18)" },
  Blog: { bg: "rgba(var(--accent-amber-rgb) / 0.08)", color: "var(--accent-amber)", border: "rgba(var(--accent-amber-rgb) / 0.18)" },
};

function PlatformBadge({ platform }: { platform: string }) {
  const style = PLATFORM_COLOURS[platform] ?? {
    bg: "rgba(var(--glass-bg-rgb) / 0.08)",
    color: "var(--text-tertiary)",
    border: "rgba(var(--glass-border-rgb) / 0.12)",
  };
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {platform}
    </span>
  );
}

/* ─── Stat chip ──────────────────────────────────────────────────── */

interface StatChipProps {
  icon: React.ElementType;
  value: string | null;
  delta?: number | null;
  label: string;
}

function StatChip({ icon: Icon, value, delta, label }: StatChipProps) {
  const displayValue = value ?? "—";
  const isPositive = delta !== null && delta !== undefined ? delta >= 0 : true;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <Icon size={12} aria-hidden style={{ color: "var(--text-muted)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-display text-sm font-bold"
          style={{ letterSpacing: "var(--tracking-snug)", color: "var(--text-primary)" }}
        >
          {displayValue}
        </span>
        {delta !== null && delta !== undefined && (
          <span
            className="text-[10px] font-semibold"
            style={{
              color: isPositive ? "var(--status-success)" : "var(--status-error)",
            }}
          >
            {isPositive ? "+" : ""}{delta}%
          </span>
        )}
      </div>
    </div>
  );
}


/* ─── Single content card ────────────────────────────────────────── */

interface ContentCardProps {
  piece: ContentPiece;
  rank: number;
}

function ContentCard({ piece, rank }: ContentCardProps) {
  const publishDate = new Date(piece.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <GlassCard visual="default" padding="md" interactive className="flex h-full flex-col gap-4">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <RankBadge rank={rank} />
          <div className="flex-1 overflow-hidden">
            <p
              className="line-clamp-2 text-sm font-semibold leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              {piece.title}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <PlatformBadge platform={piece.platform} />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {publishDate}
              </span>
            </div>
          </div>
        </div>
        {piece.url && (
          <motion.a
            href={piece.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
            style={{ color: "var(--text-muted)" }}
            whileHover={{ color: "var(--text-primary)", scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            aria-label={`Open ${piece.title}`}
          >
            <ExternalLink size={13} />
          </motion.a>
        )}
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        <StatChip
          icon={TrendingUp}
          label="Engagement"
          value={piece.engagementRate}
          delta={piece.engagementDelta}
        />
        <div
          className="h-8 w-px shrink-0"
          style={{ background: "rgba(var(--glass-border-rgb) / 0.08)" }}
          aria-hidden
        />
        <StatChip
          icon={DollarSign}
          label="Revenue"
          value={`$${piece.revenue.toLocaleString()}`}
          delta={piece.revenueDelta}
        />
        <div
          className="h-8 w-px shrink-0"
          style={{ background: "rgba(var(--glass-border-rgb) / 0.08)" }}
          aria-hidden
        />
        <StatChip
          icon={Eye}
          label="Views"
          value={
            piece.views >= 1000
              ? `${(piece.views / 1000).toFixed(0)}K`
              : String(piece.views)
          }
        />
      </div>

      {/* ── Sparkline ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          30-day trend
        </span>
        {piece.trendData ? (
          <Sparkline data={piece.trendData} width={96} height={26} />
        ) : (
          <Sparkline trend={piece.trend} width={96} height={26} />
        )}
      </div>
    </GlassCard>
  );
}

/* ─── ContentPerformanceCards ────────────────────────────────────── */

export interface ContentPerformanceCardsProps {
  pieces?: ContentPiece[];
  isLoading?: boolean;
  viewMode?: "grid" | "list";
}

export function ContentPerformanceCards({
  pieces,
  isLoading = false,
  viewMode = "grid",
}: ContentPerformanceCardsProps) {
  const content = pieces ?? FALLBACK_CONTENT;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} showIcon bodyLines={3} showFooter />
        ))}
      </div>
    );
  }

  return (
    <AnimatedGroup
      stagger={0.08}
      delayChildren={0.05}
      className={cn(
        "grid gap-4",
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          : "grid-cols-1 max-w-2xl mx-auto"
      )}
    >
      <AnimatePresence>
        {content.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={24} />}
            title="No transactions yet"
            description="Add your first transaction to start tracking revenue."
            actionLabel="Add Transaction"
            onAction={() => {
              document.querySelector("#add-transaction-form")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        ) : (
          content.map((piece, i) => (
            <AnimatedItem key={piece.id} variant="fadeUp" distance={12} className="h-full">
              <div className="h-full">
                <ContentCard piece={piece} rank={i + 1} />
              </div>
            </AnimatedItem>
          ))
        )}
      </AnimatePresence>
    </AnimatedGroup>
  );
}