"use client";

/**
 * Topbar — contextual action bar fixed at top of content area.
 *
 * Features:
 * - Date range picker (left)
 * - AI Ask Aura trigger (opens slide‑over panel)
 * - Notification bell with badge
 * - User avatar with initials + dropdown hint
 * - All glassmorphism properties applied correctly
 * - Spring physics on all interactions
 *
 */

import { motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { GlassButton } from "@/components/ui/glass-button";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { SubscriptionPill } from "@/components/billing/subscription-pill";
import { useUser } from "@/hooks/use-user";
import { NotificationBell } from "@/components/ui/notification-bell";
import { usePathname } from "next/navigation";

/* Avatar */

interface AvatarButtonProps {
  online?: boolean;
}

function AvatarButton({ online = true }: { online?: boolean }) {
  const { initials } = useUser();

  return (
    <motion.button
      className="relative flex items-center gap-2 rounded-xl px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
      style={{
        background: "rgba(var(--glass-bg-rgb) / 0.06)",
        border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
      }}
      whileHover={{
        background: "rgba(var(--glass-bg-rgb) / 0.10)",
        borderColor: "rgba(var(--glass-border-rgb) / 0.16)",
      }}
      whileTap={{ scale: 0.96, transition: { type: "spring", stiffness: 600, damping: 30 } }}
      aria-label="Account menu"
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
        style={{
          background: "var(--gradient-brand)",
          color: "var(--color-bg-void)",
          fontFamily: "var(--font-display)",
        }}
        aria-hidden
      >
        {initials}
      </div>

      {online && (
        <span
          className="absolute bottom-1 right-1 h-2 w-2 rounded-full"
          style={{
            background: "var(--status-success)",
            boxShadow: "0 0 0 1.5px var(--color-bg-raised)",
          }}
          aria-hidden
        />
      )}

      <ChevronDown
        size={12}
        aria-hidden
        style={{ color: "var(--text-tertiary)" }}
      />
    </motion.button>
  );
}

/* Ask Aura AI button */

function AskAuraButton() {
  const toggleAIOpen = useUIStore((s) => s.toggleAIOpen);
  return (
    <GlassButton
      variant="outline"
      size="sm"
      leadingIcon={<Sparkles size={13} />}
      className={cn(
        "hidden sm:inline-flex",
        "border-aura-cyan/25 hover:border-aura-cyan/45",
        "text-aura-text-secondary hover:text-aura-cyan",
      )}
      onClick={toggleAIOpen}
    >
      Ask Aura AI
    </GlassButton>
  );
}

/* Topbar */

export function Topbar() {
  const pathname = usePathname();
  const isOverview = pathname === "/dashboard";

  return (
    <>
      <motion.header
        className={cn(
          "fixed right-6 top-6 z-[var(--z-sticky)] hidden h-[var(--header-height)] items-center gap-4 px-5 lg:flex",
          "rounded-b-2xl rounded-t-none", // top corners square
        )}
        style={{
          left: "calc(var(--sidebar-width) + 48px)",
          background: "rgba(var(--glass-bg-rgb) / var(--glass-opacity-2))",
          backdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
          WebkitBackdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
          border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
          boxShadow:
            "0 8px 32px -4px rgba(0,0,0,0.4), 0 2px 8px -2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.1 }}
      >
        {isOverview && <DateRangePicker />}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <SubscriptionPill />
          <AskAuraButton />
          <div className="mx-1 hidden h-5 w-px sm:block" style={{ background: "rgba(var(--glass-border-rgb) / 0.12)" }} aria-hidden />
          <NotificationBell />
          <AvatarButton />
        </div>
      </motion.header>
    </>
  );
}