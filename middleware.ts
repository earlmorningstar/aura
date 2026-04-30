/**
 * Aura Middleware
 *
 * Responsibilities:
 * 1. Refresh the Supabase session cookie on every request
 * 2. Guard protected routes — redirect unauthenticated users to /login
 * 3. Redirect authenticated users away from auth-only pages (e.g. /login)
 *
 * Security note:
 * We use supabase.auth.getUser() — NOT getSession() — for server-side auth
 * checks. getSession() reads the JWT from the cookie without re-validating it
 * against Supabase's server, making it unsafe for access-control decisions.
 * getUser() always hits the Supabase Auth server to verify the token.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* ─── Route classification ──────────────────────────────────────
 * PUBLIC       — accessible without authentication
 * AUTH_ONLY    — only for unauthenticated users (redirect away when authed)
 * Everything else is treated as PROTECTED.
 * ──────────────────────────────────────────────────────────────── */
const PUBLIC_ROUTES: readonly string[] = [
  "/", 
  "/login", 
  "/auth/callback"
];

const AUTH_ONLY_ROUTES: readonly string[] = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

/** Prefixes that are always public (API routes, assets, Next internals) */
const ALWAYS_PUBLIC_PREFIXES: readonly string[] = [
  "/api/",
  "/_next/",
  "/favicon",
];

function classifyPath(pathname: string): "public" | "auth-only" | "protected" {
  // Static assets, API routes, Next.js internals — never intercept
  if (ALWAYS_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return "public";
  }

  if (PUBLIC_ROUTES.includes(pathname)) return "public";
  if (AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) return "auth-only";

  return "protected";
}

export async function middleware(request: NextRequest) {
  /**
   * We need a mutable response reference so the Supabase client can set/remove
   * cookies. Each cookie mutation calls NextResponse.next() with the updated
   * request, ensuring downstream handlers see fresh cookies.
   */
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Write onto the mutated request so the Server Component sees them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // 2. Rebuild the response with the updated request headers
          supabaseResponse = NextResponse.next({ request });
          // 3. Write onto the response so the browser sees the Set-Cookie header
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  /**
   * IMPORTANT: Do not add any logic between createServerClient and getUser().
   * A simple mistake here can make it very hard to debug issues with users
   * being randomly logged out.
   *
   * getUser() validates the JWT with the Supabase Auth server — never skip this
   * in favour of getSession() for server-side access control.
   */
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const routeType = classifyPath(pathname);
  const isAuthenticated = !!user && !error;

  // ── Route guard logic ───────────────────────────────────────── //

  // Authenticated users should not access login/signup pages
  if (isAuthenticated && routeType === "auth-only") {
    const dashboardUrl = new URL("/dashboard", request.url);
    const redirect = NextResponse.redirect(dashboardUrl);
    // Forward any cookies the Supabase client set
    supabaseResponse.cookies.getAll().forEach((c) =>
      redirect.cookies.set(c.name, c.value),
    );
    return redirect;
  }

  // Unauthenticated users cannot access protected routes
  if (!isAuthenticated && routeType === "protected") {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect after login
    loginUrl.searchParams.set("redirectTo", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    // Forward any cookies the Supabase client set (e.g. PKCE state)
    supabaseResponse.cookies.getAll().forEach((c) =>
      redirect.cookies.set(c.name, c.value),
    );
    return redirect;
  }

  /**
   * IMPORTANT: Return supabaseResponse — not a new NextResponse.next() —
   * so that cookie mutations (session refresh) are preserved for the browser.
   */
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on all paths EXCEPT:
     * - _next/static  (bundled assets)
     * - _next/image   (image optimiser)
     * - favicon.ico
     * - Common static file extensions
     *
     * The negative lookahead keeps the matcher concise and fast.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
};