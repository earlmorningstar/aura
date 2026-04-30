/**
 * POST /api/ai-chat
 *
 * Answers user questions using OpenAI.
 * Reads the Supabase session cookie explicitly to avoid auth failures.
 */

import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Temporary debug: list all cookie names reaching this route
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log(
      "[ai-chat] Cookie names:",
      allCookies
        .map((c: { name: string; value: string }) => c.name)
        .join(", ")
    );

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[ai-chat] Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const question = body.question?.trim();
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        answer: "I'm currently unavailable. Please try again later.",
      });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Aura AI, a helpful and concise business assistant for creators. Keep answers brief and friendly.",
        },
        { role: "user", content: question },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const answer =
      completion.choices[0]?.message?.content ??
      "Sorry, I couldn't generate an answer.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[ai-chat] Unhandled error:", err);
    return NextResponse.json(
      { answer: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}