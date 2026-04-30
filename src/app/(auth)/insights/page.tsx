/**
 * Insights route — /insights
 *
 * This file is intentionally a thin Server Component wrapper.
 *
 * Layout chrome (Sidebar, Topbar, MobileNav) is rendered once in
 * app/layout.tsx and must NOT be imported here.
 *
 * Page header (h1, subtitle) is owned by InsightsPage in
 * src/components/insights/insights-page.tsx — do not duplicate it here.
 */

import type { Metadata } from "next";
import { InsightsPage } from "@/components/insights/insights-page";

export const metadata: Metadata = {
  title: "AI Insights",
  description: "Personalised recommendations and strategic analysis powered by Aura AI.",
};

export default function InsightsRoute() {
  return <InsightsPage />;
}