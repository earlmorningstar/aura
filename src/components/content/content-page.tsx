"use client";

/**
 * ContentPage — full content analytics view.
 *
 * Sections:
 * 1. Page header + summary stats
 * 2. Filter / sort bar
 * 3. ContentPerformanceCards grid (with real-time additions)
 * 4. Publishing cadence heatmap strip
 * 5. Content format breakdown
 *
 * Fixes:
 * - Top‑level gap‑6 prevents section overlapping
 * - “+ Add content” button opens a modal form
 * - New content is added to local state and shown immediately
 * - Success toast confirms the action
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";
import { ContentPerformanceCards } from "./content-performance-cards";
import type { ContentPiece } from "./content-performance-cards";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassKPI } from "@/components/ui/glass-kpi";
import { AnimatedPage, AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { cn } from "@/lib/utils";
import { useContentData } from "@/hooks/use-content-data";

/* ─── Minimal “Add Content” Modal ────────────────────────────────── */

type ContentType = "post" | "video" | "newsletter";

interface AddContentForm {
  title: string;
  platform: string;
  date: string;
  type: ContentType;
}

const PLATFORMS = ["YouTube", "Newsletter", "Twitter/X", "Blog"] as const;
const CONTENT_TYPES: ContentType[] = ["post", "video", "newsletter"];

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

interface AddContentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (piece: ContentPiece) => void;
}

