"use client";

/**
 * AudiencePage — full audience analytics view.
 *
 * Sections:
 * 1. Page header + summary KPIs
 * 2. Audience Growth AreaChart (with platform breakdown)
 * 3. Platform deep-dive cards (YouTube / Twitter / Newsletter)
 * 4. Top content by audience engagement
 *
 * All spacing is handled by the parent AnimatedGroup's gap-6.
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  Youtube,
  Twitter,
  Mail,
  Users,
  UserPlus,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassKPI } from "@/components/ui/glass-kpi";
import { Sparkline } from "@/components/common/sparkline";
import {
  AnimatedPage,
  AnimatedGroup,
  AnimatedItem,
} from "@/components/animated-wrapper";
import dynamic from "next/dynamic";
import { SkeletonChart } from "@/components/ui/loading-skeleton";
import { useAudienceData } from "@/hooks/use-audience-data";
import type { AudienceRecord } from "@/hooks/use-audience-data";
import { GlassButton } from "../ui/glass-button";
import { useState } from "react";
import { AddAudienceModal } from "./add-audience-modal";

const AudienceGrowthChart = dynamic(
  () => import("./audience-growth-chart").then(mod => mod.AudienceGrowthChart),
  { loading: () => <SkeletonChart heightClass="h-[300px]" />, ssr: false }
);

/* ─── Platform card ──────────────────────────────────────────────── */

interface PlatformCardProps {
  icon: React.ElementType;
  name: string;
  followers: number;
  delta: string;
  trend: "up" | "down" | "neutral";
  engagementRate: string;
  avgViews: string;
  accentColor: string;
  accentRgb: string;
  delay?: number;
}

function PlatformCard({
  icon: Icon,
  name,
  followers,
  delta,
  trend,
  engagementRate,
  avgViews,
  accentColor,
  accentRgb,
  delay = 0,
}: PlatformCardProps) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26, delay }}
    >
      <GlassCard visual="default" padding="md" className="flex h-full flex-col gap-4">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: `rgba(${accentRgb} / 0.12)`,
                border: `1px solid rgba(${accentRgb} / 0.2)`,
                color: accentColor,
              }}
            >
              <Icon size={15} aria-hidden />
            </div>
            <p
              className="font-display font-semibold"
              style={{ color: "var(--text-primary)", letterSpacing: "var(--tracking-snug)" }}
            >
              {name}
            </p>
          </div>

          <span
            className="whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-semibold"
            style={{
              background: "rgba(var(--status-success-rgb) / 0.1)",
              color: "var(--status-success)",
              border: "1px solid rgba(var(--status-success-rgb) / 0.2)",
            }}
          >
            {delta}
          </span>
        </div>

        {/* ── Follower count ────────────────────────────────── */}
        <div>
          <p className="tracking-caps" style={{ color: "var(--text-muted)" }}>
            Followers
          </p>
          <p
            className="mt-1 font-display text-xl font-bold"
            style={{ letterSpacing: "var(--tracking-tight)", color: "var(--text-primary)" }}
          >
            {followers.toLocaleString()}
          </p>
        </div>

        {/* ── Stats row ────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Engagement
            </p>
            <p className="mt-0.5 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              {engagementRate}
            </p>
          </div>
          <div
            className="h-8 w-px"
            style={{ background: "rgba(var(--glass-border-rgb) / 0.08)" }}
            aria-hidden
          />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Avg Views
            </p>
            <p className="mt-0.5 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              {avgViews}
            </p>
          </div>
        </div>

        {/* ── Sparkline ────────────────────────────────────────── */}
        <Sparkline trend={trend} width={120} height={28} />
      </GlassCard>
    </motion.div>
  );
}

/* ─── Top content row ─────────────────────────────────────────────── */

interface TopContentRowProps {
  title: string;
  platform: string;
  views: string;
  newFollowers: string;
  index: number;
}

