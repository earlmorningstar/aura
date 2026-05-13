"use client";

/**
 * InsightsPage — AI-powered recommendations and strategic analysis.
 *
 * Sections:
 * 1. Page header with summary stats + regenerate button
 * 2. Category filter tabs (All / Revenue / Content / Audience / Growth)
 * 3. Priority insight grid (High → Medium → Low)
 * 4. Insight cards with: category, priority badge, title, body, action chips
 *
 * Data:
 * - Fetched from /api/ai-summary via React Query
 * - Structured InsightItem type (not raw string[])
 * - Falls back to FALLBACK_INSIGHTS until API is live
 * - Error state with retry, empty state, and SkeletonCard loading
 * - Layout fix: all sections spaced by parent AnimatedGroup gap‑6.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Zap,
  ArrowRight,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { SkeletonCard } from "@/components/ui/loading-skeleton";
import { AnimatedPage, AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { cn } from "@/lib/utils";

/* ─── Types (unchanged) ──────────────────────────────────────────── */

type InsightPriority = "high" | "medium" | "low";
type InsightCategory = "revenue" | "content" | "audience" | "growth" | "general";

interface InsightItem {
  id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  body: string;
  actions: string[];
  impact?: string;
}

type CategoryFilter = "all" | InsightCategory;

/* ─── Fallback data (unchanged) ──────────────────────────────────── */

const FALLBACK_INSIGHTS: InsightItem[] = [
  // … same items as before …
  {
    id: "fallback-1",
    category: "revenue",
    priority: "high",
    title: "Your top video generates 38% of total revenue",
    body: "The tutorial video on monetisation strategies is your strongest revenue driver this period. Publishing a follow-up in the next 48 hours would capitalise on peak audience interest and could increase this month's revenue by 12–18%.",
    actions: ["Schedule follow-up", "Boost promotion"],
    impact: "+12–18% revenue potential",
  },
  {
    id: "fallback-2",
    category: "content",
    priority: "high",
    title: "Long-form educational content outperforms short clips 4:1",
    body: "Videos over 12 minutes are generating 4× more revenue per view. Consider shifting at least 60% of your content calendar to long-form.",
    actions: ["Adjust content calendar"],
    impact: "4× higher revenue per view",
  },
  {
    id: "fallback-3",
    category: "audience",
    priority: "medium",
    title: "Newsletter engagement at 42% — prime for paid tier",
    body: "Your newsletter open rate significantly exceeds the industry average. A 5% conversion at $10/month would add $1,480 MRR.",
    actions: ["Create paid tier", "Set up Stripe product"],
    impact: "+$1,480 MRR at 5% conversion",
  },
];

/* ─── Category config (unchanged) ────────────────────────────────── */

const CATEGORY_CONFIG: Record<InsightCategory, {
  label: string;
  icon: React.ElementType;
  color: string;
  rgb: string;
}> = {
  revenue: { label: "Revenue", icon: TrendingUp, color: "var(--accent-cyan)", rgb: "var(--accent-cyan-rgb)" },
  content: { label: "Content", icon: FileText, color: "var(--accent-purple)", rgb: "var(--accent-purple-rgb)" },
  audience: { label: "Audience", icon: Users, color: "var(--status-success)", rgb: "var(--status-success-rgb)" },
  growth: { label: "Growth", icon: Zap, color: "var(--accent-amber)", rgb: "var(--accent-amber-rgb)" },
  general: { label: "General", icon: Lightbulb, color: "var(--text-tertiary)", rgb: "var(--glass-bg-rgb)" },
};

/* ─── Priority config (unchanged) ────────────────────────────────── */

