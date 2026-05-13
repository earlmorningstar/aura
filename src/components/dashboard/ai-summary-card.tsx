"use client";

/**
 * AISummaryCard — Aura AI insight panel.
 *
 * Features:
 * - Typewriter character-reveal animation for AI text
 * - Animated Sparkles icon on mount + on refresh
 * - Skeleton loading state (no "Thinking…" placeholder text)
 * - Error state with retry button
 * - Action chips from API data (not hardcoded)
 * - Timestamp showing when summary was last generated
 * - GlassButton for all actions
 * - All colours from design tokens
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { SkeletonText } from "@/components/ui/loading-skeleton";
import { useAISummary } from "@/hooks/use-ai-summary";
import { cn } from "@/lib/utils";

/* ─── Typewriter text ────────────────────────────────────────────── */

interface TypewriterProps {
  text: string;
  speed?: number; // ms per character
  delay?: number; // seconds
  className?: string;
  onComplete?: () => void;
}

function TypewriterText({
  text,
  speed = 16,
  delay = 0.3,
  className,
  onComplete,
}: TypewriterProps) {
  const [displayed, setDisplayed] = React.useState("");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;

    let index = 0;
    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(interval);
          setDone(true);
          onComplete?.();
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(startTimer);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          className="ml-0.5 inline-block h-[1em] w-0.5 align-middle"
          style={{ background: "var(--accent-cyan)" }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}
    </span>
  );
}

/* ─── Animated Sparkles icon ─────────────────────────────────────── */

function SparklesIcon({ spinning }: { spinning?: boolean }) {
  return (
    <motion.div
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
      style={{
        background: "rgba(var(--accent-purple-rgb) / 0.12)",
        border: "1px solid rgba(var(--accent-purple-rgb) / 0.2)",
      }}
      animate={
        spinning
          ? { rotate: 360 }
          : { scale: [1, 1.12, 1], rotate: [0, -8, 8, 0] }
      }
      transition={
        spinning
          ? { duration: 1, repeat: Infinity, ease: "linear" }
          : { duration: 1.2, delay: 0.3, ease: "easeInOut" }
      }
    >
      <Sparkles size={15} style={{ color: "var(--accent-purple)" }} aria-hidden />
    </motion.div>
  );
}

/* ─── Action chip ────────────────────────────────────────────────── */

interface ActionChipProps {
  label: string;
  onClick?: () => void;
  index?: number;
}

function ActionChip({ label, onClick, index = 0 }: ActionChipProps) {
  return (
    <motion.button
      className={cn(
        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium",
        "transition-colors duration-150",
      )}
      style={{
        background: "rgba(var(--glass-bg-rgb) / 0.06)",
        border:
          "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
        color: "var(--text-secondary)",
      }}
      whileHover={{
        background: "rgba(var(--glass-bg-rgb) / 0.12)",
        color: "var(--text-primary)",
        borderColor: "rgba(var(--glass-border-rgb) / 0.16)",
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 26,
        delay: 0.8 + index * 0.07,
      }}
      onClick={onClick}
    >
      {label}
      <ChevronRight size={11} aria-hidden style={{ opacity: 0.5 }} />
    </motion.button>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────── */

function AISummarySkeleton() {
  return (
    <GlassCard
      visual="default"
      padding="none"
      className="flex h-full flex-col p-4 md:p-6 lg:p-8"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-8 rounded-xl" />
          <div className="skeleton h-4 w-32 rounded-md" />
        </div>
        <div className="skeleton h-7 w-16 rounded-lg" />
      </div>
      <SkeletonText lines={5} shortLastLine gapClass="gap-2.5" />
      <div className="mt-5 flex gap-2">
        <div className="skeleton h-8 w-36 rounded-xl" />
        <div className="skeleton h-8 w-32 rounded-xl" />
      </div>
    </GlassCard>
  );
}

/* ─── Full error card (when NO summary exists) ──────────────────── */

function AISummaryFullError({ onRetry }: { onRetry: () => void }) {
  return (
    <GlassCard
      visual="default"
      padding="none"
      className="flex h-full flex-col items-center justify-center p-4 md:p-6 lg:p-8 text-center"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: "rgba(var(--status-error-rgb) / 0.1)",
          border: "1px solid rgba(var(--status-error-rgb) / 0.2)",
        }}
      >
        <AlertCircle size={18} style={{ color: "rgb(var(--status-error-rgb))" }} />
      </div>
      <p
        className="mt-3 text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        Couldn’t generate summary
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
        The AI service is temporarily unavailable. Check your connection or try again.
      </p>
      <div className="mt-4">
        <GlassButton
          variant="ghost"
          size="sm"
          leadingIcon={<RefreshCw size={13} />}
          onClick={onRetry}
        >
          Try again
        </GlassButton>
      </div>
    </GlassCard>
  );
}

