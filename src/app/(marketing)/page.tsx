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
import {
  MarketingNav,
  MarketingHero,
  SocialProof,
  FeatureGrid,
  HowItWorks,
  Testimonials,
  Integrations,
  FAQ,
  Footer
} from "./marketing-client";
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
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "transparent" }}>
      <div className="relative z-10">
        <MarketingNav />
        <MarketingHero />
        <SocialProof />
        <FeatureGrid />
        <HowItWorks />
        <Testimonials />
        <Integrations />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}