const PRIORITY_CONFIG: Record<InsightPriority, {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}> = {
  high: {
    label: "High priority",
    color: "var(--status-error)",
    bg: "rgba(var(--status-error-rgb) / 0.1)",
    border: "rgba(var(--status-error-rgb) / 0.2)",
    dot: "var(--status-error)",
  },
  medium: {
    label: "Medium priority",
    color: "var(--status-warning)",
    bg: "rgba(var(--status-warning-rgb) / 0.1)",
    border: "rgba(var(--status-warning-rgb) / 0.2)",
    dot: "var(--status-warning)",
  },
  low: {
    label: "Low priority",
    color: "var(--text-muted)",
    bg: "rgba(var(--glass-bg-rgb) / 0.08)",
    border: "rgba(var(--glass-border-rgb) / 0.12)",
    dot: "var(--text-muted)",
  },
};

/* ─── Category filter tab (unchanged) ────────────────────────────── */

interface CategoryTabProps {
  value: CategoryFilter;
  active: boolean;
  count: number;
  onClick: () => void;
}

function CategoryTab({ value, active, count, onClick }: CategoryTabProps) {
  const cfg = value === "all"
    ? null
    : CATEGORY_CONFIG[value as InsightCategory];

  return (
    <motion.button
      className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
      style={{ color: active ? "var(--text-primary)" : "var(--text-tertiary)" }}
      onClick={onClick}
      whileTap={{ scale: 0.94, transition: { type: "spring", stiffness: 600, damping: 28 } }}
    >
      {active && (
        <motion.span
          layoutId="insights-cat-pill"
          className="absolute inset-0 rounded-xl"
          style={{
            background: "rgba(var(--glass-bg-rgb) / 0.1)",
            border: "1px solid rgba(var(--glass-border-rgb) / 0.12)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {cfg && (
          <cfg.icon size={11} aria-hidden style={{ color: active ? cfg.color : "inherit" }} />
        )}
        {value === "all" ? "All" : cfg?.label}
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
          style={{
            background: active
              ? "rgba(var(--glass-bg-rgb) / 0.15)"
              : "rgba(var(--glass-bg-rgb) / 0.08)",
            color: active ? "var(--text-primary)" : "var(--text-muted)",
          }}
        >
          {count}
        </span>
      </span>
    </motion.button>
  );
}

/* ─── Action chip (unchanged) ────────────────────────────────────── */

function ActionChip({ label, index }: { label: string; index: number }) {
  return (
    <motion.button
      className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
      style={{
        background: "rgba(var(--glass-bg-rgb) / 0.06)",
        border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
        color: "var(--text-secondary)",
      }}
      whileHover={{
        background: "rgba(var(--glass-bg-rgb) / 0.12)",
        color: "var(--text-primary)",
        borderColor: "rgba(var(--glass-border-rgb) / 0.16)",
        transition: { duration: 0.15 },
      }}
      whileTap={{ scale: 0.94, transition: { type: "spring", stiffness: 600, damping: 28 } }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.5 + index * 0.06 }}
    >
      {label}
      <ChevronRight size={10} aria-hidden style={{ opacity: 0.5 }} />
    </motion.button>
  );
}

/* ─── Insight card (unchanged) ───────────────────────────────────── */

interface InsightCardProps {
  insight: InsightItem;
  index: number;
}

function InsightCard({ insight, index }: InsightCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const catCfg = CATEGORY_CONFIG[insight.category];
  const priCfg = PRIORITY_CONFIG[insight.priority];
  const CatIcon = catCfg.icon;

  return (
    <GlassCard
      visual={insight.priority === "high" ? "default" : "subtle"}
      padding="md"
      className="flex flex-col gap-4"
      animate
      delay={index * 0.07}
    >
      {/* ── Header row ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: `rgba(${catCfg.rgb} / 0.12)`,
              border: `1px solid rgba(${catCfg.rgb} / 0.2)`,
              color: catCfg.color,
            }}
            aria-hidden
          >
            <CatIcon size={15} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ color: catCfg.color, background: `rgba(${catCfg.rgb} / 0.1)`, border: `1px solid rgba(${catCfg.rgb} / 0.2)` }}
              >
                {catCfg.label}
              </span>
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ color: priCfg.color, background: priCfg.bg, border: `1px solid ${priCfg.border}` }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: priCfg.dot }}
                  aria-hidden
                />
                {priCfg.label}
              </span>
            </div>
            <p
              className="text-sm font-semibold leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              {insight.title}
            </p>
          </div>
        </div>
      </div>

      <div>
        <AnimatePresence initial={false}>
          <motion.p
            key={expanded ? "full" : "truncated"}
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {expanded ? insight.body : insight.body.slice(0, 120) + (insight.body.length > 120 ? "…" : "")}
          </motion.p>
        </AnimatePresence>

        {insight.body.length > 120 && (
          <motion.button
            className="mt-1.5 flex items-center gap-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
            style={{ color: "var(--accent-cyan)" }}
            onClick={() => setExpanded((e) => !e)}
            whileTap={{ scale: 0.96 }}
          >
            {expanded ? "Show less" : "Read more"}
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              aria-hidden
            >
              <ArrowRight size={11} />
            </motion.span>
          </motion.button>
        )}
      </div>

      {insight.impact && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            background: "rgba(var(--status-success-rgb) / 0.06)",
            border: "1px solid rgba(var(--status-success-rgb) / 0.12)",
          }}
        >
          <Zap size={12} aria-hidden style={{ color: "var(--status-success)", flexShrink: 0 }} />
          <span className="text-xs font-medium" style={{ color: "var(--status-success)" }}>
            {insight.impact}
          </span>
        </div>
      )}

      {insight.actions.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 pt-1"
          style={{ borderTop: "1px solid rgba(var(--glass-border-rgb) / 0.06)" }}
        >
          {insight.actions.map((action, i) => (
            <ActionChip key={action} label={action} index={i} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

/* ─── Summary stat strip (unchanged) ─────────────────────────────── */

interface InsightSummaryProps {
  insights: InsightItem[];
}

function InsightSummary({ insights }: InsightSummaryProps) {
  const highCount = insights.filter((i) => i.priority === "high").length;
  const totalImpact = insights.filter((i) => i.impact).length;

  const stats = [
    { label: "Total insights", value: String(insights.length) },
    { label: "High priority", value: String(highCount), color: "var(--status-error)" },
    { label: "With impact data", value: String(totalImpact) },
    { label: "Categories covered", value: String(new Set(insights.map((i) => i.category)).size) },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            background: "rgba(var(--glass-bg-rgb) / 0.06)",
            border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
          }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.1 + i * 0.06 }}
        >
          <span
            className="font-display text-sm font-bold"
            style={{
              letterSpacing: "var(--tracking-snug)",
              color: s.color ?? "var(--text-primary)",
            }}
          >
            {s.value}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {s.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Loading state (unchanged) ──────────────────────────────────── */

function InsightsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} showIcon bodyLines={4} showFooter />
      ))}
    </div>
  );
}

