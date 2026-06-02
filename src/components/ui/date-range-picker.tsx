"use client";

/**
 * DateRangePicker — date context selector for the Topbar.
 *
 * Features:
 * - Preset tabs (7D / 30D / 90D / 1Y) with spring-physics dropdown
 * - Custom range inputs (start + end date, HTML date pickers)
 * - Active preset shown in trigger button
 * - Animated ChevronDown rotation on open/close
 * - Click-outside and Escape key to close
 * - All glassmorphism properties on the dropdown
 * - All colours from design tokens
 * - `aria-expanded`, `aria-haspopup`, `aria-label` on trigger
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { useDateRangeStore } from "@/stores/date-range-store";
import { cn } from "@/lib/utils";

/*  Types */

type PresetValue = "7d" | "30d" | "90d" | "1y" | "custom";

interface Preset {
  label: string;
  shortLabel: string;
  value: PresetValue;
  description: string;
}

interface DateRangePickerProps {
  onPresetChange?: () => void;
}

/* Preset config */

const PRESETS: Preset[] = [
  { label: "Last 7 days", shortLabel: "7D", value: "7d", description: "Past week" },
  { label: "Last 30 days", shortLabel: "30D", value: "30d", description: "Past month" },
  { label: "Last 90 days", shortLabel: "90D", value: "90d", description: "Past quarter" },
  { label: "Last year", shortLabel: "1Y", value: "1y", description: "Past 12 months" },
  { label: "Custom range", shortLabel: "—", value: "custom", description: "Pick your own dates" },
];

function getPresetLabel(value: PresetValue): string {
  return PRESETS.find((p) => p.value === value)?.label ?? "Date range";
}

/* Custom range inputs */

interface CustomRangeProps {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}

function CustomRange({ from, to, onFrom, onTo }: CustomRangeProps) {
  return (
    <motion.div
      className="flex flex-col gap-2 px-2 pb-1 pt-2"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
    >
      <div
        className="h-px"
        style={{ background: "rgba(var(--glass-border-rgb) / 0.10)" }}
        aria-hidden
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label
            className="mb-1 block text-[10px] font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
            htmlFor="date-from"
          >
            From
          </label>
          <input
            id="date-from"
            type="date"
            value={from}
            onChange={(e) => onFrom(e.target.value)}
            max={to || undefined}
            className="input text-xs"
            style={{ padding: "6px 10px" }}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-[10px] font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
            htmlFor="date-to"
          >
            To
          </label>
          <input
            id="date-to"
            type="date"
            value={to}
            onChange={(e) => onTo(e.target.value)}
            min={from || undefined}
            className="input text-xs"
            style={{ padding: "6px 10px" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* DateRangePicker */

export function DateRangePicker({ onPresetChange }: DateRangePickerProps) {
  const { preset, setPreset } = useDateRangeStore();
  const [open, setOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Ensure the store contains the real current dates after hydration.
  // The store initially holds placeholder epoch dates; we overwrite them
  // with the real "30d" range once the component mounts on the client.
  React.useEffect(() => {
    const { startDate, setPreset, preset } = useDateRangeStore.getState();
    // Only initialise if the dates are still the placeholder
    if (startDate.getTime() === 0) {
      setPreset(preset);
    }
  }, []);

  function handlePresetSelect(value: PresetValue) {
    setPreset(value);
    onPresetChange?.();
    if (value !== "custom") setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <motion.button
        className={cn(
          "flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium outline-none",
          "focus-visible:ring-2 focus-visible:ring-aura-cyan/60",
        )}
        style={{
          background: open
            ? "rgba(var(--glass-bg-rgb) / 0.1)"
            : "rgba(var(--glass-bg-rgb) / 0.06)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: open
            ? "1px solid rgba(var(--glass-border-rgb) / 0.16)"
            : "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
          color: "var(--text-secondary)",
        }}
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 600, damping: 28 } }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Date range: ${getPresetLabel(preset as PresetValue)}`}
      >
        <Calendar size={14} aria-hidden style={{ color: "var(--accent-cyan)", flexShrink: 0 }} />

        <span style={{ color: "var(--text-primary)" }}>
          {getPresetLabel(preset as PresetValue)}
        </span>

        {/* Animated chevron */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          style={{ display: "flex", color: "var(--text-tertiary)" }}
          aria-hidden
        >
          <ChevronDown size={13} />
        </motion.span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Select date range"
            className="absolute right-0 top-full z-[var(--z-dropdown)] mt-2 w-64 overflow-hidden rounded-2xl"
            style={{
              // All four glassmorphism properties
              background: "rgba(8, 8, 16, 0.92)",
              backdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
              WebkitBackdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
              border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity-strong))",
              boxShadow:
                "0 16px 48px -6px rgba(0,0,0,0.5), 0 4px 12px -2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <div className="flex flex-col gap-0.5 p-1.5">
              {PRESETS.map((p, i) => {
                const isActive = preset === p.value;
                return (
                  <motion.button
                    key={p.value}
                    role="option"
                    aria-selected={isActive}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/40"
                    style={{
                      background: isActive
                        ? "rgba(var(--glass-bg-rgb) / 0.1)"
                        : "transparent",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                    onClick={() => handlePresetSelect(p.value)}
                    whileHover={{
                      background: "rgba(var(--glass-bg-rgb) / 0.08)",
                      color: "var(--text-primary)",
                      transition: { duration: 0.12 },
                    }}
                    whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 600, damping: 28 } }}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 26,
                      delay: i * 0.04,
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {p.description}
                      </p>
                    </div>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      >
                        <Check size={14} style={{ color: "var(--accent-cyan)" }} aria-hidden />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Custom range date inputs */}
            <AnimatePresence>
              {preset === "custom" && (
                <CustomRange
                  from={customFrom}
                  to={customTo}
                  onFrom={setCustomFrom}
                  onTo={setCustomTo}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}