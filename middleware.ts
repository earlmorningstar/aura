/**
 * Aura Middleware
 *
 * Logic is inverted from the naive approach:
 * - Define what is PROTECTED (small, stable list)
 * - Define what is AUTH-ONLY (redirect away when already signed in)
 * - Everything else is public by default — no allowlist to maintain
 *
 * Auth validation uses getUser() (server-validated JWT), never getSession().
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes that require an active session.
 * Any pathname that STARTS WITH one of these is protected.
 * Add new app sections here — nowhere else.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/settings",
  "/account",
  "/onboarding",
] as const;

/**
 * Routes that should redirect authenticated users away.
 * (No point showing login to someone already signed in.)
 */
const AUTH_ONLY_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

/**
 * Paths the middleware should never touch.
 * Next.js internals, static assets, API routes.
 */
const BYPASS_PREFIXES = [
  "/_next/",
  "/api/",
  "/favicon",
] as const;

const BYPASS_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$/i;

function classify(pathname: string): "bypass" | "protected" | "auth-only" | "public" {
  if (
    BYPASS_PREFIXES.some((p) => pathname.startsWith(p)) ||
    BYPASS_EXTENSIONS.test(pathname)
  ) return "bypass";

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) return "protected";
  if (AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) return "auth-only";

  return "public"; // ← default: everything else is public
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const routeType = classify(pathname);

  // Static assets and internals — skip Supabase entirely for performance
  if (routeType === "bypass") return NextResponse.next();

  // ── Supabase session refresh ──────────────────────────────────
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() — always validates against Supabase server, never trust getSession() here
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthed = !!user;

  // Redirect to onboarding if display name is missing (and not already on onboarding)
  if (isAuthed && pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    if (!profile?.display_name) {
      const redirect = NextResponse.redirect(new URL("/onboarding", request.url));
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
      return redirect;
    }
  }

  // ── Route guards ──────────────────────────────────────────────

  if (!isAuthed && routeType === "protected") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
    return redirect;
  }

  if (isAuthed && routeType === "auth-only") {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
    return redirect;
  }

  // Public routes and authenticated app routes — just pass through
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
};