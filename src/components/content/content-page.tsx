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
import { eachDayOfInterval, subWeeks, format, getDay } from "date-fns";
import { useContentPieces } from "@/hooks/use-content-pieces";
import { useState } from "react";
import { Toast } from "@/components/ui/toast";

/* ─── Minimal “Add Content” Modal ────────────────────────────────── */

type ContentType = "post" | "video" | "newsletter";

interface AddContentForm {
  title: string;
  platform: string;
  date: string;
  type: ContentType;
  engagementRate: string;
  revenue: string;
  views: string;
  likes: string;
}

// const PLATFORMS = ["YouTube", "Newsletter", "Twitter/X", "Blog"] as const;
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
  const [submitting, setSubmitting] = useState(false);
  const [useCustomPlatform, setUseCustomPlatform] = useState(false);
  const [customPlatform, setCustomPlatform] = useState("");
  const [form, setForm] = useState<AddContentForm>({
    title: "",
    platform: "YouTube",
    date: new Date().toISOString().slice(0, 10),
    type: "video",
    engagementRate: "",
    revenue: "",
    views: "",
    likes: "",
  });

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
      platform: useCustomPlatform ? customPlatform.trim() : form.platform,
      publishedAt: form.date,
      contentType: form.type,
      engagementRate: form.engagementRate || null,
      engagementDelta: null,
      revenue: parseFloat(form.revenue || "0"),
      revenueDelta: null,
      views: parseInt(form.views || "0"),
      likes: parseInt(form.likes || "0"),
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
            className="relative w-full max-w-md rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
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

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Platform</span>
                {!useCustomPlatform ? (
                  <div className="flex gap-2 items-center">
                    <select
                      className="input flex-1"
                      value={form.platform}
                      onChange={(e) => update("platform", e.target.value)}
                    >
                      <option>YouTube</option>
                      <option>Twitter/X</option>
                      <option>Newsletter</option>
                      <option>TikTok</option>
                      <option>Instagram</option>
                      <option>Blog</option>
                      <option>Other</option>
                    </select>
                    <button
                      type="button"
                      className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors text-cyan-400"
                      onClick={() => setUseCustomPlatform(true)}
                    >
                      Custom
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="e.g. Patreon"
                      value={customPlatform}
                      onChange={(e) => setCustomPlatform(e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors text-white/60"
                      onClick={() => setUseCustomPlatform(false)}
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>

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

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Engagement Rate (%)</span>
                <input type="number" step="0.1" className="input" placeholder="5.2" value={form.engagementRate} onChange={(e) => update("engagementRate", e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Revenue ($)</span>
                <input type="number" step="0.01" className="input" placeholder="1290" value={form.revenue} onChange={(e) => update("revenue", e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Views</span>
                <input type="number" className="input" placeholder="48200" value={form.views} onChange={(e) => update("views", e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Likes</span>
                <input type="number" className="input" placeholder="2840" value={form.likes} onChange={(e) => update("likes", e.target.value)} />
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
          </motion.div >
        </motion.div >
      )
      }
    </AnimatePresence >
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

/* ─── Sort / filter bar ────────────────── */

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
  search: string;
  onSearch: (value: string) => void;
}

function ContentFilterBar({
  sort,
  onSort,
  platform,
  onPlatform,
  viewMode,
  onViewMode,
  search,
  onSearch,
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

      <div className="flex items-center gap-2">
        <input
          type="text"
          className="input text-sm"
          placeholder="Search content..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => onSearch("")} className="text-white/50 hover:text-white">
            <X size={14} />
          </button>
        )}
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

/* ─── Publishing cadence heatmap ─────────────────────── */


function RealPublishingHeatmap() {
  const { pieces } = useContentPieces();
  const today = new Date();
  const start = subWeeks(today, 11); // last 12 weeks
  const allDays = eachDayOfInterval({ start, end: today });

  const postMap = new Map<string, number>();
  pieces.forEach(p => {
    const key = p.publishedAt; // YYYY-MM-DD
    postMap.set(key, (postMap.get(key) ?? 0) + 1);
  });

  const weeks: string[][] = [];
  let currentWeek: string[] = [];
  allDays.forEach(day => {
    if (getDay(day) === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(format(day, "yyyy-MM-dd"));
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <GlassCard visual="default" padding="md">
      <h2 className="font-display font-semibold text-lg mb-4" style={{ color: "var(--text-primary)" }}>Publishing Cadence</h2>
      <div className="overflow-x-auto">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 pt-5">
            {DAYS.map(d => (
              <span key={d} className="flex h-3 items-center text-[9px]" style={{ color: "var(--text-muted)", width: "20px" }}>{d}</span>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {DAYS.map((_, di) => {
                  const dateKey = week[di] || "";
                  const count = postMap.get(dateKey) ?? 0;
                  const intensity = Math.min(count, 4);
                  const bg = intensity === 0
                    ? "rgba(var(--glass-bg-rgb) / 0.06)"
                    : `rgba(var(--accent-cyan-rgb) / ${0.1 + intensity * 0.2})`;
                  return (
                    <motion.span
                      key={di}
                      className="h-3 w-3 rounded-sm"
                      style={{ background: bg, border: "1px solid rgba(255,255,255,0.04)" }}
                      title={`${dateKey}: ${count} post${count !== 1 ? 's' : ''}`}
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
  const { pieces, isLoading, addPiece } = useContentPieces();
  const [sort, setSort] = React.useState<SortOption>("revenue");
  const [platform, setPlatform] = React.useState<PlatformFilter>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [search, setSearch] = useState("");

  const displayedPieces = React.useMemo(() => {
    let filtered = pieces;

    if (platform !== "all") {
      filtered = filtered.filter((p) => p.platform === platform);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "revenue":
          return (b.revenue || 0) - (a.revenue || 0);
        case "engagement":
          return parseFloat(b.engagementRate || "0") - parseFloat(a.engagementRate || "0");
        case "views":
          return (b.views || 0) - (a.views || 0);
        case "recent":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [pieces, platform, sort, search]);

  const avgEngagement = displayedPieces.length
    ? displayedPieces.reduce((sum, p) => sum + (parseFloat(p.engagementRate ?? "0") || 0), 0) / displayedPieces.length
    : 0;

  const contentRevenue = displayedPieces.reduce((sum, p) => sum + p.revenue, 0);

  const handleAddPiece = (newPiece: ContentPiece) => {
    addPiece(newPiece);
    setShowToast(true);
  };

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

        {/* ── Section 2: KPI strip (placeholder, will compute later) ── */}
        <AnimatedItem variant="fadeUp">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {/* We'll compute KPIs from real pieces later; for now static */}
            <GlassKPI
              title="Content Pieces"
              value={`${pieces.length}`}
              rawValue={pieces.length}
              prefix=""
              suffix=""
              change={`+${pieces.length - 3}`}
              trend="up"
              period="live"
              icon={<FileText size={15} />}
              accent="default"
              animateValue
              delay={0.1}
            />
            <GlassKPI
              title="Avg. Engagement"
              value={`${avgEngagement.toFixed(1)}`}
              rawValue={avgEngagement}
              prefix=""
              suffix="%"
              change="0%"
              trend="neutral"
              period="rate"
              icon={<TrendingUp size={15} />}
              accent="default"
              animateValue
              delay={0.17}
            />
            <GlassKPI
              title="Content Revenue"
              value={`${contentRevenue.toFixed(2)}`}
              rawValue={contentRevenue}
              prefix="$"
              suffix=""
              change="0%"
              trend="neutral"
              period="this month"
              icon={<DollarSign size={15} />}
              accent="cyan"
              animateValue
              delay={0.24}
            />
            <GlassKPI
              title="Posts This Month"
              value={`${pieces.length}`}
              rawValue={pieces.length}
              prefix=""
              suffix=""
              change={`+${pieces.length - 3}`}
              trend="up"
              period="pieces published"
              icon={<Calendar size={15} />}
              accent="default"
              animateValue
              delay={0.31}
            />
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
              search={search}
              onSearch={setSearch}
            />
            <ContentPerformanceCards
              pieces={displayedPieces}
              viewMode={viewMode}
            />
            {displayedPieces.length === 0 && search.trim() && (
              <div className="text-center py-12 text-sm text-white/50">
                No content matches ”{search}”.
              </div>
            )}
          </div>
        </AnimatedItem>

        {/* ── Section 4: Publishing heatmap ─────────────────── */}
        <AnimatedItem variant="fadeUp">
          <RealPublishingHeatmap />
        </AnimatedItem>
      </AnimatedGroup>

      {/* ── Modal ────────────────────────────────────────────── */}
      <AddContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddPiece}
      />

      {/* ── Success toast ────────────────────────────────────── */}
      <Toast
        show={showToast}
        message="Content added successfully"
        onDone={() => setShowToast(false)}
      />
    </AnimatedPage>
  );
}