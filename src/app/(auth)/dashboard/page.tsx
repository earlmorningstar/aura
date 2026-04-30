"use client";

/**
 * Dashboard Overview Page — /
 *
 * This is the root authenticated page. Layout chrome (Sidebar, Topbar,
 * MobileNav) is rendered in app/layout.tsx — do NOT import them here.
 *
 * Architecture:
 * - Client component so Framer Motion entrance animations work on first paint
 * - GreetingHeader computes time-of-day server-side-safe via JS Date
 * - OverviewPageContent owns all data fetching via React Query hooks
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  AnimatedWrapper,
  AnimatedGroup,
  AnimatedItem,
  AnimatedPage,
} from "@/components/animated-wrapper";
import { OverviewPageContent } from "@/components/dashboard/overview-page-content";
import { useUser } from "@/hooks/use-user";


/* ─── Greeting logic ─────────────────────────────────────────────── */

function getGreeting(): { greeting: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: "Good morning", emoji: "☀️" };
  if (hour >= 12 && hour < 17) return { greeting: "Good afternoon", emoji: "🌤️" };
  if (hour >= 17 && hour < 21) return { greeting: "Good evening", emoji: "🌆" };
  return { greeting: "Working late", emoji: "🌙" };
}

/* ─── Page header ────────────────────────────────────────────────── */

function PageHeader() {
  const { greeting, emoji } = getGreeting();
  const { displayName } = useUser();

  return (
    <AnimatedGroup stagger={0.06} delayChildren={0.05}>
      <AnimatedItem variant="fadeUp">
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="font-display font-bold leading-[1.1]"
              style={{
                fontSize: "clamp(1.30rem, 3.5vw, 2.5rem)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--text-primary)",
              }}
            >
              {greeting},{" "}
              <span className="text-gradient capitalize">{displayName}</span>{" "}
              <motion.span
                className="inline-block"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                aria-label={emoji}
                role="img"
              >
                {emoji}
              </motion.span>
            </h1>
            <p
              className="mt-2 text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Here’s what’s happening with your creator business today.
            </p>
          </div>

          {/* Aura logo – mobile only, matching sidebar style */}
          <div className="lg:hidden flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--gradient-brand)" }}
            >
              <span
                className="text-[10px] font-black"
                style={{ color: "var(--color-bg-void)" }}
              >
                A
              </span>
            </div>
            <span
              className="font-display text-xl font-bold"
              style={{
                letterSpacing: "var(--tracking-tight)",
                color: "var(--text-primary)",
              }}
            >
              aura
            </span>
          </div>
        </div>
      </AnimatedItem>
    </AnimatedGroup>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function DashboardPage() {
  return (
    <AnimatedPage>
      {/* ── Header ────────────────────────────────────────────── */}
      <AnimatedWrapper variant="fadeUp" delay={0}>
        <PageHeader />
      </AnimatedWrapper>

      {/* ── Dashboard content ─────────────────────────────────── */}
      <div className="mt-8">
        <OverviewPageContent />
      </div>
    </AnimatedPage>
  );
}