/* ─── Error state (unchanged) ────────────────────────────────────── */

function InsightsError({ onRetry }: { onRetry: () => void }) {
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
        <AlertCircle size={24} style={{ color: "rgb(var(--status-error-rgb))" }} />
      </div>
      <div>
        <p className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
          Couldn&rsquo;t load insights
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          The AI service is temporarily unavailable.
        </p>
      </div>
      <GlassButton
        variant="ghost"
        size="sm"
        leadingIcon={<RefreshCw size={14} />}
        onClick={onRetry}
      >
        Try again
      </GlassButton>
    </motion.div>
  );
}

/* ─── Empty state (unchanged) ────────────────────────────────────── */

function InsightsEmpty() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 py-24 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(var(--accent-purple-rgb) / 0.1)",
          border: "1px solid rgba(var(--accent-purple-rgb) / 0.2)",
        }}
      >
        <Sparkles size={24} style={{ color: "var(--accent-purple)" }} />
      </div>
      <div>
        <p className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
          No insights yet
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Add more data and run a fresh analysis.
        </p>
      </div>
    </motion.div>
  );
}

/* ─── InsightsPage ───────────────────────────────────────────────── */

export function InsightsPage() {
  const [activeCategory, setActiveCategory] = React.useState<CategoryFilter>("all");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data, isLoading, isError, refetch } = useQuery<InsightItem[]>({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await fetch("/api/ai-summary");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { recommendations?: InsightItem[] };
      return json.recommendations ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Calling POST to generate new insights
      await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: "weekly_overview" }),
        credentials: "include",
      });
      //Refetch via GET to get the cached result
      await refetch();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [refetch]);

  const insights: InsightItem[] = data ?? FALLBACK_INSIGHTS;

  const categoryCounts = React.useMemo(() => {
    const counts: Partial<Record<CategoryFilter, number>> = { all: insights.length };
    for (const ins of insights) {
      counts[ins.category] = (counts[ins.category] ?? 0) + 1;
    }
    return counts;
  }, [insights]);

  const filtered = activeCategory === "all"
    ? insights
    : insights.filter((i) => i.category === activeCategory);

  const PRIORITY_ORDER: Record<InsightPriority, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...filtered].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  return (
    <AnimatedPage>
      {/* ── ADDED gap‑6, REMOVED mb‑8 from header ── */}
      <AnimatedGroup stagger={0.1} delayChildren={0.05} className="flex flex-col gap-6">
        {/* ── Section 1: Header ───────────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <motion.div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(var(--accent-purple-rgb) / 0.12)",
                    border: "1px solid rgba(var(--accent-purple-rgb) / 0.2)",
                  }}
                  animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 4 }}
                >
                  <Sparkles size={17} style={{ color: "var(--accent-purple)" }} aria-hidden />
                </motion.div>
                <h1
                  className="font-display font-bold"
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                    letterSpacing: "var(--tracking-tight)",
                    color: "var(--text-primary)",
                  }}
                >
                  AI Insights
                </h1>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Personalised recommendations based on your data. Actioned weekly.
              </p>
            </div>

            <GlassButton
              variant="ghost"
              size="sm"
              leadingIcon={<RefreshCw size={13} />}
              loading={isRefreshing || isLoading}
              onClick={() => void handleRefresh()}
              aria-label="Regenerate insights"
            >
              Regenerate
            </GlassButton>
          </div>
        </AnimatedItem>

        {/* ── Section 2: Summary stats ─────────────────────────── */}
        {!isLoading && !isError && insights.length > 0 && (
          <AnimatedItem variant="fadeUp">
            <InsightSummary insights={insights} />
          </AnimatedItem>
        )}

        {/* ── Section 3: Category filter tabs ─────────────────── */}
        {!isLoading && !isError && insights.length > 0 && (
          <AnimatedItem variant="fadeUp">
            <div
              className="flex flex-wrap items-center gap-0.5 rounded-2xl p-1"
              style={{
                background: "rgba(var(--glass-bg-rgb) / 0.05)",
                border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
              }}
              role="group"
              aria-label="Filter insights by category"
            >
              {(["all", "revenue", "content", "audience", "growth", "general"] as CategoryFilter[])
                .filter((cat) => cat === "all" || (categoryCounts[cat] ?? 0) > 0)
                .map((cat) => (
                  <CategoryTab
                    key={cat}
                    value={cat}
                    active={activeCategory === cat}
                    count={categoryCounts[cat] ?? 0}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
            </div>
          </AnimatedItem>
        )}

        {/* ── Section 4: Insight cards ─────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          {isLoading ? (
            <InsightsLoading />
          ) : isError ? (
            <InsightsError onRetry={() => void handleRefresh()} />
          ) : sorted.length === 0 ? (
            <InsightsEmpty />
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeCategory}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
              >
                {sorted.map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </AnimatedItem>
      </AnimatedGroup>
    </AnimatedPage>
  );
}