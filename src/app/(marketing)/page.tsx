/**
 * Landing page — / (marketing route group)
 *
 * This is a Server Component (no "use client"). Interactive elements are
 * extracted into client sub-components to keep the page shell static.
 *
 * The (marketing) route group shares NO layout with the app shell —
 * no Sidebar, Topbar, or MobileNav is rendered here.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHero, MarketingNav, FeatureGrid, SocialProof } from "./marketing-client";

/* ─── Metadata ───────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Aura — Your creator business, one glass dashboard",
  description:
    "Finally stop switching tabs. Revenue, audience, and content analytics in one beautiful place.",
  openGraph: {
    title: "Aura — Your creator business, one glass dashboard",
    description: "Finally stop switching tabs. See everything that matters.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

/* ─── Page ───────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "var(--color-bg-void)" }}
    >
      {/* ── Ambient background glows ──────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(var(--accent-cyan-rgb) / 0.08), transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 10%,  rgba(var(--accent-purple-rgb) / 0.06), transparent 60%),
            radial-gradient(ellipse 40% 30% at 10% 80%,  rgba(var(--accent-purple-rgb) / 0.05), transparent 50%)
          `,
          backgroundAttachment: "fixed",
        }}
      />

      {/* ── Nav ───────────────────────────────────────────────── */}
      <MarketingNav />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <MarketingHero />

      {/* ── Feature grid ──────────────────────────────────────── */}
      <FeatureGrid />

      {/* ── Social proof ──────────────────────────────────────── */}
      <SocialProof />

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        className="py-12 text-center"
        style={{ borderTop: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Aura.{" "}
          <Link href="/privacy" className="hover:opacity-80">Privacy</Link>
          {" · "}
          <Link href="/terms" className="hover:opacity-80">Terms</Link>
        </p>
      </footer>
    </div>
  );
}