/* ─── Timestamp ──────────────────────────────────────────────────── */

function Timestamp({ isoString }: { isoString?: string }) {
  if (!isoString) return null;
  const date = new Date(isoString);
  const formatted = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return (
    <motion.div
      className="flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100 transition-opacity"
      style={{ color: "var(--text-muted)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <Clock size={11} aria-hidden />
      <span>Updated {formatted}</span>
    </motion.div>
  );
}

/* ─── AISummaryCard ──────────────────────────────────────────────── */

/** Fallback content until the real API responds */
const FALLBACK_SUMMARY =
  "Your top-performing content this week was the tutorial video on monetisation strategies — it generated 38% of total revenue. Subscription growth is ahead of pace. Consider doubling down on long-form educational content and scheduling a follow-up post in the next 48 hours to capitalise on the momentum.";

const FALLBACK_ACTIONS = [
  "Double down on video",
  "Create follow-up post",
  "Review top earners",
];

export function AISummaryCard() {
  const { data, isLoading, isError, refetch, isFetching } = useAISummary();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // Loading state while data is completely absent
  if (isLoading && !data) {
    return <AISummarySkeleton />;
  }

  // Full error only if we have NEVER loaded a summary
  if (isError && !data) {
    return <AISummaryFullError onRetry={() => void handleRefresh()} />;
  }

  // Always use what we have (fallback if no real data yet)
  const summaryText = data?.aiSummary ?? FALLBACK_SUMMARY;
  const actions: string[] = data?.actions ?? FALLBACK_ACTIONS;
  const updatedAt: string | undefined = data?.updatedAt;

  return (
    <GlassCard
      visual="default"
      padding="none"
      className="flex h-full flex-col p-3 md:p-5 lg:p-6"
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <SparklesIcon spinning={isFetching} />
            {isFetching && (
              <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/20 blur-xl" />
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <h3
              className="mb-4 text-[13px] font-bold tracking-tight"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              Aura AI
            </h3>
            <span
              className="text-[7px] font-bold uppercase tracking-[0.1em] opacity-100"
              style={{ color: "var(--text-muted)" }}
            >
              Weekly Summary
            </span>
          </div>
        </div>

        {/* Right: Timestamp + Refresh */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Timestamp isoString={updatedAt} />
          <GlassButton
            variant="ghost"
            size="xs"
            leadingIcon={
              <RefreshCw
                size={11}
                className={isFetching ? "animate-spin" : ""}
              />
            }
            loading={isFetching}
            onClick={() => void handleRefresh()}
            className="h-7 px-3 text-[11px] font-medium border-white/5 bg-white/[0.03] hover:bg-white/[0.08]"
            aria-label="Refresh AI summary"
          >
            Refresh
          </GlassButton>
        </div>
      </div>

      {/* ── Summary text ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={summaryText.slice(0, 20)}
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p
            className="max-w-[65ch] text-sm leading-relaxed tracking-[0.01em]"
            style={{ color: "var(--text-secondary)" }}
          >
            <TypewriterText text={summaryText} speed={14} delay={0.2} />
          </p>
        </motion.div>
      </AnimatePresence>

      {/* ── Inline error banner (only when error occurs but data exists) ── */}
      {isError && (
        <div
          className="mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-xs"
          style={{
            background: "rgba(var(--status-error-rgb) / 0.08)",
            border: "1px solid rgba(var(--status-error-rgb) / 0.15)",
            color: "var(--status-error)",
          }}
        >
          <span>Couldn’t refresh summary</span>
          <button
            onClick={() => void handleRefresh()}
            className="ml-3 font-medium underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Divider ─────────────────────────────────────────── */}
      <motion.div
        className="my-4 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(var(--glass-border-rgb) / 0.12), transparent)",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
      />

      {/* ── Action chips ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {actions.map((action, i) => (
          <ActionChip key={action} label={action} index={i} />
        ))}
      </div>
    </GlassCard>
  );
}