function AddContentModal({ open, onClose, onSave }: AddContentModalProps) {
  const [form, setForm] = React.useState<AddContentForm>({
    title: "",
    platform: "YouTube",
    date: new Date().toISOString().slice(0, 10),
    type: "video",
  });
  const [submitting, setSubmitting] = React.useState(false);

  const update = (key: keyof AddContentForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);

    // In a prod, insert to Supabase here.
    // For now, we create a local piece with empty analytics.
    const newPiece: ContentPiece = {
      id: generateId(),
      title: form.title.trim(),
      platform: form.platform,
      publishedAt: form.date,
      engagementRate: "—",
      engagementDelta: 0,
      revenue: 0,
      revenueDelta: 0,
      views: 0,
      trend: "neutral",
      trendData: [],
    };

    // Simulate a tiny network delay so the loading state is visible
    await new Promise((r) => setTimeout(r, 300));
    onSave(newPiece);
    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal panel */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{
              background: "rgba(10,10,18,0.92)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(var(--glass-border-rgb) / 0.2)",
              boxShadow: "var(--shadow-lg)",
            }}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                New Content
              </h2>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5"
                style={{ color: "var(--text-tertiary)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Title
                </span>
                <input
                  type="text"
                  className="input"
                  placeholder="Content title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Platform
                </span>
                <select
                  className="input"
                  value={form.platform}
                  onChange={(e) => update("platform", e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Date
                </span>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Type
                </span>
                <div className="flex gap-2">
                  {CONTENT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                      )}
                      style={{
                        background: form.type === t
                          ? "rgba(var(--accent-cyan-rgb) / 0.15)"
                          : "rgba(var(--glass-bg-rgb) / 0.06)",
                        border: form.type === t
                          ? "1px solid rgba(var(--accent-cyan-rgb) / 0.3)"
                          : "1px solid rgba(var(--glass-border-rgb) / 0.08)",
                        color: form.type === t ? "var(--accent-cyan)" : "var(--text-tertiary)",
                      }}
                      onClick={() => update("type", t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {/* Save button */}
            <div className="mt-6">
              <GlassButton
                variant="primary"
                size="md"
                className="w-full"
                loading={submitting}
                leadingIcon={<Plus size={14} />}
                onClick={() => void handleSave()}
                disabled={!form.title.trim()}
              >
                Add Content
              </GlassButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Success toast ──────────────────────────────────────────────── */

function SuccessToast({ show, onDone }: { show: boolean; onDone: () => void }) {
  React.useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: "rgba(10,10,18,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(var(--status-success-rgb) / 0.3)",
            boxShadow: "var(--shadow-lg)",
          }}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
        >
          <CheckCircle2 size={18} style={{ color: "var(--status-success)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Content added successfully
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Sort / filter bar (unchanged from original) ────────────────── */

type SortOption = "revenue" | "engagement" | "views" | "recent";
type PlatformFilter = "all" | "YouTube" | "Newsletter" | "Twitter/X" | "Blog";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "engagement", label: "Engagement" },
  { value: "views", label: "Views" },
  { value: "recent", label: "Recent" },
];

const PLATFORM_FILTERS: PlatformFilter[] = ["all", "YouTube", "Newsletter", "Twitter/X", "Blog"];

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <motion.button
      className="relative rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
      style={{ color: active ? "var(--text-primary)" : "var(--text-tertiary)" }}
      onClick={onClick}
      whileTap={{ scale: 0.94, transition: { type: "spring", stiffness: 600, damping: 28 } }}
    >
      {active && (
        <motion.span
          layoutId="content-filter-pill"
          className="absolute inset-0 rounded-xl"
          style={{
            background: "rgba(var(--glass-bg-rgb) / 0.1)",
            border: "1px solid rgba(var(--glass-border-rgb) / 0.12)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">
        {label === "all" ? "All" : label}
      </span>
    </motion.button>
  );
}

interface ContentFilterBarProps {
  sort: SortOption;
  onSort: (s: SortOption) => void;
  platform: PlatformFilter;
  onPlatform: (p: PlatformFilter) => void;
  viewMode: "grid" | "list";
  onViewMode: (v: "grid" | "list") => void;
}

function ContentFilterBar({
  sort,
  onSort,
  platform,
  onPlatform,
  viewMode,
  onViewMode,
}: ContentFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Platform filters */}
      <div
        className="flex items-center gap-0.5 overflow-x-auto rounded-xl p-1"
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.05)",
          border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
        }}
        role="group"
        aria-label="Filter by platform"
      >
        {PLATFORM_FILTERS.map((p) => (
          <FilterPill
            key={p}
            label={p}
            active={platform === p}
            onClick={() => onPlatform(p)}
          />
        ))}
      </div>

      {/* Right: Sort + view toggle */}
      <div className="flex items-center gap-2">
        {/* Sort dropdown (simplified) */}
        <div className="flex items-center gap-1">
          <SlidersHorizontal size={13} style={{ color: "var(--text-muted)" }} aria-hidden />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
              style={{
                background: sort === opt.value
                  ? "rgba(var(--glass-bg-rgb) / 0.1)"
                  : "transparent",
                color: sort === opt.value ? "var(--text-primary)" : "var(--text-tertiary)",
              }}
              onClick={() => onSort(opt.value)}
              whileTap={{ scale: 0.93 }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        {/* View mode toggle */}
        <div
          className="flex items-center gap-0.5 rounded-lg p-0.5"
          style={{
            background: "rgba(var(--glass-bg-rgb) / 0.05)",
            border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
          }}
        >
          {(["grid", "list"] as const).map((mode) => (
            <motion.button
              key={mode}
              className="rounded-md p-1.5"
              style={{
                background: viewMode === mode
                  ? "rgba(var(--glass-bg-rgb) / 0.12)"
                  : "transparent",
                color: viewMode === mode ? "var(--text-primary)" : "var(--text-muted)",
              }}
              onClick={() => onViewMode(mode)}
              whileTap={{ scale: 0.9 }}
              aria-label={`${mode} view`}
            >
              {mode === "grid" ? <LayoutGrid size={14} /> : <List size={14} />}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Publishing cadence heatmap (unchanged) ─────────────────────── */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = 12;

function getPostingIntensity(week: number, day: number): number {
  const seed = (week * 7 + day) * 2654435761;
  const val = (seed ^ (seed >> 16)) % 5;
  if (day >= 5) return Math.min(val, 1);
  return val as 0 | 1 | 2 | 3 | 4;
}

const INTENSITY_STYLES = [
  "rgba(var(--glass-bg-rgb) / 0.06)",
  "rgba(var(--accent-cyan-rgb) / 0.12)",
  "rgba(var(--accent-cyan-rgb) / 0.28)",
  "rgba(var(--accent-cyan-rgb) / 0.52)",
  "rgba(var(--accent-cyan-rgb) / 0.80)",
];

function PublishingHeatmap() {
  return (
    <GlassCard visual="default" padding="md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            className="font-display font-semibold"
            style={{ fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-snug)", color: "var(--text-primary)" }}
          >
            Publishing Cadence
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Last 12 weeks of content output
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Less</span>
          {INTENSITY_STYLES.map((bg, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-sm"
              style={{ background: bg, border: "1px solid rgba(255,255,255,0.05)" }}
              aria-hidden
            />
          ))}
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-3">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pt-5">
            {DAYS.map((d) => (
              <span
                key={d}
                className="flex h-3 items-center text-[9px]"
                style={{ color: "var(--text-muted)", width: "20px" }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {Array.from({ length: WEEKS }, (_, w) => (
              <div key={w} className="flex flex-col gap-1">
                {w === 0 && (
                  <span
                    className="mb-1 text-[9px]"
                    style={{ color: "var(--text-muted)", height: "12px", lineHeight: "12px" }}
                  >
                    12w ago
                  </span>
                )}
                {w === WEEKS - 1 && (
                  <span
                    className="mb-1 text-[9px]"
                    style={{ color: "var(--text-muted)", height: "12px", lineHeight: "12px" }}
                  >
                    This week
                  </span>
                )}
                {w !== 0 && w !== WEEKS - 1 && (
                  <span style={{ height: "16px" }} aria-hidden />
                )}
                {DAYS.map((_, d) => {
                  const intensity = getPostingIntensity(w, d);
                  return (
                    <motion.span
                      key={d}
                      className="h-3 w-3 rounded-sm"
                      style={{
                        background: INTENSITY_STYLES[intensity],
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 28,
                        delay: 0.3 + (w * 7 + d) * 0.004,
                      }}
                      title={`Week ${w + 1}, ${DAYS[d]}: ${intensity > 0 ? `${intensity} post${intensity > 1 ? "s" : ""}` : "No posts"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}


/* ─── ContentPage ────────────────────────────────────────────────── */

export function ContentPage() {
  const { data } = useContentData();
  const [pieces, setPieces] = React.useState<ContentPiece[]>(data.pieces);
  const [sort, setSort] = React.useState<SortOption>("revenue");
  const [platform, setPlatform] = React.useState<PlatformFilter>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Modal + toast state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  const handleAddPiece = (newPiece: ContentPiece) => {
    setPieces((prev) => [newPiece, ...prev]);
    setShowToast(true);
  };

  const displayedPieces = React.useMemo(() => {
    let filtered = pieces;

    // Platform filter
    if (platform !== "all") {
      filtered = filtered.filter((p) => p.platform === platform);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "revenue":
          return b.revenue - a.revenue;
        case "engagement":
          return parseFloat(b.engagementRate) - parseFloat(a.engagementRate);
        case "views":
          return b.views - a.views;
        case "recent":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [pieces, platform, sort]);

  return (
    <AnimatedPage>
      <AnimatedGroup stagger={0.1} delayChildren={0.05} className="flex flex-col gap-6">
        {/* ── Section 1: Header ───────────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="font-display font-bold"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--text-primary)",
                }}
              >
                Content
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Analyse performance across all your content pieces and platforms.
              </p>
            </div>
            <GlassButton
              variant="outline"
              size="sm"
              leadingIcon={<Plus size={14} />}
              onClick={() => setModalOpen(true)}
            >
              Add content
            </GlassButton>
          </div>
        </AnimatedItem>

        {/* ── Section 2: KPI strip ─────────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              {
                title: "Content Pieces",
                rawValue: data.totalPieces,
                prefix: "",
                suffix: "",
                change: `+${data.postsThisMonth - 14 > 0 ? '+' : ''}${data.postsThisMonth - 14} this month`,
                trend: "up" as const,
                period: "live",
                icon: <FileText size={15} />,
                accent: "default" as const,
              },
              {
                title: "Avg. Engagement",
                rawValue: data.avgEngagement,
                prefix: "",
                suffix: "%",
                change: "−0.3%",
                trend: "down" as const,
                period: "rate",
                icon: <TrendingUp size={15} />,
                accent: "default" as const,
              },
              {
                title: "Content Revenue",
                rawValue: data.contentRevenue,
                prefix: "$",
                suffix: "",
                change: "+31%",
                trend: "up" as const,
                period: "this month",
                icon: <DollarSign size={15} />,
                accent: "cyan" as const,
              },
              {
                title: "Posts This Month",
                rawValue: data.postsThisMonth,
                prefix: "",
                suffix: "",
                change: `+${data.postsThisMonth - 12}`,
                trend: "up" as const,
                period: "pieces published",
                icon: <Calendar size={15} />,
                accent: "default" as const,
              },
            ].map((kpi, i) => (
              <GlassKPI
                key={kpi.title}
                title={kpi.title}
                value={`${kpi.prefix}${kpi.rawValue}${kpi.suffix}`}
                rawValue={kpi.rawValue}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                change={kpi.change}
                trend={kpi.trend}
                period={kpi.period}
                icon={kpi.icon}
                accent={kpi.accent}
                animateValue
                delay={0.1 + i * 0.07}
              />
            ))}
          </div>
        </AnimatedItem>

        {/* ── Section 3: Filter bar + Cards ─────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div className="flex flex-col gap-5">
            <ContentFilterBar
              sort={sort}
              onSort={setSort}
              platform={platform}
              onPlatform={setPlatform}
              viewMode={viewMode}
              onViewMode={setViewMode}
            />
            <ContentPerformanceCards
              pieces={displayedPieces}
              viewMode={viewMode}
            />
          </div>
        </AnimatedItem>

        {/* ── Section 4: Publishing heatmap ─────────────────── */}
        <AnimatedItem variant="fadeUp">
          <PublishingHeatmap />
        </AnimatedItem>
      </AnimatedGroup>

      {/* ── Modal ────────────────────────────────────────────── */}
      <AddContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddPiece}
      />

      {/* ── Success toast ────────────────────────────────────── */}
      <SuccessToast
        show={showToast}
        onDone={() => setShowToast(false)}
      />
    </AnimatedPage>
  );
}