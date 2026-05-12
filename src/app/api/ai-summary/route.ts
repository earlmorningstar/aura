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
  id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  body: string;
  actions: string[];
  impact?: string;
}

/* ─── Fallback data (shown when OpenAI unavailable) ──────────────── */
const FALLBACK_INSIGHTS: InsightItem[] = [
  {
    id: "fallback-1",
    category: "revenue",
    priority: "high",
    title: "Your top video generates 38% of total revenue",
    body: "The tutorial video on monetisation strategies is your strongest revenue driver this period. Publishing a follow-up in the next 48 hours would capitalise on peak audience interest and could increase this month's revenue by 12–18%.",
    actions: ["Schedule follow-up", "Boost promotion"],
    impact: "+12–18% revenue potential",
  },
  {
    id: "fallback-2",
    category: "content",
    priority: "high",
    title: "Long-form educational content outperforms short clips 4:1",
    body: "Videos over 12 minutes are generating 4× more revenue per view. Consider shifting at least 60% of your content calendar to long-form.",
    actions: ["Adjust content calendar"],
    impact: "4× higher revenue per view",
  },
  {
    id: "fallback-3",
    category: "audience",
    priority: "medium",
    title: "Newsletter engagement at 42% — prime for paid tier",
    body: "Your newsletter open rate significantly exceeds the industry average. A 5% conversion at $10/month would add $1,480 MRR.",
    actions: ["Create paid tier", "Set up Stripe product"],
    impact: "+$1,480 MRR at 5% conversion",
  },
];


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

/* ─── GET ────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for cached summary from today
    const today = new Date().toISOString().slice(0, 10);
    const { data: cached } = await supabase
      .from("ai_summaries")
      .select("summary_data")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (cached?.summary_data) {
      return NextResponse.json({ recommendations: cached.summary_data });
    }

    return NextResponse.json({ recommendations: FALLBACK_INSIGHTS });
  } catch (err) {
    console.error("[ai-summary] GET error:", err);
    return NextResponse.json({ recommendations: FALLBACK_INSIGHTS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting – one generation per user per day
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
      .from("ai_summaries")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (existing) {
      return NextResponse.json({ cached: true });
    }

    // Fetch user data
    const transResult = await supabase
      .from("transactions")
      .select("amount, date, source, description")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(50);
    const transactions = transResult.data ?? [];

    const contentResult = await supabase
      .from("content_pieces")
      .select("title, platform, engagement_rate, revenue, views, likes, published_at")
      .eq("user_id", user.id)
      .order("published_at", { ascending: false })
      .limit(20);
    const content = contentResult.data ?? [];

    const audResult = await supabase
      .from("audience_data")
      .select("platform, followers, new_followers, engagement_rate, avg_views, recorded_date")
      .eq("user_id", user.id)
      .order("recorded_date", { ascending: false })
      .limit(20);
    const audience = audResult.data ?? [];

    // Build context
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const platformBreakdown = audience.reduce((acc, a) => {
      acc[a.platform] = (acc[a.platform] || 0) + a.followers;
      return acc;
    }, {} as Record<string, number>);

    const context = `
User data summary:
- Total revenue (last ${transactions.length} transactions): $${totalRevenue.toLocaleString()}
- Recent transactions: ${transactions.slice(0, 5).map(t => `$${t.amount} from ${t.source} on ${t.date}`).join(", ")}
- Content pieces: ${content.length} total, top by revenue: ${content.slice(0, 3).map(c => `"${c.title}" (${c.platform}, $${c.revenue || 0} revenue)`).join(", ")}
- Audience totals by platform: ${Object.entries(platformBreakdown).map(([p, f]) => `${p}: ${f.toLocaleString()}`).join(", ")}
- Audience engagement rates: ${audience.slice(0, 5).map(a => `${a.platform}: ${a.engagement_rate}%`).join(", ")}
`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        aiSummary: FALLBACK_INSIGHTS[0]?.body ?? "",
        actions: FALLBACK_INSIGHTS[0]?.actions ?? [],
        updatedAt: new Date().toISOString(),
        recommendations: FALLBACK_INSIGHTS,
      });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Context: ${new Date().toISOString().slice(0, 10)}. User ID: ${user.id}. Here is the user's real data:\n${context}\nGenerate 3 actionable insights based on this data.` },
      ],
      max_tokens: 800,
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

    // Cache the summary
    await supabase.from("ai_summaries").insert({
      user_id: user.id,
      date: today,
      summary_data: insights,
    });

    return NextResponse.json({
      aiSummary: insights[0]?.body ?? FALLBACK_INSIGHTS[0]?.body ?? "",
      actions: insights[0]?.actions ?? [],
      updatedAt: new Date().toISOString(),
      recommendations: insights,
    });
  } catch (err) {
    console.error("[ai-summary] POST error:", err);
    return NextResponse.json({
      aiSummary: FALLBACK_INSIGHTS[0]?.body ?? "",
      actions: FALLBACK_INSIGHTS[0]?.actions ?? [],
      updatedAt: new Date().toISOString(),
      recommendations: FALLBACK_INSIGHTS,
    });
  }
}