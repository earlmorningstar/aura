"use client";

import { useDateRangeStore } from "@/stores/date-range-store";
import { differenceInDays } from "date-fns";
import type { ContentPiece } from "@/components/content/content-performance-cards";

export interface ContentData {
  totalPieces: number;
  avgEngagement: number;
  contentRevenue: number;
  postsThisMonth: number;
  pieces: ContentPiece[];
}

function generateContentData(days: number): ContentData {
  const mult = days / 30;

  const pieces: ContentPiece[] = [
    {
      id: "1",
      title: "No-code tools for solopreneurs in 2026",
      platform: "YouTube",
      publishedAt: "2026-04-12",
      engagementRate: `${(6.8 * mult).toFixed(1)}%`,
      engagementDelta: Math.round(42 * mult),
      revenue: Math.round(1290 * mult),
      revenueDelta: Math.round(31 * mult),
      views: Math.round(48200 * mult),
      likes: Math.round(2840 * mult),
      trend: "up",
      trendData: [820, 1200, 980, 1600, 1450, 2100, 1890, 2400].map((v) => Math.round(v * mult)),
    },
    {
      id: "2",
      title: "How I made $10K from a single email sequence",
      platform: "Newsletter",
      publishedAt: "2026-04-18",
      engagementRate: `${(44.2 * mult).toFixed(1)}%`,
      engagementDelta: Math.round(18 * mult),
      revenue: Math.round(840 * mult),
      revenueDelta: Math.round(12 * mult),
      views: Math.round(12400 * mult),
      trend: "up",
      trendData: [420, 580, 510, 740, 680, 920, 850, 1040].map((v) => Math.round(v * mult)),
    },
    {
      id: "3",
      title: "Full stack in 2026 — what actually matters",
      platform: "YouTube",
      publishedAt: "2026-04-22",
      engagementRate: `${(5.1 * mult).toFixed(1)}%`,
      engagementDelta: Math.round(-8 * mult),
      revenue: Math.round(620 * mult),
      revenueDelta: Math.round(-3 * mult),
      views: Math.round(33100 * mult),
      likes: Math.round(1680 * mult),
      trend: "down",
      trendData: [1100, 960, 1050, 820, 890, 740, 810, 680].map((v) => Math.round(v * mult)),
    },
  ];

  return {
    totalPieces: Math.round(38 * mult),
    avgEngagement: Math.round(4.8 * mult * 10) / 10,
    contentRevenue: Math.round(8420 * mult),
    postsThisMonth: Math.round(14 * mult),
    pieces,
  };
}

export function useContentData() {
  const { startDate, endDate } = useDateRangeStore();
  const days = differenceInDays(endDate, startDate);
  const data = generateContentData(days);
  return { data, isLoading: false, isError: false };
}