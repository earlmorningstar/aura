/**
 * GET /auth/callback
 *
 * Handles the OAuth and magic-link callback from Supabase Auth.
 * Exchanges the `code` from the URL for a session, then redirects
 * the user to their intended destination.
 *
 * This route is required for both:
 * - Magic link authentication (email OTP flow)
 * - OAuth providers (Google)
 *
 * Without this route, Supabase would redirect to /auth/callback and
 * get a 404, leaving the user signed out.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("redirectTo") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Exchange error:", error.message);
    return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
  }

  // Check if the user needs to complete onboarding
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // User is onboarded → go to the intended page
  return NextResponse.redirect(new URL(next, req.url));
}