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
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Exchange error:", error.message);
    return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
  }

  return NextResponse.redirect(new URL(redirectTo, req.url));
}