function TopContentRow({ title, platform, views, newFollowers, index }: TopContentRowProps) {
  return (
    <motion.div
      className="flex items-center gap-4 py-3"
      style={{ borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.06)" }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.4 + index * 0.06 }}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.1)",
          color: "var(--text-muted)",
        }}
      >
        {index + 1}
      </span>

      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {platform}
        </p>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden text-right sm:block">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Views</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{views}</p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>New followers</p>
          <p className="text-sm font-semibold" style={{ color: "var(--status-success)" }}>
            {newFollowers}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Derive UI shape from audience records ────────────────────── */

type TopContentItem = {
  title: string;
  platform: string;
  views: string;
  newFollowers: string;
};

const EMPTY_TOP_CONTENT: TopContentItem[] = [];

function deriveFromRecords(records: AudienceRecord[]) {
  if (records.length === 0) {
    return {
      totalFollowers: 0,
      newThisMonth: 0,
      avgEngagement: 0,
      avgViews: 0,
      platforms: [],
      topContent: EMPTY_TOP_CONTENT,
      growthData: [{ date: "No data", followers: 0, newFollowers: 0 }],
    };
  }

  const totalFollowers = records.reduce((sum, r) => sum + r.followers, 0);
  const newThisMonth = records.reduce((sum, r) => sum + r.new_followers, 0);

  const avgEngagement = records.length
    ? Math.round((records.reduce((sum, r) => sum + (r.engagement_rate ?? 0), 0) / records.length) * 10) / 10
    : 0;

  const avgViews = records.length
    ? Math.round(records.reduce((sum, r) => sum + (r.avg_views ?? 0), 0) / records.length)
    : 0;

  // Group by platform
  const platformMap: Record<string, { followers: number; new_followers: number; engagements: number; views: number; count: number }> = {};

  records.forEach((r) => {
    if (!platformMap[r.platform]) {
      platformMap[r.platform] = { followers: 0, new_followers: 0, engagements: 0, views: 0, count: 0 };
    }
    const entry = platformMap[r.platform]!;
    entry.followers += r.followers;
    entry.new_followers += r.new_followers;
    entry.engagements += r.engagement_rate ?? 0;
    entry.views += r.avg_views ?? 0;
    entry.count += 1;
  });

  const platforms = Object.entries(platformMap).map(([name, d]) => ({
    name,
    followers: d.followers,
    delta: `+${d.new_followers}`,
    engagementRate: d.count ? `${(d.engagements / d.count).toFixed(1)}%` : "—",
    avgViews: d.count ? Math.round(d.views / d.count).toLocaleString() : "—",
  }));

  // Growth data grouped by date
  const dateMap: Record<string, { followers: number; new_followers: number }> = {};
  records.forEach((r) => {
    const key = r.recorded_date;
    if (!dateMap[key]) dateMap[key] = { followers: 0, new_followers: 0 };
    dateMap[key].followers += r.followers;
    dateMap[key].new_followers += r.new_followers;
  });

  const growthData = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date,
      followers: vals.followers,
      newFollowers: vals.new_followers,
    }));

  return {
    totalFollowers,
    newThisMonth,
    avgEngagement,
    avgViews,
    platforms,
    topContent: EMPTY_TOP_CONTENT,
    growthData: growthData.length ? growthData : [{ date: "No data", followers: 0, newFollowers: 0 }],
  };
}

/* ─── AudiencePage ───────────────────────────────────────────────── */

