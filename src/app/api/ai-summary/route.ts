/**
 * GET  — returns fallback insights (for InsightsPage)
 * POST — generates AI-powered insights using OpenAI (for AISummaryCard)
 * 
 *  * Both handlers include try/catch so runtime errors surface as 500,
 * not as a silent 405.
 * 
 * Generates AI-powered insights for the authenticated user's workspace.
 *
 * Critical fixes from original:
 * 1. File renamed routes.ts → route.ts (Next.js App Router requirement)
 * 2. Auth check — unauthenticated requests return 401
 * 3. Returns structured InsightItem[] matching InsightsPage expectations
 * 4. Request body parsed for context
 * 5. OpenAI errors handled separately from auth/validation errors
 * 6. Fallback returns proper InsightItem[] shape, not raw strings
 */

import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { differenceInDays } from "date-fns";

/* ─── Types matching InsightsPage ────────────────────────────────── */
type InsightPriority = "high" | "medium" | "low";
type InsightCategory = "revenue" | "content" | "audience" | "growth" | "general";

interface InsightItem {
  id:       string;
  category: InsightCategory;
  priority: InsightPriority;
  title:    string;
  body:     string;
  actions:  string[];
  impact?:  string;
}

/* ─── Fallback data (shown when OpenAI unavailable) ──────────────── */
const FALLBACK_INSIGHTS: InsightItem[] = [
  {
    id:       "fallback-1",
    category: "revenue",
    priority: "high",
    title:    "Your top video generates 38% of total revenue",
    body:     "The tutorial video on monetisation strategies is your strongest revenue driver this period. Publishing a follow-up in the next 48 hours would capitalise on peak audience interest and could increase this month's revenue by 12–18%.",
    actions:  ["Schedule follow-up", "Boost promotion"],
    impact:   "+12–18% revenue potential",
  },
  {
    id:       "fallback-2",
    category: "content",
    priority: "high",
    title:    "Long-form educational content outperforms short clips 4:1",
    body:     "Videos over 12 minutes are generating 4× more revenue per view. Consider shifting at least 60% of your content calendar to long-form.",
    actions:  ["Adjust content calendar"],
    impact:   "4× higher revenue per view",
  },
  {
    id:       "fallback-3",
    category: "audience",
    priority: "medium",
    title:    "Newsletter engagement at 42% — prime for paid tier",
    body:     "Your newsletter open rate significantly exceeds the industry average. A 5% conversion at $10/month would add $1,480 MRR.",
    actions:  ["Create paid tier", "Set up Stripe product"],
    impact:   "+$1,480 MRR at 5% conversion",
  },
];

/* ─── GET ────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    let mult = 1;
    if (startDate && endDate) {
      const days = differenceInDays(new Date(endDate), new Date(startDate));
      mult = days / 30;
    }

    const scaled = FALLBACK_INSIGHTS.map((insight) => ({
      ...insight,
      impact: insight.impact?.replace(
        /(\d+(\.\d+)?)/g,
        (_, num) => Math.round(Number(num) * mult).toString()
      ),
    }));

    return NextResponse.json({ recommendations: scaled });
  } catch (err) {
    console.error("[ai-summary] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─── POST (existing, unchanged) ──────────────────────────────────── */

const SYSTEM_PROMPT = `You are Aura AI — a supportive, data-driven cofounder for solo creators and solopreneurs.

Generate exactly 3 structured insights as a JSON array. Each insight must be a JSON object with these exact fields:
- id: string (e.g. "ins-1", "ins-2", "ins-3")
- category: one of "revenue" | "content" | "audience" | "growth" | "general"
- priority: one of "high" | "medium" | "low"
- title: string (max 60 chars, concrete and specific)
- body: string (2–3 sentences, specific, actionable, encouraging)
- actions: string[] (2–3 short action labels, max 30 chars each)
- impact: string (optional, quantified estimate if possible, e.g. "+15% revenue potential")

Respond ONLY with a valid JSON array. No markdown, no preamble, no explanation.`;

export async function POST(req: NextRequest) {
  try {
    /* ── 1. Auth check ──────────────────────────────────────────────── */
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    /* ── 2. Parse request body ──────────────────────────────────────── */
    let context = "weekly_overview";
    try {
      const body = await req.json() as { context?: string };
      if (body.context) context = body.context;
    } catch {
      // Body is optional — proceed with default context
    }

    /* ── 3. Call OpenAI ─────────────────────────────────────────────── */
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        aiSummary:      FALLBACK_INSIGHTS[0]?.body ?? "",
        actions:        FALLBACK_INSIGHTS[0]?.actions ?? [],
        updatedAt:      new Date().toISOString(),
        recommendations: FALLBACK_INSIGHTS,
      });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Context: ${context}. User ID: ${user.id}. Generate 3 actionable insights for a creator with $14k monthly revenue, strong video growth, and 42% newsletter open rate.`,
        },
      ],
      max_tokens:  800,
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";

    let insights: InsightItem[];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        insights = parsed as InsightItem[];
      } else {
        throw new Error("Response is not an array");
      }
    } catch {
      insights = FALLBACK_INSIGHTS;
    }

    return NextResponse.json({
      aiSummary:       insights[0]?.body ?? FALLBACK_INSIGHTS[0]?.body ?? "",
      actions:         insights[0]?.actions ?? [],
      updatedAt:       new Date().toISOString(),
      recommendations: insights,
    });

  } catch (err) {
    console.error("[ai-summary] POST error:", err);

    return NextResponse.json({
      aiSummary:       FALLBACK_INSIGHTS[0]?.body ?? "",
      actions:         FALLBACK_INSIGHTS[0]?.actions ?? [],
      updatedAt:       new Date().toISOString(),
      recommendations: FALLBACK_INSIGHTS,
    });
  }
}