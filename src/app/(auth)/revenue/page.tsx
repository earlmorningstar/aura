/**
 * Revenue route — /revenue
 *
 * This file is intentionally a thin Server Component wrapper.
 *
 * Layout chrome (Sidebar, Topbar, MobileNav) is rendered once in
 * app/layout.tsx and must NOT be imported here.
 *
 * Page header (h1, subtitle) is owned by RevenuePage in
 * src/components/revenue/revenue-page.tsx — do not duplicate it here.
 */

import type { Metadata } from "next";
import { RevenuePage } from "@/components/revenue/revenue-page";

export const metadata: Metadata = {
  title: "Revenue",
  description: "Track your earnings, sources, and transaction history.",
};

export default function RevenueRoute() {
  return <RevenuePage />;
}