/**
 * POST /api/ai-chat
 *
 * Answers user questions using OpenAI.
 * Reads the Supabase session cookie explicitly to avoid auth failures.
 */

import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { question?: string };
    const question = body.question?.trim();
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Fetch user data for context
    const transResult = await supabase
      .from("transactions")
      .select("amount, date, source")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20);
    const transactions = transResult.data ?? [];

    const contentResult = await supabase
      .from("content_pieces")
      .select("title, platform, engagement_rate, revenue, views, published_at")
      .eq("user_id", user.id)
      .order("published_at", { ascending: false })
      .limit(10);
    const content = contentResult.data ?? [];

    const audResult = await supabase
      .from("audience_data")
      .select("platform, followers, new_followers, engagement_rate")
      .eq("user_id", user.id)
      .order("recorded_date", { ascending: false })
      .limit(10);
    const audience = audResult.data ?? [];

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const context = `
User data:
- Total revenue (recent): $${totalRevenue.toLocaleString()}
- Recent transactions: ${transactions.slice(0, 5).map(t => `$${t.amount} from ${t.source}`).join(", ")}
- Content pieces: ${content.length} total, top: ${content.slice(0, 3).map(c => `"${c.title}" (${c.platform})`).join(", ")}
- Audience: ${audience.slice(0, 5).map(a => `${a.platform}: ${a.followers.toLocaleString()} followers`).join(", ")}
`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ answer: "I'm currently unavailable. Please try again later." });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Aura AI, a helpful and concise business assistant for creators. Use the following user data to give personalised answers.\n\n${context}`,
        },
        { role: "user", content: question },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const answer = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate an answer.";
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[ai-chat] Error:", err);
    return NextResponse.json({ answer: "Something went wrong. Please try again." }, { status: 500 });
  }
}