export function AudiencePage() {
  const { data: records, isLoading, refetch } = useAudienceData();
  const [audienceModalOpen, setAudienceModalOpen] = useState(false);
  const ui = deriveFromRecords(records ?? []);

  return (
    <AnimatedPage>
      <AnimatedGroup stagger={0.1} delayChildren={0.05} className="flex flex-col gap-6">

        {/* ── Section 1: Header ───────────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div>
            <h1
              className="font-display font-bold"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--text-primary)",
              }}
            >
              Audience
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Track follower growth, engagement, and content reach across all platforms.
            </p>
          </div>
        </AnimatedItem>

        {/* ── Section 2: Summary KPIs ──────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {(() => {
              const totalFollowers = ui.totalFollowers;
              const newThisMonth = ui.newThisMonth;
              const avgEngagement = ui.avgEngagement;
              const avgViews = ui.avgViews;

              const followerChange = ((newThisMonth / (totalFollowers - newThisMonth + 1)) * 100).toFixed(1);
              const engagementChange = ((avgEngagement - 4.5) / 4.5 * 100).toFixed(1);
              const viewsChange = ((avgViews - 20000) / 20000 * 100).toFixed(1);

              return [
                { title: "Total Followers", rawValue: totalFollowers, prefix: "", suffix: "", change: `+${followerChange}%`, trend: "up" as const, period: "this month", icon: <Users size={15} />, accent: "cyan" as const },
                { title: "New This Month", rawValue: newThisMonth, prefix: "+", suffix: "", change: `+${followerChange}%`, trend: "up" as const, period: "followers", icon: <UserPlus size={15} />, accent: "default" as const },
                { title: "Avg. Engagement", rawValue: avgEngagement, prefix: "", suffix: "%", change: `${Number(engagementChange) >= 0 ? "+" : ""}${engagementChange}%`, trend: (Number(engagementChange) >= 0 ? "up" : "down") as "up" | "down", period: "rate", icon: <TrendingUp size={15} />, accent: "default" as const },
                { title: "Avg. Views / Post", rawValue: avgViews, prefix: "", suffix: "", change: `${Number(viewsChange) >= 0 ? "+" : ""}${viewsChange}%`, trend: (Number(viewsChange) >= 0 ? "up" : "down") as "up" | "down", period: "across platforms", icon: <Eye size={15} />, accent: "default" as const },
              ];
            })().map((kpi, i) => (
              <GlassKPI
                key={kpi.title}
                title={kpi.title}
                value={`${kpi.prefix}${kpi.rawValue}${kpi.suffix}`}
                rawValue={kpi.rawValue}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                change={kpi.change}
                trend={kpi.trend}
                period={kpi.period}
                icon={kpi.icon}
                accent={kpi.accent}
                animateValue
                delay={0.1 + i * 0.07}
              />
            ))}
          </div>
        </AnimatedItem>

        <GlassButton variant="outline" size="sm" leadingIcon={<Plus size={14} />} onClick={() => setAudienceModalOpen(true)}>
          Add Data
        </GlassButton>

        {/* ── Section 3: Growth chart ──────────────────────────── */}
        <AnimatedItem variant="fadeUp">
          <AudienceGrowthChart
            data={ui.growthData}
            platforms={ui.platforms.map((p, i) => ({
              name: p.name,
              count: p.followers,
              delta: p.delta,
              trend: "up" as const,
              color: i === 0 ? "var(--accent-cyan)" : i === 1 ? "var(--accent-purple)" : "var(--status-success)",
            }))}
          />
        </AnimatedItem>

        {/* ── Section 4: Platform breakdown ───────────────────── */}
        <AnimatedItem variant="fadeUp">
          <div>
            <h2
              className="mb-4 font-display font-semibold"
              style={{ fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-snug)", color: "var(--text-primary)" }}
            >
              By Platform
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {ui.platforms.map((p, i) => (
                <PlatformCard
                  key={p.name}
                  icon={i === 0 ? Youtube : i === 1 ? Twitter : Mail}
                  name={p.name}
                  followers={p.followers}
                  delta={p.delta}
                  trend="up"
                  engagementRate={p.engagementRate}
                  avgViews={p.avgViews}
                  accentColor={i === 0 ? "var(--accent-cyan)" : i === 1 ? "var(--accent-purple)" : "var(--status-success)"}
                  accentRgb={i === 0 ? "var(--accent-cyan-rgb)" : i === 1 ? "var(--accent-purple-rgb)" : "var(--status-success-rgb)"}
                  delay={0.1 + i * 0.08}
                />
              ))}
            </div>
          </div>
        </AnimatedItem>

        {/* ── Section 5: Top audience-driving content ──────────── */}
        <AnimatedItem variant="fadeUp">
          <GlassCard visual="default" padding="md">
            <h2
              className="mb-1 font-display font-semibold"
              style={{ fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-snug)", color: "var(--text-primary)" }}
            >
              Top Audience-Driving Content
            </h2>
            <p className="mb-4 text-xs" style={{ color: "var(--text-muted)" }}>
              Content pieces that brought the most new followers
            </p>
            <div>
              {ui.topContent.length > 0 ? (
                ui.topContent.map((item, i) => (
                  <TopContentRow key={item.title} {...item} index={i} />
                ))
              ) : (
                <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No data yet. Add your first audience records.
                </p>
              )}
            </div>
          </GlassCard>
        </AnimatedItem>

      </AnimatedGroup>
      <AddAudienceModal
        open={audienceModalOpen}
        onClose={() => setAudienceModalOpen(false)}
        onComplete={() => refetch()}
      />
    </AnimatedPage>
  );
}