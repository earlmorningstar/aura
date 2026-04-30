/**
 * Content route — /content
 *
 * This file is intentionally a thin Server Component wrapper.
 *
 * Layout chrome (Sidebar, Topbar, MobileNav) is rendered once in
 * app/layout.tsx and must NOT be imported here.
 *
 * Page header (h1, subtitle) is owned by ContentPage in
 * src/components/content/content-page.tsx — do not duplicate it here.
 */

import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = {
  title: "Content",
  description: "Analyse performance across all your content pieces and platforms.",
};

export default function ContentRoute() {
  return <ContentPage />;
}