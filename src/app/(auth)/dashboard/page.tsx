"use client";

/**
 * Dashboard Overview Page — /
 *
 * Root authenticated page. Layout chrome (Sidebar, Topbar,
 * MobileNav) is rendered in app/layout.tsx.
 *
 * Architecture:
 * - Client component so Framer Motion entrance animations work on first paint
 * - GreetingHeader computes time-of-day server-side-safe via JS Date
 * - OverviewPageContent owns all data fetching via React Query hooks
 */

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AnimatedWrapper,
  AnimatedGroup,
  AnimatedItem,
  AnimatedPage,
} from "@/components/animated-wrapper";
import { OverviewPageContent } from "@/components/dashboard/overview-page-content";
import { useUser } from "@/hooks/use-user";


/* Greeting logic  */

function getGreeting(): { greeting: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: "Good morning", emoji: "☀️" };
  if (hour >= 12 && hour < 17) return { greeting: "Good afternoon", emoji: "🌤️" };
  if (hour >= 17 && hour < 21) return { greeting: "Good evening", emoji: "🌆" };
  return { greeting: "Working late", emoji: "🌙" };
}

/* Page header */

function PageHeader() {
  const { greeting, emoji } = getGreeting();
  const { displayName } = useUser();

  return (
    <AnimatedGroup stagger={0.06} delayChildren={0.05}>
      <AnimatedItem variant="fadeUp">
        <div>
          {/* Aura logo – mobile only, matching sidebar style */}
          <div className="lg:hidden flex justify-end mb-3">
            <div className="flex items-center gap-2">
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

          {/* Greeting (hidden on mobile) */}
          <h1
            className="hidden lg:block font-display font-bold leading-[1.1]"
            style={{
              fontSize: "clamp(1.20rem, 3.5vw, 2.4rem)",
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

          {/* Subtitle, always visible, left‑aligned */}
          <p className="mt-2 text-base lg:text-base" style={{ color: "var(--text-secondary)" }}>
            Here’s what’s happening with your creator business today.
          </p>
        </div>
      </AnimatedItem>
    </AnimatedGroup>
  );
}

/* Post‑checkout sync */

function PostCheckoutSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    async function sync() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch("/api/sync-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        credentials: "include",
      });

      if (res.ok) {
        const { plan } = await res.json();  //"starter" or "pro"
        queryClient.setQueryData(["subscription"], { status: plan, plan });

        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        router.replace(url.pathname + url.search);
      }
    }

    sync();
  }, [searchParams, router, queryClient]);

  return null; // invisible
}

/* Page */

export default function DashboardPage() {
  return (
    <>
      <AnimatedPage>
        {/* Header */}
        <AnimatedWrapper variant="fadeUp" delay={0}>
          <PageHeader />
        </AnimatedWrapper>

        {/* Dashboard content */}
        <div className="mt-8">
          <OverviewPageContent />
        </div>
      </AnimatedPage>

      {/* Post‑checkout sync — runs in the background */}
      <Suspense fallback={null}>
        <PostCheckoutSync />
      </Suspense>
    </>
  );
}