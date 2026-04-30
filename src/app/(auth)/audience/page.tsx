/**
 * Audience route — /audience
 *
 * This file is intentionally a thin Server Component wrapper.
 *
 * Layout chrome (Sidebar, Topbar, MobileNav) is rendered once in
 * app/layout.tsx and must NOT be imported here.
 *
 * Page header (h1, subtitle) is owned by AudiencePage in
 * src/components/audience/audience-page.tsx — do not duplicate it here.
 */

import type { Metadata } from "next";
import { AudiencePage } from "@/components/audience/audience-page";

export const metadata: Metadata = {
  title: "Audience",
  description: "Track follower growth, engagement, and content reach across all platforms.",
};

export default function AudienceRoute() {
  return <AudiencePage />;
}