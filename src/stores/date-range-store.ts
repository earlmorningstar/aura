/**
 * date-range-store.ts — Zustand store for the active date range context.
 *
 * Critical: initial dates are set to a deterministic placeholder (epoch)
 * to avoid hydration mismatches. The DateRangePicker component is
 * responsible for calling setPreset("30d") on mount, which replaces
 * the placeholder with the real current dates.
 */

import { create } from "zustand";
import { subDays, subYears } from "date-fns";

/* ─── Types ──────────────────────────────────────────────────────── */

export type DatePreset = "7d" | "30d" | "90d" | "1y" | "custom";

interface DateRangeStore {
  preset:    DatePreset;
  startDate: Date;
  endDate:   Date;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (start: Date, end: Date) => void;
}

/* ─── Helper: compute dates from preset at call time ─────────────── */

function datesForPreset(preset: Exclude<DatePreset, "custom">): {
  startDate: Date;
  endDate:   Date;
} {
  const today = new Date();
  const map: Record<Exclude<DatePreset, "custom">, Date> = {
    "7d":  subDays(today, 7),
    "30d": subDays(today, 30),
    "90d": subDays(today, 90),
    "1y":  subYears(today, 1),
  };
  return { startDate: map[preset], endDate: today };
}

/* ─── Store ──────────────────────────────────────────────────────── */

export const useDateRangeStore = create<DateRangeStore>()((set) => ({
  preset: "30d",
  // Placeholder dates that are identical on server and client
  startDate: new Date(0),
  endDate:   new Date(0),

  setPreset: (preset) => {
    if (preset === "custom") {
      set({ preset: "custom" });
      return;
    }
    set({ preset, ...datesForPreset(preset) });
  },

  setCustomRange: (start, end) =>
    set({ preset: "custom", startDate: start, endDate: end }),
}));